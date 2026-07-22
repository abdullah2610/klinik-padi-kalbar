// Satu sumber angka batas kuota fitur AI. Modul isomorfik (tanpa "server-only")
// agar dipakai bersama oleh:
//   - klien  : jatah per-perangkat via localStorage (lib/kuota-klien.ts)
//   - server : plafon global harian in-memory (lib/kuota.ts)
//
// Dua lapis, peran berbeda:
//   klien  -> membagi jatah adil per orang + umpan balik instan + degrade mulus.
//             Bisa ditembus (hapus data situs), jadi BUKAN pengaman biaya.
//   global -> pengaman biaya kasar bila lapisan klien ditembus.
// Kendali biaya otoritatif tetap spend-limit di dashboard TokenRouter.
export const KUOTA = {
  // Foto pakai model visi (paling mahal/permintaan): jatah ketat.
  foto: { klien: 3, global: 50 },
  // Asisten model teks (jauh lebih murah, butuh beberapa giliran agar berguna):
  // jatah lebih longgar.
  asisten: { klien: 25, global: 300 },
} as const;

export type Fitur = keyof typeof KUOTA;
