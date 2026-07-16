import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { konten } from "@/lib/konten";
import { tokenHex } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Cara Pakai",
  description: "Langkah memakai buku saku, alur keputusan PHT, dan legenda ikon.",
};

export default function PanduanPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">Cara Pakai</h1>

      <ol className="mb-6 grid gap-2.5">
        {konten.cara_pakai.map((c, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-2xl border border-black/10 bg-white p-3.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hama text-sm font-bold text-white">
              {i + 1}
            </span>
            <p className="text-[14px] leading-relaxed text-ink/85">{c}</p>
          </li>
        ))}
      </ol>

      {konten.alur_keputusan && (
        <section className="mb-6 rounded-2xl border border-hama/25 bg-hama-light p-4">
          <div className="mb-1.5 flex items-center gap-2 text-hama">
            <Icon name="check" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Alur keputusan
            </h2>
          </div>
          <p className="text-[14px] leading-relaxed text-ink/85">
            {konten.alur_keputusan}
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/50">
          Legenda
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {konten.legenda.map((l, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-black/10 bg-white p-2.5"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: tokenHex(l.color) }}
              >
                <Icon name={l.icon} size={17} />
              </span>
              <span className="text-sm font-medium">{l.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
