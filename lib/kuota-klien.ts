"use client";
import { KUOTA, type Fitur } from "./kuota-batas";

// Jatah per-perangkat harian di localStorage. Tujuan: membagi pemakaian adil,
// memberi umpan balik instan, dan degrade mulus ke Tabel Gejala — BUKAN
// mengamankan biaya (mudah ditembus dengan menghapus data situs). Pengaman
// biaya ada di lapisan server (lib/kuota.ts) + spend-limit TokenRouter.

interface Kuota {
  tanggal: string;
  jumlah: number;
}

// Tanggal lokal perangkat. Kalbar = WIB, jadi selaras dengan reset server.
function hariIni(): string {
  const d = new Date();
  const bln = String(d.getMonth() + 1).padStart(2, "0");
  const tgl = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bln}-${tgl}`;
}

function kunci(fitur: Fitur): string {
  return `kpk_kuota_${fitur}`;
}

// Baca hitungan hari ini. Entri kadaluwarsa/hilang -> nol. Bila localStorage tak
// bisa dibaca (mode privat/SSR) -> anggap nol juga, sehingga sisaKuota memberi
// jatah penuh (degrade: izinkan; server tetap membatasi).
function baca(fitur: Fitur): Kuota {
  const kosong: Kuota = { tanggal: hariIni(), jumlah: 0 };
  try {
    const raw = localStorage.getItem(kunci(fitur));
    if (!raw) return kosong;
    const v = JSON.parse(raw) as Partial<Kuota>;
    if (
      v &&
      v.tanggal === hariIni() &&
      typeof v.jumlah === "number" &&
      v.jumlah >= 0
    ) {
      return { tanggal: v.tanggal, jumlah: v.jumlah };
    }
  } catch {
    // localStorage tak tersedia — degrade ke jatah penuh.
  }
  return kosong;
}

/** Sisa jatah hari ini untuk perangkat ini (0..batas). */
export function sisaKuota(fitur: Fitur): number {
  return Math.max(0, KUOTA[fitur].klien - baca(fitur).jumlah);
}

/** Total jatah harian per perangkat. */
export function batasKuota(fitur: Fitur): number {
  return KUOTA[fitur].klien;
}

/** Catat satu pemakaian. Best-effort; gagal-diam bila localStorage tak tersedia. */
export function catatKuota(fitur: Fitur): void {
  const k = baca(fitur);
  try {
    localStorage.setItem(
      kunci(fitur),
      JSON.stringify({ tanggal: k.tanggal, jumlah: k.jumlah + 1 }),
    );
  } catch {
    // abaikan
  }
}
