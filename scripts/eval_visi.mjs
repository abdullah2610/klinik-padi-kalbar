// Harness evaluasi fitur diagnosa visi (/api/foto).
//
// Mengukur DUA hal berbeda:
//   - STABILITAS : foto sama -> jawaban sama? (tak butuh label; N ulangan/foto).
//     Model tanpa kendali temperature bersifat non-deterministik; stabilitas
//     rendah = fitur tak dapat diandalkan walau kadang benar.
//   - AKURASI    : jawaban == label ground-truth? (hanya untuk foto berlabel).
//
// Foto dikompres MENIRU lib/foto.ts (1280px, WebP, quality 0.85->0.55 sampai
// <=72KB) agar yang diukur adalah yang benar-benar diterima pengguna, bukan
// gambar mentah. Memanggil /api/foto yang berjalan, jadi prompt + parsing +
// filter kelas-tertutup identik produksi.
//
// Pakai:
//   node scripts/eval_visi.mjs --dir <folder-foto> --manifest data/eval/manifest.json --ulangan 5
//   (server dev harus hidup: npm run dev)
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { readdirSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";

// ---- argumen ----
const arg = (nama, def) => {
  const i = process.argv.indexOf(`--${nama}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const DIR = arg("dir", "data/eval/foto");
const MANIFEST = arg("manifest", "data/eval/manifest.json");
const ULANGAN = Number(arg("ulangan", "5"));
const API = arg("api", "http://localhost:3000/api/foto");

// ---- kompresi cermin lib/foto.ts ----
const TARGET = 72 * 1024;
const QUALITIES = (() => {
  const l = [];
  for (let q = 0.85; q >= 0.55 - 1e-9; q -= 0.07) l.push(Math.round(q * 100) / 100);
  return l;
})();

async function kompres(buf) {
  const base = sharp(buf)
    .rotate() // koreksi EXIF, setara imageOrientation: from-image
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true });
  let terkecil = null;
  for (const q of QUALITIES) {
    const o = await base.clone().webp({ quality: Math.round(q * 100) }).toBuffer();
    if (!terkecil || o.length < terkecil.length) terkecil = o;
    if (o.length <= TARGET) return o;
  }
  return terkecil;
}

async function diagnosa(b64) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: b64, mediaType: "image/webp" }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return { err: j.error ?? `HTTP ${res.status}`, kandidat: [] };
    return { kandidat: j.kandidat ?? [] };
  } catch (e) {
    return { err: e.message, kandidat: [] };
  }
}

const modus = (arr) => {
  const c = {};
  for (const x of arr) c[x] = (c[x] ?? 0) + 1;
  const [nama, n] = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return { nama, n };
};

// ---- muat daftar foto + label ----
async function muatDaftar() {
  if (existsSync(MANIFEST)) {
    const m = JSON.parse(await readFile(MANIFEST, "utf8"));
    return (m.foto ?? []).map((f) => ({ file: f.file, label: f.label ?? null }));
  }
  // Tanpa manifest: pakai semua gambar di DIR, label null.
  return readdirSync(DIR)
    .filter((f) => [".jpg", ".jpeg", ".png", ".webp"].includes(extname(f).toLowerCase()))
    .map((f) => ({ file: f, label: null }));
}

async function main() {
  const daftar = await muatDaftar();
  if (!daftar.length) {
    console.error(`Tak ada foto. Cek --dir ${DIR} / --manifest ${MANIFEST}`);
    process.exit(1);
  }
  console.log(`Korpus ${daftar.length} foto × ${ULANGAN} ulangan | API ${API}\n`);

  const hasil = [];
  for (const { file, label } of daftar) {
    const path = resolve(DIR, file);
    if (!existsSync(path)) {
      console.log(`  LEWATI ${file} (tak ada di ${DIR})`);
      continue;
    }
    const b64 = (await kompres(await readFile(path))).toString("base64");
    const tops = [];
    const confs = [];
    const semuaKandidat = new Set();
    for (let i = 0; i < ULANGAN; i++) {
      const r = await diagnosa(b64);
      const k0 = r.kandidat[0];
      tops.push(r.err ? `ERR` : (k0?.slug ?? "(tidak yakin)"));
      if (k0?.keyakinan != null) confs.push(k0.keyakinan);
      for (const k of r.kandidat) semuaKandidat.add(k.slug);
    }
    const m = modus(tops);
    const confAvg = confs.length ? Math.round(confs.reduce((a, b) => a + b, 0) / confs.length) : null;
    const benar = label ? m.nama === label : null;
    const labelTerlihat = label ? semuaKandidat.has(label) : null;
    hasil.push({ file, label, modus: m.nama, stabil: m.n, confAvg, benar, labelTerlihat, tops });

    const tag = label
      ? `label=${label} -> ${benar ? "BENAR" : "SALAH"}${!benar && labelTerlihat ? " (label ada di kandidat)" : ""}`
      : "label=?";
    console.log(
      `${file}\n  modus ${m.nama} (${m.n}/${ULANGAN})  conf~${confAvg ?? "-"}%  ${tag}\n  ulangan: ${tops.join(" | ")}`,
    );
  }

  // ---- ringkasan ----
  console.log(`\n===== RINGKASAN (n=${hasil.length}, ${ULANGAN} ulangan) =====`);
  const stabilPenuh = hasil.filter((r) => r.stabil === ULANGAN).length;
  const stabilRata = (hasil.reduce((a, r) => a + r.stabil, 0) / hasil.length / ULANGAN * 100).toFixed(0);
  console.log(`STABILITAS: ${stabilPenuh}/${hasil.length} foto konsisten penuh; kesepakatan rata ${stabilRata}%`);
  const dist = {};
  for (const r of hasil) dist[r.stabil] = (dist[r.stabil] ?? 0) + 1;
  console.log(`  sebaran modus/${ULANGAN}: ${Object.entries(dist).sort((a,b)=>b[0]-a[0]).map(([k,v])=>`${k}→${v}foto`).join("  ")}`);

  const berlabel = hasil.filter((r) => r.label);
  if (berlabel.length) {
    const acc1 = berlabel.filter((r) => r.benar).length;
    const recall = berlabel.filter((r) => r.labelTerlihat).length;
    console.log(`AKURASI (${berlabel.length} berlabel):`);
    console.log(`  top-1 modus benar : ${acc1}/${berlabel.length} (${(acc1/berlabel.length*100).toFixed(0)}%)`);
    console.log(`  label muncul di kandidat mana pun : ${recall}/${berlabel.length} (batas-atas jika UI tampilkan >1)`);
  } else {
    console.log(`AKURASI: tak terukur — belum ada foto berlabel di manifest.`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
