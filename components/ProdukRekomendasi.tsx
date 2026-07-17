import Icon from "./Icon";
import type { Produk } from "@/lib/types";

// Presentasional (aman di server & client component). Kosong -> tak render apa pun.
export default function ProdukRekomendasi({
  produk,
  catatan,
  catatanAplikasi,
  compact = false,
}: {
  produk: Produk[];
  catatan?: string;
  catatanAplikasi?: string;
  compact?: boolean;
}) {
  if (produk.length === 0) return null;

  if (compact) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-hama">Biopestisida:</span>
        {produk.map((p) => (
          <span
            key={p.id}
            className="rounded-full bg-hama-light px-2 py-0.5 text-[11px] font-medium text-hama"
          >
            {p.nama}
          </span>
        ))}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-hama/25 bg-white p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-hama text-white">
          <Icon name="shield" size={16} />
        </span>
        <h2 className="text-xs font-bold uppercase tracking-wide text-hama">
          Biopestisida rekomendasi (PRIMAAGROTECH)
        </h2>
      </div>
      <ul className="grid gap-2.5">
        {produk.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-black/10 bg-white px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">{p.nama}</span>
              <span className="rounded-full bg-hama-light px-2 py-0.5 text-[11px] font-medium text-hama">
                {p.jenis}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/75">
              {p.sasaran_umum}
            </p>
            <p className="mt-0.5 text-[12px] italic text-ink/50">
              {p.komposisi.join(" + ")}
            </p>
          </li>
        ))}
      </ul>
      {catatan && (
        <p className="mt-2.5 rounded-lg bg-padi-light px-2.5 py-1.5 text-[12px] leading-relaxed text-ink/70">
          {catatan}
        </p>
      )}
      {catatanAplikasi && (
        <p className="mt-1.5 text-[12px] font-medium text-ink/70">
          {catatanAplikasi}
        </p>
      )}
      <p className="mt-1.5 text-[11px] leading-relaxed text-ink/50">
        Utamakan sebagai bagian dari PHT; keputusan akhir dikonfirmasi lewat ciri
        pembeda di lapangan.
      </p>
    </section>
  );
}
