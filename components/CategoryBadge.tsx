import type { Kategori } from "@/lib/types";
import { katTheme } from "@/lib/theme";
import Icon from "./Icon";

export default function CategoryBadge({
  kategori,
  size = "md",
}: {
  kategori: Kategori;
  size?: "sm" | "md";
}) {
  const t = katTheme(kategori);
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${t.chipSoft} ${pad}`}
    >
      <Icon name={t.icon} size={size === "sm" ? 13 : 15} />
      {t.label}
    </span>
  );
}
