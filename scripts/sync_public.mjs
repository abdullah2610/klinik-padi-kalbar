// Salin aset sumber-kebenaran ke folder public/ Next.js.
// data/konten.json  -> public/konten.json
// assets/photos/*   -> public/assets/photos/*
// Dijalankan otomatis via predev/prebuild agar app selalu memakai konten terbaru.
import { cp, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
    await cp(photosSrc, photosDst, { recursive: true });
  }
  console.log("sync_public: konten.json + foto disalin ke public/");
}

main().catch((e) => {
  console.error("sync_public gagal:", e.message);
  process.exit(1);
});
