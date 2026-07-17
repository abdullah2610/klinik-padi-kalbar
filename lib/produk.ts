// Akses katalog biopestisida PRIMAAGROTECH + rekomendasi per-entri.
// Sumber: konten.produk (dihasilkan scripts/export_konten.py dari content/*.py).
import { konten } from "./konten";
import type { Produk } from "./types";

const katalog = konten.produk?.katalog ?? [];
const rekomendasi = konten.produk?.rekomendasi ?? {};

export const CATATAN_APLIKASI = konten.produk?.catatan_aplikasi ?? "";

const byId = new Map<string, Produk>(katalog.map((p) => [p.id, p]));

export interface RekomendasiEntri {
  produk: Produk[];
  catatan: string;
}

/** Produk yang direkomendasikan untuk satu entri (urut = prioritas). Kosong bila tak ada. */
export function produkByEntri(slug: string): RekomendasiEntri {
  const r = rekomendasi[slug];
  if (!r) return { produk: [], catatan: "" };
  const produk = r.produk_ids
    .map((id) => byId.get(id))
    .filter((p): p is Produk => Boolean(p));
  return { produk, catatan: r.catatan ?? "" };
}

/** True bila entri punya minimal satu produk rekomendasi. */
export function adaProduk(slug: string): boolean {
  return (rekomendasi[slug]?.produk_ids?.length ?? 0) > 0;
}
