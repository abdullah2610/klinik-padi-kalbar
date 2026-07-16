// Tipe TypeScript untuk skema data/konten.json (dihasilkan scripts/export_konten.py).
// Satu sumber kebenaran: content/*.py -> konten.json -> tipe ini -> app.

export type Kategori = "hama" | "penyakit" | "hara";

export interface Meta {
  judul: string;
  subjudul: string;
  kicker: string;
  penyusun: string;
  institusi: string;
  pendamping: string[];
  org: string;
  versi: string;
  diekspor_pada: string;
  jumlah_entri: number;
}

export interface Section {
  num: string;
  kategori: Kategori;
  title: string;
  sub: string;
  color: string;
  light: string;
  icon: string;
  key: string;
  jumlah: number;
}

export interface Legenda {
  icon: string;
  label: string;
  color: string;
}

export interface TentangBox {
  cakupan_title: string;
  cakupan_lines: string[];
  catatan_title: string;
  catatan_bullets: string[];
}

export interface PhtLangkah {
  urutan: number;
  teks: string;
}

export interface Foto {
  file: string | null;
  path: string | null;
  caption: string | null;
  saran_foto: string | null;
  ada_foto: boolean;
}

export interface Entry {
  no: number;
  slug: string;
  kategori: Kategori;
  nama: string;
  nama_latin: string;
  gejala: string;
  pembeda: string;
  penyebab: string;
  kondisi: string;
  dampak: string;
  identifikasi: string;
  tip: string;
  pht: PhtLangkah[];
  foto: Foto;
  kata_kunci: string[];
}

export interface Qid {
  kategori: Kategori;
  key: string;
  gejala_ringkas: string;
  dugaan: string;
  cara_cek: string;
}

export interface Referensi {
  urutan: number;
  teks: string;
}

export interface Varietas {
  judul: string;
  teks: string;
}

export interface Back {
  tagline: string;
  sub: string;
  companion: string[];
  org: string;
}

export interface Konten {
  meta: Meta;
  sections: Section[];
  legenda: Legenda[];
  cara_pakai: string[];
  alur_keputusan: string;
  tentang: string[];
  tentang_box: TentangBox;
  entries: Entry[];
  tabel_identifikasi_cepat: Qid[];
  referensi: Referensi[];
  catatan_referensi: string;
  tips: string[];
  varietas: Varietas;
  back: Back;
}
