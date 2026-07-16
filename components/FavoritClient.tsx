"use client";

import { useMemo } from "react";
import Link from "next/link";
import Icon from "./Icon";
import EntryCard from "./EntryCard";
import { useFavorites } from "@/lib/useFavorites";
import type { Entry } from "@/lib/types";

export default function FavoritClient({ entries }: { entries: Entry[] }) {
  const favs = useFavorites();
  const bySlug = useMemo(() => {
    const m = new Map<string, Entry>();
    for (const e of entries) m.set(e.slug, e);
    return m;
  }, [entries]);

  const daftar = favs
    .map((s) => bySlug.get(s))
    .filter((e): e is Entry => !!e);

  if (daftar.length === 0) {
    return (
      <div className="px-4 py-5">
        <h1 className="mb-3 text-xl font-extrabold">Favorit Saya</h1>
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 px-4 py-12 text-center">
          <Icon name="star" size={34} className="mx-auto mb-2 text-ink/25" />
          <p className="font-semibold">Belum ada favorit</p>
          <p className="mt-1 text-sm text-ink/55">
            Buka entri lalu tekan{" "}
            <span className="font-semibold text-ink/70">Simpan</span> untuk
            menambahkannya ke sini.
          </p>
          <Link
            href="/entri"
            className="mt-4 inline-block rounded-xl bg-hama px-4 py-2.5 text-sm font-semibold text-white"
          >
            Telusur entri
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">
        Favorit Saya{" "}
        <span className="text-base font-semibold text-ink/45">
          ({daftar.length})
        </span>
      </h1>
      <ul className="grid gap-3">
        {daftar.map((e) => (
          <li key={e.slug}>
            <EntryCard entry={e} />
          </li>
        ))}
      </ul>
    </div>
  );
}
