import "server-only";

// Provider tunggal untuk fitur AI (Foto & Asisten): TokenRouter (OpenAI-compatible).
// Endpoint chat completions; model diatur per-fitur lewat env.
export const TOKENROUTER_BASE_URL =
  process.env.TOKENROUTER_BASE_URL || "https://api.tokenrouter.com/v1";

// Model per fitur — bisa ditimpa via env tanpa ubah kode.
export const FOTO_MODEL =
  process.env.TOKENROUTER_FOTO_MODEL || "openai/gpt-4o-mini";
export const ASISTEN_MODEL =
  process.env.TOKENROUTER_ASISTEN_MODEL || "deepseek/deepseek-v4-flash";

/** Fitur AI aktif hanya bila kunci TokenRouter tersedia. UI degrade mulus bila belum diset. */
export function tokenRouterConfigured(): boolean {
  return Boolean(process.env.TOKENROUTER_API_KEY);
}

/** Kunci TokenRouter; pemanggil wajib cek tokenRouterConfigured() lebih dulu. */
export function tokenRouterKey(): string {
  const key = process.env.TOKENROUTER_API_KEY;
  if (!key) throw new Error("TOKENROUTER_API_KEY belum dikonfigurasi.");
  return key;
}

export const MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const PERINGATAN_PESTISIDA =
  "Rekomendasi bahan aktif bersifat acuan; gunakan hanya produk terdaftar/berizin Kementan sesuai label. Dugaan AI perlu dikonfirmasi dengan ciri pembeda di lapangan.";
