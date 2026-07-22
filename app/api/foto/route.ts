import { NextResponse } from "next/server";
import { z } from "zod";
import {
  tokenRouterConfigured,
  tokenRouterKey,
  TOKENROUTER_BASE_URL,
  FOTO_MODEL,
  MEDIA_TYPES,
} from "@/lib/ai";
import { SISTEM_VISI, kelasList } from "@/lib/rag";
import { allSlugs, entryBySlug } from "@/lib/konten";
import { produkByEntri } from "@/lib/produk";
import { klaimKuotaGlobal } from "@/lib/kuota";

export const runtime = "nodejs";
// Default gpt-4o-mini: latensi ~2-3s. maxDuration cukup 60s; naikkan bila
// mengganti ke model penalar yang lebih lambat lewat TOKENROUTER_FOTO_MODEL.
export const maxDuration = 60;

const KNOWN_SLUGS = new Set(allSlugs());

// Kelas tertutup divalidasi lewat KNOWN_SLUGS saat pemetaan, bukan enum ketat —
// agar satu slug meleset dari model tidak menggagalkan seluruh hasil.
const Kandidat = z.object({
  slug: z.string(),
  nama: z.string().optional().default(""),
  kategori: z.enum(["hama", "penyakit", "hara"]).optional(),
  keyakinan: z.coerce.number(),
  alasan: z.string().optional().default(""),
});
const Hasil = z.object({
  kandidat: z.array(Kandidat).default([]),
  cukup_yakin: z.boolean().default(false),
  catatan: z.string().optional().default(""),
});

// Batas body Vercel Functions 4.5MB, jadi 8MB sebelumnya tak pernah tercapai:
// request ditolak platform sebelum handler jalan dan pengguna melihat error
// mentah, bukan pesan berbahasa Indonesia di bawah. Klien mengompres ke 1280px
// (lib/foto.ts) yang pada foto 12MP terburuk menghasilkan ~200KB base64;
// 1.5MB memberi ruang longgar sekaligus tetap menolak unggahan mentah.
const MAX_BYTES = 1.5 * 1024 * 1024; // panjang string base64

// Kontrak JSON eksplisit — endpoint OpenAI-compatible pakai response_format
// json_object (bukan schema ketat), jadi bentuk keluaran dipandu lewat prompt.
const FORMAT_JSON = `\n\nWAJIB: balas HANYA satu objek JSON valid (tanpa teks lain, tanpa markdown) berbentuk persis:
{"kandidat":[{"slug":"<salah satu slug dari DAFTAR KELAS>","nama":"nama gangguan","kategori":"hama|penyakit|hara","keyakinan":0-100,"alasan":"ciri yang teramati"}],"cukup_yakin":true,"catatan":"catatan singkat"}
Pakai HANYA slug dari DAFTAR KELAS di atas. Bila ragu: kosongkan "kandidat" dan set "cukup_yakin" false.`;

interface ChatResponse {
  choices?: {
    finish_reason?: string;
    message?: { content?: string };
  }[];
}

export async function POST(req: Request) {
  if (!tokenRouterConfigured()) {
    return NextResponse.json(
      {
        degraded: true,
        error:
          "Fitur AI belum dikonfigurasi. Gunakan Tabel Gejala untuk diagnosa tanpa AI.",
      },
      { status: 503 },
    );
  }

  let body: { image?: unknown; mediaType?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const image = typeof body.image === "string" ? body.image : "";
  const mediaType = typeof body.mediaType === "string" ? body.mediaType : "";

  if (!image || !MEDIA_TYPES.has(mediaType)) {
    return NextResponse.json(
      { error: "Foto tidak valid. Kirim JPEG/PNG/WebP." },
      { status: 400 },
    );
  }
  if (image.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "Foto terlalu besar. Coba foto beresolusi lebih kecil." },
      { status: 413 },
    );
  }

  // Plafon global harian (pengaman biaya). Diklaim hanya setelah permintaan
  // valid, tepat sebelum memanggil model. Lihat lib/kuota.ts untuk batasannya.
  if (!klaimKuotaGlobal("foto").ok) {
    return NextResponse.json(
      {
        error:
          "Kuota diagnosa foto harian aplikasi sudah tercapai. Coba lagi besok, atau gunakan Tabel Gejala.",
      },
      { status: 429 },
    );
  }

  let resp: Response;
  try {
    resp = await fetch(`${TOKENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenRouterKey()}`,
      },
      body: JSON.stringify({
        // temperature sengaja tidak dikirim demi kompatibilitas lintas model
        // (sebagian model, mis. kimi-k2.6, hanya menerima nilai 1).
        // max_tokens longgar: cukup untuk JSON jawaban, dan menampung token
        // penalaran bila TOKENROUTER_FOTO_MODEL diganti ke model penalar.
        model: FOTO_MODEL,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SISTEM_VISI + kelasList() + FORMAT_JSON },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mediaType};base64,${image}` },
              },
              {
                type: "text",
                text: "Identifikasi gangguan pada foto padi ini. Beri kandidat berurutan dengan keyakinan dan alasan ciri yang teramati. Jika tak yakin, katakan.",
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (err) {
    console.error("foto diagnosa fetch error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada layanan AI. Coba lagi nanti." },
      { status: 502 },
    );
  }

  if (!resp.ok) {
    console.error("foto diagnosa upstream status:", resp.status);
    const status = resp.status === 429 ? 429 : 502;
    const msg =
      resp.status === 429
        ? "Layanan AI sedang sibuk. Coba beberapa saat lagi."
        : "Terjadi kesalahan pada layanan AI. Coba lagi nanti.";
    return NextResponse.json({ error: msg }, { status });
  }

  let data: ChatResponse;
  try {
    data = (await resp.json()) as ChatResponse;
  } catch {
    return NextResponse.json(
      { error: "Gagal membaca hasil. Coba lagi." },
      { status: 502 },
    );
  }

  const choice = data.choices?.[0];
  if (choice?.finish_reason === "content_filter") {
    return NextResponse.json(
      { error: "Permintaan tidak dapat diproses. Coba foto lain." },
      { status: 422 },
    );
  }

  const content = choice?.message?.content;
  if (!content) {
    return NextResponse.json(
      { error: "Gagal membaca hasil. Coba lagi." },
      { status: 502 },
    );
  }

  const parsed = Hasil.safeParse(safeJson(content));
  if (!parsed.success) {
    console.error("foto diagnosa parse error:", parsed.error?.message);
    return NextResponse.json(
      { error: "Gagal membaca hasil. Coba lagi." },
      { status: 502 },
    );
  }

  // Perkaya kandidat dengan data entri, buang slug di luar kelas tertutup,
  // urutkan menurun; batasi 5.
  const kandidat = parsed.data.kandidat
    .filter((k) => KNOWN_SLUGS.has(k.slug))
    .map((k) => {
      const e = entryBySlug(k.slug);
      return {
        slug: k.slug,
        nama: e?.nama ?? k.nama,
        kategori: e?.kategori ?? k.kategori ?? "hama",
        nama_latin: e?.nama_latin ?? "",
        foto_path: e?.foto.ada_foto ? e.foto.path : null,
        keyakinan: Math.max(0, Math.min(100, Math.round(k.keyakinan))),
        alasan: k.alasan,
        produk: produkByEntri(k.slug).produk,
      };
    })
    .sort((a, b) => b.keyakinan - a.keyakinan)
    .slice(0, 5);

  return NextResponse.json({
    kandidat,
    cukup_yakin: parsed.data.cukup_yakin && kandidat.length > 0,
    catatan: parsed.data.catatan,
  });
}

/** Ekstrak objek JSON dari konten; toleran bila model membungkus dengan ```json atau teks. */
function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
