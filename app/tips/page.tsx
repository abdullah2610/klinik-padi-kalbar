import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { konten } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Tips Lapangan",
  description: "Tips praktis pengamatan dan pengendalian di lapangan.",
};

export default function TipsPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">Tips Praktis di Lapangan</h1>
      <ul className="grid gap-2.5">
        {konten.tips.map((t, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-2xl border border-padi/40 bg-padi-light p-3.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-padi text-ink">
              <Icon name="bulb" size={16} />
            </span>
            <p className="text-[14px] leading-relaxed text-ink/85">{t}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
