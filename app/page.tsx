import Link from "next/link";
import Icon from "@/components/Icon";
import CategoryBadge from "@/components/CategoryBadge";
import { konten, entries, KATEGORI_URUT, entriesByKategori } from "@/lib/konten";
import { katTheme } from "@/lib/theme";

const AKSI = [
  {
    href: "/foto",
    title: "Foto & Diagnosa",
    desc: "Potret gejala, AI menduga penyebab",
    icon: "camera",
    cls: "bg-hama text-white",
  },
  {
    href: "/diagnosa",
    title: "Tabel Gejala",
    desc: "Centang gejala, saring kandidat",
    icon: "clipboard",
    cls: "bg-penyakit text-white",
  },
  {
    href: "/entri",
    title: "Telusur Entri",
    desc: "24 gangguan, cari & filter",
    icon: "list",
    cls: "bg-hara text-white",
  },
] as const;

// Entri yang paling sering dibutuhkan di lapangan (dipilih berdasar nomor stabil).
const POPULER = new Set([1, 2, 4, 12, 13, 14]);

export default function Beranda() {
  const populer = entries.filter((e) => POPULER.has(e.no));
  return (
    <div className="px-4 py-5">
      {/* Hero */}
      <section className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-hama">
          {konten.meta.kicker}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight text-ink">
          {konten.meta.judul}
        </h1>
        <p className="mt-1 text-sm text-ink/65">{konten.meta.subjudul}</p>
      </section>

      {/* Pencarian (form GET — jalan tanpa JS) */}
      <form action="/entri" method="get" className="mb-5" role="search">
        <label htmlFor="q" className="sr-only">
          Cari hama, penyakit, atau masalah hara
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 shadow-sm focus-within:border-hama">
          <Icon name="search" size={20} className="text-ink/40" />
          <input
            id="q"
            name="q"
            type="search"
            inputMode="search"
            placeholder="Cari gejala, nama hama/penyakit…"
            className="min-h-[48px] w-full bg-transparent text-[15px] outline-none placeholder:text-ink/40"
          />
        </div>
      </form>

      {/* 3 aksi besar */}
      <section className="mb-6 grid gap-3">
        {AKSI.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`flex items-center gap-4 rounded-2xl p-4 shadow-sm transition hover:brightness-105 ${a.cls}`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Icon name={a.icon} size={26} />
            </span>
            <span className="flex-1">
              <span className="block text-lg font-bold leading-tight">
                {a.title}
              </span>
              <span className="block text-[13px] text-white/85">{a.desc}</span>
            </span>
            <Icon name="arrow-right" size={22} className="text-white/80" />
          </Link>
        ))}
      </section>

      {/* Kategori */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/50">
          Kategori
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {KATEGORI_URUT.map((kat) => {
            const t = katTheme(kat);
            const n = entriesByKategori(kat).length;
            return (
              <Link
                key={kat}
                href={`/entri?kat=${kat}`}
                className={`flex flex-col items-center gap-1 rounded-2xl border border-black/5 p-3 text-center ${t.bgLight}`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${t.bg}`}
                >
                  <Icon name={t.icon} size={22} />
                </span>
                <span className={`text-sm font-bold ${t.text}`}>{t.label}</span>
                <span className="text-xs text-ink/55">{n} entri</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sering dilihat */}
      <section className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink/50">
            Sering dilihat
          </h2>
          <Link href="/entri" className="text-xs font-semibold text-hama">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {populer.map((e) => {
            const t = katTheme(e.kategori);
            return (
              <Link
                key={e.slug}
                href={`/entri/${e.slug}`}
                className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div
                  className={`flex h-20 items-center justify-center overflow-hidden rounded-xl ${t.bgLight}`}
                >
                  {e.foto.ada_foto && e.foto.path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/${e.foto.path}`}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Icon name={t.icon} size={30} className={t.text} />
                  )}
                </div>
                <div>
                  <CategoryBadge kategori={e.kategori} size="sm" />
                  <h3 className="mt-1 text-sm font-semibold leading-tight">
                    {e.nama}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-ink/45">
        {konten.meta.penyusun} · {konten.meta.org}
      </p>
      <p className="mt-1 text-center text-[11px] text-ink/40">
        Versi {konten.meta.versi} · {konten.meta.jumlah_entri} entri
      </p>
    </div>
  );
}
