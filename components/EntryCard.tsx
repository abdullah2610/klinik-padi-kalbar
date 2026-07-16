import Link from "next/link";
import type { Entry } from "@/lib/types";
import { katTheme } from "@/lib/theme";
import Icon from "./Icon";
import CategoryBadge from "./CategoryBadge";

export default function EntryCard({ entry }: { entry: Entry }) {
  const t = katTheme(entry.kategori);
  const gejalaRingkas =
    entry.gejala.length > 120 ? entry.gejala.slice(0, 118) + "…" : entry.gejala;
  return (
    <Link
      href={`/entri/${entry.slug}`}
      className="group flex gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:border-black/20 hover:shadow-md focus-visible:shadow-md"
    >
      <div
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl ${t.bgLight}`}
      >
        {entry.foto.ada_foto && entry.foto.path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/${entry.foto.path}`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <Icon name={t.icon} size={28} className={t.text} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${t.bg}`}
          >
            {entry.no}
          </span>
          <h3 className="truncate font-semibold leading-tight">{entry.nama}</h3>
        </div>
        {entry.nama_latin && (
          <p className="truncate text-xs italic text-ink/55">
            {entry.nama_latin}
          </p>
        )}
        <p className="mt-1 line-clamp-2 text-[13px] text-ink/70">
          {gejalaRingkas}
        </p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <CategoryBadge kategori={entry.kategori} size="sm" />
        <Icon
          name="chevron-right"
          size={18}
          className="text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-ink/60"
        />
      </div>
    </Link>
  );
}
