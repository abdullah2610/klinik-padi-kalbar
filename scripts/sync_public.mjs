// Salin aset sumber-kebenaran ke folder public/ Next.js.
// data/konten.json  -> public/konten.json
// assets/photos/*.png -> public/assets/photos/*.webp (dikodekan ulang, ~88% lebih kecil)
// Dijalankan otomatis via predev/prebuild agar app selalu memakai konten terbaru.
//
// Foto entri dikodekan ke WebP di sini (build-time), bukan disalin mentah:
// menghemat unduhan pertama tiap petani (service worker cache foto). export_konten.py
// sudah menulis foto.path berekstensi .webp agar selaras dengan keluaran ini.
import { mkdir, copyFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KUALITAS_WEBP = 82; // 88% lebih kecil dari PNG, mutu tampilan tetap baik.
const KE_WEBP = new Set([".png", ".jpg", ".jpeg"]);

async function main() {
  const konten = resolve(ROOT, "data/konten.json");
  if (!existsSync(konten)) {
    throw new Error(`data/konten.json tidak ditemukan — jalankan 'npm run export:konten' dulu.`);
  }
  await mkdir(resolve(ROOT, "public/assets"), { recursive: true });
  await copyFile(konten, resolve(ROOT, "public/konten.json"));

  const photosSrc = resolve(ROOT, "assets/photos");
  const photosDst = resolve(ROOT, "public/assets/photos");
  if (existsSync(photosSrc)) {
    // Bersihkan keluaran lama agar tak ada berkas yatim dari build sebelumnya.
    await rm(photosDst, { recursive: true, force: true });
    await mkdir(photosDst, { recursive: true });

    let webp = 0;
    let salin = 0;
    for (const nama of await readdir(photosSrc)) {
      const src = resolve(photosSrc, nama);
      const ext = extname(nama).toLowerCase();
      if (KE_WEBP.has(ext)) {
        const dst = resolve(photosDst, nama.slice(0, -ext.length) + ".webp");
        const buf = await sharp(src).webp({ quality: KUALITAS_WEBP }).toBuffer();
        await writeFile(dst, buf);
        webp++;
      } else {
        // Berkas non-gambar (mis. .svg) disalin apa adanya.
        await copyFile(src, resolve(photosDst, nama));
        salin++;
      }
    }
    console.log(`sync_public: ${webp} foto -> WebP, ${salin} disalin apa adanya`);
  }
  console.log("sync_public: konten.json + foto disiapkan di public/");
}

main().catch((e) => {
  console.error("sync_public gagal:", e.message);
  process.exit(1);
});
