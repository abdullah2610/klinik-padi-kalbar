import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { konten } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Varietas",
  description: "Pilihan varietas padi untuk lahan tadah hujan (acuan PM-AAS).",
};

export default function VarietasPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">
        {konten.varietas.judul || "Varietas untuk Lahan Tadah Hujan"}
      </h1>
      <div className="flex gap-3 rounded-2xl border border-hama/25 bg-hama-light p-4">
        <Icon name="leaf" size={22} className="mt-0.5 shrink-0 text-hama" />
        <p className="text-[14px] leading-relaxed text-ink/85">
          {konten.varietas.teks}
        </p>
      </div>
    </div>
  );
}
