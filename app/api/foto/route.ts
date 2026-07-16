import { NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClient, aiConfigured, MODEL, MEDIA_TYPES } from "@/lib/ai";
import { SISTEM_VISI, kelasList } from "@/lib/rag";
import { allSlugs, entryBySlug } from "@/lib/konten";

export const runtime = "nodejs";
export const maxDuration = 60;

const SLUGS = allSlugs() as [string, ...string[]];

const Kandidat = z.object({
  slug: z.enum(SLUGS),
  nama: z.string(),
  kategori: z.enum(["hama", "penyakit", "hara"]),
  keyakinan: z.number(),
  alasan: z.string(),
});
const Hasil = z.object({
  kandidat: z.array(Kandidat),
  cukup_yakin: z.boolean(),
  catatan: z.string(),
});

const MAX_BYTES = 8 * 1024 * 1024; // 8MB base64

export async function POST(req: Request) {
  if (!aiConfigured()) {
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

  try {
    const client = getClient();
    const res = await client.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      system: SISTEM_VISI + kelasList(),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: image,
              },
            },
            {
              type: "text",
              text: "Identifikasi gangguan pada foto padi ini. Beri kandidat berurutan dengan keyakinan dan alasan ciri yang teramati. Jika tak yakin, katakan.",
            },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(Hasil) },
    });

    if (res.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Permintaan tidak dapat diproses. Coba foto lain." },
        { status: 422 },
      );
    }

    const parsed = res.parsed_output;
    if (!parsed) {
      return NextResponse.json(
        { error: "Gagal membaca hasil. Coba lagi." },
        { status: 502 },
      );
    }

    // Perkaya kandidat dengan data entri + urutkan menurun; batasi 5.
    const kandidat = parsed.kandidat
      .map((k) => {
        const e = entryBySlug(k.slug);
        return {
          slug: k.slug,
          nama: e?.nama ?? k.nama,
          kategori: e?.kategori ?? k.kategori,
          nama_latin: e?.nama_latin ?? "",
          foto_path: e?.foto.ada_foto ? e.foto.path : null,
          keyakinan: Math.max(0, Math.min(100, Math.round(k.keyakinan))),
          alasan: k.alasan,
        };
      })
      .sort((a, b) => b.keyakinan - a.keyakinan)
      .slice(0, 5);

    return NextResponse.json({
      kandidat,
      cukup_yakin: parsed.cukup_yakin && kandidat.length > 0,
      catatan: parsed.catatan,
    });
  } catch (err) {
    console.error("foto diagnosa error:", err);
    const e = err as { status?: number; message?: string };
    const status = e.status === 429 ? 429 : 502;
    const msg =
      e.status === 429
        ? "Layanan AI sedang sibuk. Coba beberapa saat lagi."
        : "Terjadi kesalahan pada layanan AI. Coba lagi nanti.";
    return NextResponse.json({ error: msg }, { status });
  }
}
