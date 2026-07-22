import { NextResponse } from "next/server";
import {
  tokenRouterConfigured,
  tokenRouterKey,
  TOKENROUTER_BASE_URL,
  ASISTEN_MODEL,
} from "@/lib/ai";
import { retrieve, SISTEM_ASISTEN } from "@/lib/rag";
import { klaimKuotaGlobal } from "@/lib/kuota";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Turn {
  role: "user" | "assistant";
  text: string;
}

export async function POST(req: Request) {
  if (!tokenRouterConfigured()) {
    return NextResponse.json(
      {
        degraded: true,
        error:
          "Asisten AI belum dikonfigurasi. Gunakan Telusur atau Tabel Gejala.",
      },
      { status: 503 },
    );
  }

  let body: { question?: unknown; fokus?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  const fokus = typeof body.fokus === "string" ? body.fokus : undefined;
  if (!question) {
    return NextResponse.json({ error: "Pertanyaan kosong." }, { status: 400 });
  }
  if (question.length > 1000) {
    return NextResponse.json(
      { error: "Pertanyaan terlalu panjang." },
      { status: 400 },
    );
  }

  const history: Turn[] = Array.isArray(body.history)
    ? (body.history as unknown[])
        .filter(
          (t): t is Turn =>
            !!t &&
            typeof t === "object" &&
            (((t as Turn).role === "user") ||
              (t as Turn).role === "assistant") &&
            typeof (t as Turn).text === "string",
        )
        .slice(-6)
    : [];

  // Plafon global harian (pengaman biaya). Diklaim setelah pertanyaan valid,
  // sebelum RAG & panggilan model. Batas asisten lebih longgar dari foto.
  if (!klaimKuotaGlobal("asisten").ok) {
    return NextResponse.json(
      {
        error:
          "Kuota asisten harian aplikasi sudah tercapai. Coba lagi besok, atau gunakan Telusur / Tabel Gejala.",
      },
      { status: 429 },
    );
  }

  const { context } = retrieve(question, fokus);

  // Format OpenAI-compatible: system sebagai pesan pertama, lalu riwayat, lalu
  // pertanyaan terbungkus konteks RAG. temperature tidak dikirim demi
  // kompatibilitas lintas model.
  const messages = [
    { role: "system" as const, content: SISTEM_ASISTEN },
    ...history.map((t) => ({ role: t.role, content: t.text })),
    {
      role: "user" as const,
      content: `KONTEKS BUKU:\n${context}\n\n---\nPERTANYAAN: ${question}\n\nJawab HANYA dari KONTEKS di atas, sertakan "Sumber: entri <nama>". Bila tidak ada di konteks, katakan belum tersedia di buku saku.`,
    },
  ];

  let upstream: Response;
  try {
    upstream = await fetch(`${TOKENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRouterKey()}`,
      },
      body: JSON.stringify({
        model: ASISTEN_MODEL,
        max_tokens: 1024,
        stream: true,
        messages,
      }),
      signal: AbortSignal.timeout(55_000),
    });
  } catch (err) {
    console.error("asisten fetch error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada asisten. Coba lagi nanti." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    console.error("asisten upstream status:", upstream.status);
    const status = upstream.status === 429 ? 429 : 502;
    const msg =
      upstream.status === 429
        ? "Asisten sedang sibuk. Coba beberapa saat lagi."
        : "Terjadi kesalahan pada asisten. Coba lagi nanti.";
    return NextResponse.json({ error: msg }, { status });
  }

  // Terjemahkan SSE OpenAI-compatible -> teks mentah (kontrak dengan AsistenClient
  // yang membaca body stream apa adanya).
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const rs = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? ""; // simpan potongan baris terakhir
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const j = JSON.parse(payload);
              const delta = j.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // abaikan keep-alive / baris non-JSON
            }
          }
        }
      } catch (err) {
        console.error("asisten stream error:", err);
        controller.enqueue(
          encoder.encode("\n\n⚠️ Maaf, terjadi gangguan pada layanan AI."),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(rs, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
