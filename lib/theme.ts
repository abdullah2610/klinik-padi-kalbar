// Pemetaan kategori -> kelas Tailwind LITERAL (bukan dinamis) agar tidak ter-purge.
import type { Kategori } from "./types";

export interface KatTheme {
  label: string;
  icon: string;
  text: string;
  bg: string;
  bgLight: string;
  border: string;
  ring: string;
  chip: string; // pil solid
  chipSoft: string; // pil lembut
  dot: string;
  gradient: string;
}

export const KAT_THEME: Record<Kategori, KatTheme> = {
  hama: {
    label: "Hama",
    icon: "bug",
    text: "text-hama",
    bg: "bg-hama",
    bgLight: "bg-hama-light",
    border: "border-hama",
    ring: "ring-hama",
    chip: "bg-hama text-white",
    chipSoft: "bg-hama-light text-hama",
    dot: "bg-hama",
    gradient: "from-hama to-[#155f34]",
  },
  penyakit: {
    label: "Penyakit",
    icon: "microbe",
    text: "text-penyakit",
    bg: "bg-penyakit",
    bgLight: "bg-penyakit-light",
    border: "border-penyakit",
    ring: "ring-penyakit",
    chip: "bg-penyakit text-white",
    chipSoft: "bg-penyakit-light text-penyakit",
    dot: "bg-penyakit",
    gradient: "from-penyakit to-[#0a5f5e]",
  },
  hara: {
    label: "Masalah Hara",
    icon: "water",
    text: "text-hara",
    bg: "bg-hara",
    bgLight: "bg-hara-light",
    border: "border-hara",
    ring: "ring-hara",
    chip: "bg-hara text-white",
    chipSoft: "bg-hara-light text-hara",
    dot: "bg-hara",
    gradient: "from-hara to-[#7c5230]",
  },
};

export function katTheme(k: Kategori): KatTheme {
  return KAT_THEME[k];
}

// Token warna dari modul konten (LEGEND/section color) -> hex untuk gaya inline.
export const TOKEN_HEX: Record<string, string> = {
  GREEN: "#1f7a43",
  LGREEN: "#e4f1ea",
  TEAL: "#0e7c7b",
  LTEAL: "#e0f0ef",
  BROWN: "#9c6b3f",
  LBROWN: "#f2e9df",
  ALERT: "#c0392b",
  AMBER: "#f2a900",
  AMBER_D: "#b8860b",
};

export function tokenHex(t: string): string {
  return TOKEN_HEX[t] ?? "#1c2b22";
}
