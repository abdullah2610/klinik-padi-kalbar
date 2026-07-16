import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import CategoryBadge from "@/components/CategoryBadge";
import InfoBlock from "@/components/InfoBlock";
import EntryActions from "@/components/EntryActions";
import EntryCard from "@/components/EntryCard";
import {
  konten,
  entryBySlug,
  allSlugs,
  relatedEntries,
} from "@/lib/konten";
import { katTheme } from "@/lib/theme";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = entryBySlug(slug);
  if (!e) return { title: "Entri tidak ditemukan" };
  return {
    title: e.nama,
    description: `${e.gejala.slice(0, 150)}`,
  };
}

export default async function DetailEntri({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = entryBySlug(slug);
  if (!e) notFound();

  const t = katTheme(e.kategori);
  const mirip = relatedEntries(e, 3);

  return (
    <article className="pb-6">
      {/* Header berwarna kategori */}
      <div className={`${t.bg} px-4 pb-5 pt-3 text-white`}>
        <Link
          href="/entri"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-white/85 hover:text-white"
        >
          <Icon name="arrow-left" size={18} /> Semua entri
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-sm font-bold">
            {e.no}
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
            {t.label}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight">{e.nama}</h1>
        {e.nama_latin && (
          <p className="mt-0.5 text-sm italic text-white/85">{e.nama_latin}</p>
        )}
      </div>

      <div className="px-4">
        {/* Foto / ruang ilustrasi */}
        <div className="-mt-3 mb-4">
          {e.foto.ada_foto && e.foto.path ? (
            <figure className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/${e.foto.path}`}
                alt={e.foto.caption ?? e.nama}
                className="max-h-72 w-full object-cover"
              />
              {e.foto.caption && (
                <figcaption className="px-3 py-2 text-xs text-ink/60">
                  {e.foto.caption}
                </figcaption>
              )}
            </figure>
          ) : (
            <div
              className={`flex flex-col items-center gap-2 rounded-2xl border border-dashed border-black/15 ${t.bgLight} px-4 py-6 text-center`}
            >
              <Icon name="camera" size={26} className={t.text} />
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Ruang Foto / Ilustrasi
              </p>
              {e.foto.saran_foto && (
                <p className="text-[13px] text-ink/65">{e.foto.saran_foto}</p>
              )}
            </div>
          )}
        </div>

        {/* Aksi */}
        <div className="mb-4">
          <EntryActions slug={e.slug} nama={e.nama} ringkas={e.gejala.slice(0, 90)} />
        </div>

        {/* Isi entri */}
        <div className="grid gap-3">
          <InfoBlock icon="eye" label="Gejala khas">
            {e.gejala}
          </InfoBlock>

          <InfoBlock icon="compare" label="Ciri pembeda" tone="pembeda">
            {e.pembeda}
          </InfoBlock>

          <InfoBlock icon={t.icon} label="Penyebab">
            {e.penyebab}
          </InfoBlock>

          <InfoBlock icon="water" label="Kondisi pendukung">
            {e.kondisi}
          </InfoBlock>

          <InfoBlock icon="down" label="Dampak" tone="dampak">
            {e.dampak}
          </InfoBlock>

          <InfoBlock
            icon="check"
            label="Identifikasi & ambang"
            tone="identifikasi"
          >
            {e.identifikasi}
          </InfoBlock>

          {/* PHT berjenjang */}
          <section className="rounded-2xl border border-hama/25 bg-white p-3.5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-hama text-white">
                <Icon name="shield" size={16} />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wide text-hama">
                Pengendalian PHT (berurutan)
              </h2>
            </div>
            <ol className="grid gap-2">
              {e.pht.map((p) => (
                <li key={p.urutan} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-hama-light text-[11px] font-bold text-hama">
                    {p.urutan}
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink/85">
                    {p.teks}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {e.tip && (
            <InfoBlock icon="bulb" label="Tips lapangan" tone="tip">
              {e.tip}
            </InfoBlock>
          )}
        </div>

        {/* Tautan lanjut */}
        <div className="mt-4 grid gap-2">
          <Link
            href={`/asisten?tentang=${e.slug}`}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm font-semibold hover:border-black/25"
          >
            <Icon name="chat" size={20} className="text-penyakit" />
            Tanya asisten tentang entri ini
            <Icon name="chevron-right" size={18} className="ml-auto text-ink/30" />
          </Link>
          {mirip.length > 0 && (
            <Link
              href={`/banding?fokus=${e.slug}`}
              className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm font-semibold hover:border-black/25"
            >
              <Icon name="compare" size={20} className="text-hara" />
              Bandingkan dengan yang mirip
              <Icon
                name="chevron-right"
                size={18}
                className="ml-auto text-ink/30"
              />
            </Link>
          )}
        </div>

        {/* Entri mirip */}
        {mirip.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/50">
              Sering tertukar dengan
            </h2>
            <ul className="grid gap-3">
              {mirip.map((m) => (
                <li key={m.slug}>
                  <EntryCard entry={m} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Peringatan pestisida */}
        {konten.catatan_referensi && (
          <p className="mt-6 flex gap-2 rounded-xl bg-alert/5 px-3 py-2.5 text-[12px] leading-relaxed text-ink/65">
            <Icon
              name="warning"
              size={16}
              className="mt-0.5 shrink-0 text-alert"
            />
            {konten.catatan_referensi}
          </p>
        )}
      </div>
    </article>
  );
}
