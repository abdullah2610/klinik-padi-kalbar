import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import EntryCard from "@/components/EntryCard";
import {
  entries,
  entriesByKategori,
  searchEntries,
  KATEGORI_URUT,
} from "@/lib/konten";
import { katTheme } from "@/lib/theme";
import type { Entry, Kategori } from "@/lib/types";

export const metadata: Metadata = {
  title: "Telusur Entri",
  description: "Cari & filter 24 gangguan padi: hama, penyakit, masalah hara.",
};

const KAT_VALID = new Set<Kategori>(KATEGORI_URUT);

function isKategori(v: string | undefined): v is Kategori {
  return !!v && KAT_VALID.has(v as Kategori);
}

export default async function TelusurPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kat?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const kat = isKategori(sp.kat) ? sp.kat : undefined;

  let hasil: Entry[];
  if (q) {
    hasil = searchEntries(q);
    if (kat) hasil = hasil.filter((e) => e.kategori === kat);
  } else if (kat) {
    hasil = entriesByKategori(kat);
  } else {
    hasil = entries;
  }

  const buildHref = (nextKat?: Kategori) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (nextKat) p.set("kat", nextKat);
    const s = p.toString();
    return s ? `/entri?${s}` : "/entri";
  };

  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">Telusur Entri</h1>

      {/* Pencarian */}
      <form action="/entri" method="get" role="search" className="mb-3">
        {kat && <input type="hidden" name="kat" value={kat} />}
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 shadow-sm focus-within:border-hama">
          <Icon name="search" size={20} className="text-ink/40" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            inputMode="search"
            placeholder="Cari gejala / nama…"
            className="min-h-[46px] w-full bg-transparent text-[15px] outline-none placeholder:text-ink/40"
          />
          {q && (
            <Link
              href={buildHref(kat)}
              aria-label="Hapus pencarian"
              className="text-ink/40 hover:text-ink"
            >
              <Icon name="close" size={18} />
            </Link>
          )}
        </div>
      </form>

      {/* Filter kategori */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip href={buildHref()} active={!kat} label="Semua" />
        {KATEGORI_URUT.map((k) => {
          const t = katTheme(k);
          return (
            <FilterChip
              key={k}
              href={buildHref(k)}
              active={kat === k}
              label={t.label}
              activeCls={`${t.bg} text-white border-transparent`}
            />
          );
        })}
      </div>

      {/* Ringkasan hasil */}
      <p className="mb-3 text-sm text-ink/55">
        {hasil.length} entri
        {q && (
          <>
            {" "}
            untuk “<span className="font-semibold text-ink">{q}</span>”
          </>
        )}
      </p>

      {/* Daftar */}
      {hasil.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 px-4 py-10 text-center">
          <Icon
            name="search"
            size={32}
            className="mx-auto mb-2 text-ink/30"
          />
          <p className="font-semibold">Tidak ada entri cocok</p>
          <p className="mt-1 text-sm text-ink/55">
            Coba kata kunci lain, atau buka{" "}
            <Link href="/diagnosa" className="font-semibold text-hama underline">
              Tabel Gejala
            </Link>{" "}
            untuk menyaring lewat gejala.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {hasil.map((e) => (
            <li key={e.slug}>
              <EntryCard entry={e} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
  activeCls = "bg-ink text-white border-transparent",
}: {
  href: string;
  active: boolean;
  label: string;
  activeCls?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? activeCls
          : "border-black/15 bg-white text-ink/70 hover:border-black/30"
      }`}
    >
      {label}
    </Link>
  );
}
