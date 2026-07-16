// Pemuat konten tunggal + fungsi seleksi. Diimpor langsung dari data/konten.json
// (build-time) sehingga halaman Server Component ter-render statis dari sumber buku.
import raw from "@/data/konten.json";
import type { Konten, Entry, Kategori, Qid } from "./types";

export const konten = raw as unknown as Konten;

export const entries: Entry[] = konten.entries;
export const qid: Qid[] = konten.tabel_identifikasi_cepat;

export const KATEGORI_URUT: Kategori[] = ["hama", "penyakit", "hara"];

export function entriesByKategori(kat: Kategori): Entry[] {
  return entries.filter((e) => e.kategori === kat);
}

export function entryBySlug(slug: string): Entry | undefined {
  return entries.find((e) => e.slug === slug);
}

export function allSlugs(): string[] {
  return entries.map((e) => e.slug);
}

/** Normalisasi teks Indonesia untuk pencarian: lowercase + buang tanda baca. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Skor kecocokan sederhana entri terhadap query (nama > kata kunci > gejala/pembeda). */
export function scoreEntry(e: Entry, q: string): number {
  const nq = norm(q);
  if (!nq) return 0;
  const terms = nq.split(" ");
  const nama = norm(e.nama);
  const latin = norm(e.nama_latin);
  const kunci = e.kata_kunci.join(" ");
  const body = norm(
    `${e.gejala} ${e.pembeda} ${e.penyebab} ${e.kondisi} ${e.dampak}`,
  );
  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    if (nama.includes(t)) score += 10;
    if (latin.includes(t)) score += 6;
    if (kunci.includes(t)) score += 5;
    if (body.includes(t)) score += 2;
  }
  // bonus bila seluruh query cocok di nama
  if (nama.includes(nq)) score += 8;
  return score;
}

export function searchEntries(q: string): Entry[] {
  const scored = entries
    .map((e) => ({ e, s: scoreEntry(e, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.e.no - b.e.no);
  return scored.map((x) => x.e);
}

/** Entri "mirip" untuk mode perbandingan: prioritas yang disebut di 'pembeda'. */
export function relatedEntries(e: Entry, limit = 3): Entry[] {
  const others = entries.filter((o) => o.slug !== e.slug);
  const pembeda = norm(e.pembeda);
  const scored = others.map((o) => {
    let s = 0;
    // nama lawan disebut di pembeda entri ini?
    for (const w of norm(o.nama).split(" ")) {
      if (w.length >= 4 && pembeda.includes(w)) s += 5;
    }
    // kategori sama sedikit menambah relevansi
    if (o.kategori === e.kategori) s += 1;
    // berbagi kata kunci
    const shared = o.kata_kunci.filter((k) => e.kata_kunci.includes(k)).length;
    s += shared;
    return { o, s };
  });
  return scored
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.o);
}
