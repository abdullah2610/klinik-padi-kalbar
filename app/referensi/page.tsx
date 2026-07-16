import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { konten } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Referensi",
  description: "Daftar rujukan buku saku dan catatan penggunaan pestisida.",
};

export default function ReferensiPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">Referensi</h1>

      {konten.catatan_referensi && (
        <p className="mb-5 flex gap-2 rounded-xl bg-alert/5 px-3 py-3 text-[13px] leading-relaxed text-ink/70">
          <Icon name="warning" size={18} className="mt-0.5 shrink-0 text-alert" />
          {konten.catatan_referensi}
        </p>
      )}

      <ol className="grid gap-2.5">
        {konten.referensi.map((r) => (
          <li
            key={r.urutan}
            className="flex gap-3 rounded-2xl border border-black/10 bg-white p-3.5"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold text-ink/60">
              {r.urutan}
            </span>
            <p className="text-[13px] leading-relaxed text-ink/80">{r.teks}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
