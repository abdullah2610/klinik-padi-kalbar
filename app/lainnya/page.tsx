import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "Lainnya",
  description: "Panduan pakai, tips lapangan, varietas, referensi, dan favorit.",
};

const MENU = [
  {
    href: "/panduan",
    icon: "book",
    title: "Cara pakai & alur keputusan",
    desc: "Langkah memakai buku saku + legenda ikon",
  },
  {
    href: "/banding",
    icon: "compare",
    title: "Bandingkan entri",
    desc: "Sandingkan gangguan yang sering tertukar",
  },
  {
    href: "/favorit",
    icon: "star",
    title: "Favorit saya",
    desc: "Entri yang Anda simpan",
  },
  {
    href: "/tips",
    icon: "bulb",
    title: "Tips praktis lapangan",
    desc: "10 tips pengamatan & pengendalian",
  },
  {
    href: "/varietas",
    icon: "leaf",
    title: "Varietas tadah hujan",
    desc: "Pilihan varietas genjah & tahan penyakit",
  },
  {
    href: "/referensi",
    icon: "clipboard",
    title: "Referensi & catatan pestisida",
    desc: "Daftar rujukan + peringatan bahan aktif",
  },
  {
    href: "/tentang",
    icon: "info",
    title: "Tentang buku saku ini",
    desc: "Cakupan, penyusun, dan catatan pemakaian",
  },
] as const;

export default function LainnyaPage() {
  return (
    <div className="px-4 py-5">
      <h1 className="mb-3 text-xl font-extrabold">Lainnya</h1>
      <ul className="grid gap-2.5">
        {MENU.map((m) => (
          <li key={m.href}>
            <Link
              href={m.href}
              className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3.5 shadow-sm transition hover:border-black/25"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hama-light text-hama">
                <Icon name={m.icon} size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-tight">
                  {m.title}
                </span>
                <span className="block text-[13px] text-ink/60">{m.desc}</span>
              </span>
              <Icon name="chevron-right" size={18} className="text-ink/30" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
