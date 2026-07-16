import { NextResponse } from "next/server";
import { getClient, aiConfigured, MODEL } from "@/lib/ai";
import { retrieve, SISTEM_ASISTEN } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Turn {
  role: "user" | "assistant";
  text: string;
}

export async function POST(req: Request) {
  if (!aiConfigured()) {
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

  const { context } = retrieve(question, fokus);

  const messages = [
    ...history.map((t) => ({ role: t.role, content: t.text })),
    {
      role: "user" as const,
      content: `KONTEKS BUKU:\n${context}\n\n---\nPERTANYAAN: ${question}\n\nJawab HANYA dari KONTEKS di atas, sertakan "Sumber: entri <nama>". Bila tidak ada di konteks, katakan belum tersedia di buku saku.`,
    },
  ];

  try {
    const client = getClient();
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: SISTEM_ASISTEN,
      messages,
    });

    const encoder = new TextEncoder();
    const rs = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
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
  } catch (err) {
    console.error("asisten error:", err);
    const e = err as { status?: number };
    const status = e.status === 429 ? 429 : 502;
    const msg =
      e.status === 429
        ? "Asisten sedang sibuk. Coba beberapa saat lagi."
        : "Terjadi kesalahan pada asisten. Coba lagi nanti.";
    return NextResponse.json({ error: msg }, { status });
  }
}
