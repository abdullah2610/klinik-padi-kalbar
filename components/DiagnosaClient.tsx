"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import CategoryBadge from "./CategoryBadge";
import { katTheme } from "@/lib/theme";
import type { QidRow } from "@/lib/konten";
import type { Kategori } from "@/lib/types";

const KAT: { key: "all" | Kategori; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "hama", label: "Hama" },
  { key: "penyakit", label: "Penyakit" },
  { key: "hara", label: "Hara" },
];

interface Kandidat {
  slug: string | null;
  nama: string;
  kategori: Kategori;
  cocok: number;
  cara: string[];
}

export default function DiagnosaClient({ rows }: { rows: QidRow[] }) {
  const [filter, setFilter] = useState<"all" | Kategori>("all");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const tampil = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.kategori === filter)),
    [rows, filter],
  );

  const kandidat = useMemo<Kandidat[]>(() => {
    const map = new Map<string, Kandidat>();
    for (const r of rows) {
      if (!checked.has(r.idx)) continue;
      const key = r.slug ?? r.dugaan;
      const cur = map.get(key);
      if (cur) {
        cur.cocok += 1;
        cur.cara.push(r.cara_cek);
      } else {
        map.set(key, {
          slug: r.slug,
          nama: r.nama ?? r.dugaan,
          kategori: r.kategori,
          cocok: 1,
          cara: [r.cara_cek],
        });
      }
    }
    return [...map.values()].sort((a, b) => b.cocok - a.cocok);
  }, [rows, checked]);

  function toggle(idx: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-extrabold">Tabel Gejala</h1>
      <p className="mt-1 text-sm text-ink/65">
        Centang gejala yang terlihat di lapangan. Kandidat muncul dan terurut
        dari yang paling banyak cocok. Konfirmasi lewat{" "}
        <span className="font-semibold">ciri pembeda</span> di entri.
      </p>

      {/* Kandidat terpilih (sticky) */}
      {kandidat.length > 0 && (
        <div className="sticky top-[52px] z-20 -mx-4 mb-3 border-y border-hama/20 bg-hama-light/95 px-4 py-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-hama">
              {kandidat.length} kandidat · {checked.size} gejala
            </p>
            <button
              type="button"
              onClick={() => setChecked(new Set())}
              className="text-xs font-semibold text-ink/55 underline"
            >
              Reset
            </button>
          </div>
          <ul className="grid gap-2">
            {kandidat.map((k) => {
              const t = katTheme(k.kategori);
              const inner = (
                <>
                  <span
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${t.bg}`}
                  >
                    {k.cocok}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {k.nama}
                    </span>
                    <span className="block truncate text-[12px] text-ink/60">
                      Cek: {k.cara.join(" · ")}
                    </span>
                  </span>
                  {k.slug && (
                    <Icon
                      name="chevron-right"
                      size={18}
                      className="shrink-0 text-ink/35"
                    />
                  )}
                </>
              );
              return (
                <li key={k.slug ?? k.nama}>
                  {k.slug ? (
                    <Link
                      href={`/entri/${k.slug}`}
                      className="flex items-center gap-2.5 rounded-xl border border-black/10 bg-white p-2.5 shadow-sm"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2.5 rounded-xl border border-black/10 bg-white p-2.5">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Filter kategori */}
      <div className="mb-3 flex flex-wrap gap-2">
        {KAT.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setFilter(k.key)}
            aria-pressed={filter === k.key}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
              filter === k.key
                ? "border-transparent bg-ink text-white"
                : "border-black/15 bg-white text-ink/70 hover:border-black/30"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* Checklist gejala */}
      <ul className="grid gap-2">
        {tampil.map((r) => {
          const on = checked.has(r.idx);
          const t = katTheme(r.kategori);
          return (
            <li key={r.idx}>
              <button
                type="button"
                onClick={() => toggle(r.idx)}
                aria-pressed={on}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  on
                    ? `${t.bgLight} border-transparent ring-2 ${t.ring}`
                    : "border-black/10 bg-white hover:border-black/25"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    on
                      ? `${t.bg} border-transparent text-white`
                      : "border-black/25"
                  }`}
                >
                  {on && <Icon name="check" size={13} />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium leading-snug text-ink">
                    {r.gejala_ringkas}
                  </span>
                  {on && (
                    <span className="mt-1 flex items-center gap-1.5">
                      <CategoryBadge kategori={r.kategori} size="sm" />
                      <span className="text-[12px] font-semibold text-ink/60">
                        → {r.dugaan}
                      </span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
