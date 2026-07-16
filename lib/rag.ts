import "server-only";
import { entries, konten, searchEntries, entryBySlug } from "./konten";
import type { Entry } from "./types";

/** Daftar kelas tertutup (24 gangguan) untuk prompt visi — nama + ciri pembeda.
 *  Dipakai agar model memilih dari daftar buku, bukan mengarang. */
export function kelasList(): string {
  return entries
    .map(
      (e) =>
        `- slug: ${e.slug} | ${e.nama} [${e.kategori}] — ciri pembeda: ${e.pembeda}`,
    )
    .join("\n");
}

/** Ringkasan satu entri sebagai konteks RAG (dipangkas agar hemat token). */
function entryContext(e: Entry): string {
  const pht = e.pht.map((p) => `${p.urutan}. ${p.teks}`).join(" ");
  return [
    `### ${e.nama} (${e.kategori}) [entri: ${e.slug}]`,
    `Gejala: ${e.gejala}`,
    `Ciri pembeda: ${e.pembeda}`,
    `Penyebab: ${e.penyebab}`,
    `Kondisi: ${e.kondisi}`,
    `Dampak: ${e.dampak}`,
    `Identifikasi & ambang: ${e.identifikasi}`,
    `PHT: ${pht}`,
    e.tip ? `Tips: ${e.tip}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export interface Retrieval {
  entries: Entry[];
  context: string;
}

/** Ambil entri paling relevan untuk pertanyaan (RAG berbasis kata kunci atas 24 entri).
 *  fokusSlug memaksa satu entri masuk konteks (mode "tanya tentang entri ini"). */
export function retrieve(question: string, fokusSlug?: string): Retrieval {
  const picked: Entry[] = [];
  const seen = new Set<string>();

  const push = (e?: Entry) => {
    if (e && !seen.has(e.slug)) {
      seen.add(e.slug);
      picked.push(e);
    }
  };

  if (fokusSlug) push(entryBySlug(fokusSlug));
  for (const e of searchEntries(question).slice(0, 5)) push(e);

  // fallback: bila query tak cocok apa pun, sertakan tips umum saja
  const parts: string[] = [];
  if (picked.length > 0) {
    parts.push(picked.map(entryContext).join("\n\n"));
  }

  // sertakan tips & varietas sebagai konteks pendukung ringan
  parts.push(
    `### Tips lapangan umum\n${konten.tips.map((t) => `- ${t}`).join("\n")}`,
  );
  parts.push(`### Varietas\n${konten.varietas.teks}`);

  return { entries: picked, context: parts.join("\n\n") };
}

export const SISTEM_ASISTEN = `Anda "Asisten Klinik Padi Kalbar", pendamping penyuluh & petani padi lahan tadah hujan Kalimantan Barat.

ATURAN WAJIB:
- Jawab HANYA berdasarkan KONTEKS buku yang diberikan. Jangan mengarang atau memakai pengetahuan di luar konteks.
- Bila informasi tidak ada di konteks, katakan jujur: "Informasi ini belum ada di buku saku." lalu sarankan membuka Tabel Gejala atau entri terkait.
- Selalu sebut sumber entri yang dipakai, mis. "Sumber: entri Blas".
- Bahasa Indonesia sederhana, ringkas, langsung ke inti. Cocok dibaca di lapangan.
- Untuk pestisida: sebut hanya bahan aktif yang tertulis di konteks + peringatan "gunakan hanya produk terdaftar/berizin Kementan sesuai label".
- Tolak topik di luar padi tadah hujan (medis, keuangan, komoditas lain).
- Tegaskan bahwa keputusan akhir dikonfirmasi lewat ciri pembeda di lapangan.`;

export const SISTEM_VISI = `Anda alat bantu identifikasi gangguan padi dari foto, untuk lahan tadah hujan Kalimantan Barat.

TUGAS: nilai foto tanaman padi dan pilih kandidat penyebab HANYA dari daftar kelas tertutup di bawah. Jangan mengarang kelas di luar daftar.

ATURAN KESELAMATAN (WAJIB):
- Kembalikan BEBERAPA kandidat berurutan dari yang paling mungkin, dengan tingkat keyakinan 0-100.
- Sebutkan ciri yang teramati di foto sebagai alasan tiap kandidat.
- Bila foto tidak jelas / bukan tanaman padi / gejala tak dikenali: set cukup_yakin=false dan beri catatan agar pengguna memakai Tabel Gejala atau mengirim foto lebih jelas.
- JANGAN memberi keputusan tunggal yang pasti. Dugaan selalu dikonfirmasi lewat ciri pembeda di entri.

DAFTAR KELAS (pilih slug dari sini):
`;
