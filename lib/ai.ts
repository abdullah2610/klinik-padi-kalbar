import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Model default mengikuti pedoman: claude-opus-4-8 (vision resolusi tinggi otomatis).
// Bisa ditimpa via env untuk menekan biaya lapangan (mis. claude-haiku-4-5).
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/** AI hanya aktif bila kunci API tersedia. UI degrade mulus bila belum diset. */
export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) client = new Anthropic(); // membaca ANTHROPIC_API_KEY dari env
  return client;
}

export const MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const PERINGATAN_PESTISIDA =
  "Rekomendasi bahan aktif bersifat acuan; gunakan hanya produk terdaftar/berizin Kementan sesuai label. Dugaan AI perlu dikonfirmasi dengan ciri pembeda di lapangan.";
