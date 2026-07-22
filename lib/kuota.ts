import "server-only";
import { KUOTA, type Fitur } from "./kuota-batas";

interface Hitungan {
  tanggal: string;
  jumlah: number;
}

// Penghitung in-memory: dibagi antar-request dalam SATU instance Fluid Compute,
// tetapi TIDAK lintas-instance dan hilang saat cold start. Konsekuensinya batas
// efektif bisa jadi (global × jumlah instance hangat). Ini disengaja sebagai
// pengaman biaya kasar — lapisan klien menegakkan jatah per orang, dan batas
// keras sesungguhnya diset sebagai spend-limit di dashboard TokenRouter.
const penghitung = new Map<Fitur, Hitungan>();

// Reset harian berbasis WIB (zona Kalbar), bukan UTC: agar batas berganti pada
// tengah malam lokal, bukan pukul 07:00 pagi waktu setempat.
function hariWib(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Pontianak",
  }).format(new Date());
}

/**
 * Klaim satu slot kuota global untuk `fitur`. Baca-lalu-tulis tanpa `await` di
 * antaranya, jadi atomik terhadap konkurensi JS satu-thread — tidak ada
 * overshoot. Permintaan yang bahkan gagal mencapai penyedia pun ikut terhitung;
 * ini disengaja, konservatif terhadap biaya. Reset melintasi tengah malam WIB.
 */
export function klaimKuotaGlobal(fitur: Fitur): { ok: boolean; sisa: number } {
  const batas = KUOTA[fitur].global;
  const hari = hariWib();
  const kini = penghitung.get(fitur);
  const jumlah = kini && kini.tanggal === hari ? kini.jumlah : 0;

  if (jumlah >= batas) {
    penghitung.set(fitur, { tanggal: hari, jumlah });
    return { ok: false, sisa: 0 };
  }

  penghitung.set(fitur, { tanggal: hari, jumlah: jumlah + 1 });
  return { ok: true, sisa: batas - (jumlah + 1) };
}
