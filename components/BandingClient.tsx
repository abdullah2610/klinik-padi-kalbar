"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import CategoryBadge from "./CategoryBadge";
import { katTheme } from "@/lib/theme";
import { norm } from "@/lib/konten";
import type { Entry } from "@/lib/types";

const ASPEK: { key: keyof Entry; label: string; highlight?: boolean }[] = [
  { key: "pembeda", label: "Ciri pembeda", highlight: true },
  { key: "gejala", label: "Gejala khas" },
  { key: "penyebab", label: "Penyebab" },
  { key: "kondisi", label: "Kondisi pendukung" },
  { key: "dampak", label: "Dampak" },
  { key: "identifikasi", label: "Identifikasi & ambang" },
];

const MAKS = 3;

export default function BandingClient({
  entries,
  initial,
}: {
  entries: Entry[];
  initial: string[];
}) {
  const [slugs, setSlugs] = useState<string[]>(initial.slice(0, MAKS));
  const [q, setQ] = useState("");

  const bySlug = useMemo(() => {
    const m = new Map<string, Entry>();
    for (const e of entries) m.set(e.slug, e);
    return m;
  }, [entries]);

  const dipilih = slugs
    .map((s) => bySlug.get(s))
    .filter((e): e is Entry => !!e);

  const kandidat = useMemo(() => {
    const nq = norm(q);
    return entries
      .filter((e) => !slugs.includes(e.slug))
      .filter((e) => !nq || norm(e.nama).includes(nq) || norm(e.nama_latin).includes(nq))
      .slice(0, 30);
  }, [entries, slugs, q]);

  function add(slug: string) {
    setSlugs((prev) => (prev.length >= MAKS ? prev : [...prev, slug]));
    setQ("");
  }
  function remove(slug: string) {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-extrabold">Bandingkan</h1>
      <p className="mt-1 text-sm text-ink/65">
        Sandingkan 2–3 gangguan yang sering tertukar. Fokus pada baris{" "}
        <span className="font-semibold text-penyakit">ciri pembeda</span>.
      </p>

      {/* Terpilih */}
      <div className="mt-3 flex flex-wrap gap-2">
        {dipilih.map((e) => {
          const t = katTheme(e.kategori);
          return (
            <span
              key={e.slug}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-sm font-semibold text-white ${t.bg}`}
            >
              {e.nama}
              <button
                type="button"
                onClick={() => remove(e.slug)}
                aria-label={`Hapus ${e.nama}`}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 hover:bg-white/40"
              >
                <Icon name="close" size={13} />
              </button>
            </span>
          );
        })}
      </div>

      {/* Penambah entri */}
      {slugs.length < MAKS && (
        <details className="mt-3 rounded-2xl border border-black/10 bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-3 text-sm font-semibold text-hama">
            <Icon name="grid" size={18} /> Tambah entri untuk dibandingkan
          </summary>
          <div className="border-t border-black/10 p-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama…"
              className="mb-2 min-h-[42px] w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-hama"
            />
            <ul className="grid max-h-64 gap-1 overflow-auto">
              {kandidat.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => add(e.slug)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-black/5"
                  >
                    <CategoryBadge kategori={e.kategori} size="sm" />
                    <span className="flex-1 truncate">{e.nama}</span>
                    <Icon name="arrow-right" size={16} className="text-ink/30" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {/* Tabel banding */}
      {dipilih.length < 2 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white/50 px-4 py-10 text-center text-sm text-ink/55">
          Pilih minimal 2 entri untuk melihat perbandingan.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-paper" />
                {dipilih.map((e) => {
                  const t = katTheme(e.kategori);
                  return (
                    <th
                      key={e.slug}
                      className="min-w-[190px] p-1 align-bottom"
                    >
                      <Link
                        href={`/entri/${e.slug}`}
                        className={`block rounded-xl p-2 text-left text-white ${t.bg}`}
                      >
                        <span className="block text-sm font-bold leading-tight">
                          {e.nama}
                        </span>
                        <span className="block text-[11px] italic text-white/80">
                          {e.nama_latin}
                        </span>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ASPEK.map((a) => (
                <tr key={a.key} className="align-top">
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 w-24 min-w-24 bg-paper pr-2 pt-3 text-left text-[11px] font-bold uppercase tracking-wide ${
                      a.highlight ? "text-penyakit" : "text-ink/45"
                    }`}
                  >
                    {a.label}
                  </th>
                  {dipilih.map((e) => (
                    <td
                      key={e.slug}
                      className={`p-1.5 ${a.highlight ? "" : ""}`}
                    >
                      <div
                        className={`h-full rounded-lg p-2 leading-relaxed ${
                          a.highlight
                            ? "bg-penyakit-light text-ink"
                            : "bg-white text-ink/80"
                        }`}
                      >
                        {String(e[a.key])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
