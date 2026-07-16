import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { konten } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Tentang buku saku, cakupan, penyusun, dan catatan pemakaian.",
};

export default function TentangPage() {
  const box = konten.tentang_box;
  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">Tentang Buku Saku Ini</h1>

      <div className="grid gap-3">
        {konten.tentang.map((p, i) => (
          <p key={i} className="text-[14px] leading-relaxed text-ink/80">
            {p}
          </p>
        ))}
      </div>

      {box && (
        <div className="mt-5 grid gap-3">
          {box.cakupan_title && (
            <section className="rounded-2xl border border-hama/25 bg-hama-light p-4">
              <h2 className="mb-1.5 text-sm font-bold uppercase tracking-wide text-hama">
                {box.cakupan_title}
              </h2>
              {box.cakupan_lines.map((l, i) => (
                <p key={i} className="text-[14px] leading-relaxed text-ink/85">
                  {l}
                </p>
              ))}
            </section>
          )}

          {box.catatan_title && (
            <section className="rounded-2xl border border-black/10 bg-white p-4">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/55">
                {box.catatan_title}
              </h2>
              <ul className="grid gap-2">
                {box.catatan_bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-[14px] text-ink/80">
                    <Icon
                      name="check"
                      size={16}
                      className="mt-0.5 shrink-0 text-hama"
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-black/[0.03] p-4 text-center">
        <p className="text-sm font-semibold">{konten.meta.penyusun}</p>
        <p className="text-xs text-ink/60">{konten.meta.institusi}</p>
        {konten.meta.pendamping?.length > 0 && (
          <p className="mt-2 text-[12px] text-ink/55">
            {konten.meta.pendamping.join(" ")}
          </p>
        )}
        <p className="mt-2 text-[11px] text-ink/45">
          Versi {konten.meta.versi} · {konten.meta.jumlah_entri} entri
        </p>
      </div>
    </div>
  );
}
