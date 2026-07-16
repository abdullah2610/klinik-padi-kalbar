"use client";

import { useState } from "react";
import Icon from "./Icon";
import { useFavorite } from "@/lib/useFavorites";

export default function EntryActions({
  slug,
  nama,
  ringkas,
}: {
  slug: string;
  nama: string;
  ringkas: string;
}) {
  const [fav, toggleFav] = useFavorite(slug);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/entri/${slug}`
        : `/entri/${slug}`;
    const text = `${nama} — ${ringkas}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: nama, text, url });
        return;
      } catch {
        /* dibatalkan pengguna */
        return;
      }
    }
    // fallback: buka WhatsApp
    const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    if (typeof window !== "undefined") window.open(wa, "_blank", "noopener");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* abaikan */
    }
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={toggleFav}
        aria-pressed={fav}
        className={`flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
          fav
            ? "border-transparent bg-padi text-ink"
            : "border-black/15 bg-white text-ink/75 hover:border-black/30"
        }`}
      >
        <Icon name="star" size={18} />
        {fav ? "Tersimpan" : "Simpan"}
      </button>
      <button
        type="button"
        onClick={share}
        className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-3 text-sm font-semibold text-ink/75 transition hover:border-black/30"
      >
        <Icon name="share" size={18} />
        {copied ? "Tersalin" : "Bagikan"}
      </button>
    </div>
  );
}
