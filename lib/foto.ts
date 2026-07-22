// Kompresi foto di sisi klien, sebelum diunggah ke /api/foto.
//
// Alasan menaruhnya di klien (bukan server): pengguna memotret di lahan dengan
// jaringan lemah. Mengecilkan berkas SEBELUM unggah menghemat kuota & waktu;
// mengompres di server berarti foto besar sudah terlanjur naik.
//
// Dua sumbu yang dikendalikan, jangan tertukar:
//   - dimensi piksel -> menentukan jumlah token model visi (= biaya).
//   - quality encoder -> menentukan ukuran berkas (= waktu unggah).
//
// DIMENSI SENGAJA TIDAK DITURUNKAN. Uji A/B pada 5 foto lapangan 12MP
// (3 ulangan/arm, scratchpad ab_dekomposisi.mjs) menunjukkan:
//   1280px q0.82 vs 1024px q0.82 -> putusan berubah pada 2/5 foto, stabilitas
//     turun 2.6 -> 2.2 dari 3.
//   1280px q0.82 vs 1280px q0.60 -> putusan berubah pada 1/5, stabilitas TETAP
//     2.6, ukuran turun 129KB -> 79KB rata-rata.
// Jadi yang merusak diagnosa adalah hilangnya piksel, bukan artefak kompresi.
// Konsekuensinya: target <=72KB tidak selalu tercapai pada foto rimbun
// berdetail tinggi, dan itu memang pilihan yang benar — lebih baik unggah
// 200KB daripada mengubah jawaban diagnosa.
//
// Batas bawah quality 0.55: di bawah itu artefak blok mulai menyerupai bercak
// penyakit. Belum diuji langsung; angka konservatif.

export interface FotoSiap {
  /** base64 tanpa prefix data URL, siap dikirim ke API. */
  data: string;
  mediaType: string;
  blob: Blob;
  lebar: number;
  tinggi: number;
  quality: number;
  /** true bila target ukuran tidak tercapai walau sudah di batas terkecil. */
  melebihiTarget: boolean;
}

export interface OpsiKompresi {
  /** Target ukuran blob. base64 menggembung ~33%, jadi 72KB ≈ 96KB payload. */
  targetBytes?: number;
  /** Batas sisi terpanjang. Daftar, tapi bawaannya satu nilai — lihat catatan di atas. */
  dimensi?: readonly number[];
  qualityAwal?: number;
  qualityMin?: number;
  qualityStep?: number;
}

export const OPSI_BAWAAN: Required<OpsiKompresi> = {
  targetBytes: 72 * 1024,
  dimensi: [1280],
  qualityAwal: 0.85,
  qualityMin: 0.55,
  qualityStep: 0.07,
};

/**
 * Kecilkan foto sampai <= targetBytes, lalu kembalikan base64 + blob.
 * Bila target tak tercapai pada kombinasi terkecil, kandidat paling kecil
 * tetap dikembalikan dengan `melebihiTarget = true` — lebih baik mengirim
 * foto agak besar daripada menolak diagnosa.
 */
export async function siapkanFoto(
  file: File,
  opsi: OpsiKompresi = {},
): Promise<FotoSiap> {
  const o = { ...OPSI_BAWAAN, ...opsi };
  const mediaType = dukungWebp() ? "image/webp" : "image/jpeg";
  const daftarQ = daftarQuality(o.qualityAwal, o.qualityMin, o.qualityStep);

  const sumber = await muatSumber(file);
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Kanvas tidak didukung.");

    let terkecil: Kandidat | null = null;

    for (const maks of o.dimensi) {
      const { w, h } = ukuranTerskala(sumber.lebar, sumber.tinggi, maks);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(sumber.el, 0, 0, w, h);

      for (const quality of daftarQ) {
        const blob = await keBlob(canvas, mediaType, quality);
        const kandidat: Kandidat = { blob, lebar: w, tinggi: h, quality };
        if (!terkecil || blob.size < terkecil.blob.size) terkecil = kandidat;
        if (blob.size <= o.targetBytes) return await finalkan(kandidat, mediaType, false);
      }

      // Sudah seukuran sumber: mengecilkan dimensi lagi tak menolong.
      if (w === sumber.lebar && h === sumber.tinggi && maks !== o.dimensi[0]) break;
    }

    if (!terkecil) throw new Error("Gagal mengompres foto.");
    return await finalkan(terkecil, mediaType, true);
  } finally {
    sumber.lepas();
  }
}

interface Kandidat {
  blob: Blob;
  lebar: number;
  tinggi: number;
  quality: number;
}

async function finalkan(
  k: Kandidat,
  mediaType: string,
  melebihiTarget: boolean,
): Promise<FotoSiap> {
  return { ...k, mediaType, melebihiTarget, data: await keBase64(k.blob) };
}

function ukuranTerskala(lebar: number, tinggi: number, maks: number) {
  const skala = Math.min(1, maks / Math.max(lebar, tinggi));
  return {
    w: Math.max(1, Math.round(lebar * skala)),
    h: Math.max(1, Math.round(tinggi * skala)),
  };
}

function daftarQuality(awal: number, min: number, step: number): number[] {
  const list: number[] = [];
  for (let q = awal; q >= min - 1e-9; q -= step) {
    list.push(Math.round(q * 100) / 100);
  }
  return list;
}

interface Sumber {
  el: CanvasImageSource;
  lebar: number;
  tinggi: number;
  lepas: () => void;
}

/**
 * Muat berkas jadi sumber gambar siap-gambar.
 * `imageOrientation: "from-image"` wajib: foto HP membawa flag EXIF rotasi yang
 * diabaikan kanvas, sehingga potret bisa masuk ke model dalam keadaan miring.
 * Jalur cadangan <img> untuk peramban lama yang tak punya createImageBitmap.
 */
async function muatSumber(file: File): Promise<Sumber> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      el: bitmap,
      lebar: bitmap.width,
      tinggi: bitmap.height,
      lepas: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Gagal memuat gambar."));
      el.src = url;
    });
    return {
      el: img,
      lebar: img.naturalWidth,
      tinggi: img.naturalHeight,
      lepas: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

let cacheWebp: boolean | null = null;

/** WebP ~25-30% lebih kecil dari JPEG pada mutu setara; lib/ai.ts sudah mengizinkannya. */
function dukungWebp(): boolean {
  if (cacheWebp !== null) return cacheWebp;
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  cacheWebp = c.toDataURL("image/webp").startsWith("data:image/webp");
  return cacheWebp;
}

function keBlob(
  canvas: HTMLCanvasElement,
  mediaType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal mengodekan gambar."))),
      mediaType,
      quality,
    );
  });
}

function keBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const hasil = String(reader.result);
      const koma = hasil.indexOf(",");
      if (koma < 0) reject(new Error("Gagal membaca berkas."));
      else resolve(hasil.slice(koma + 1));
    };
    reader.onerror = () => reject(new Error("Gagal membaca berkas."));
    reader.readAsDataURL(blob);
  });
}
