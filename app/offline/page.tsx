import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata: Metadata = {
  title: "Offline",
  description: "Halaman ini belum tersimpan untuk mode offline.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-hama-light text-hama">
        <Icon name="leaf" size={32} />
      </span>
      <h1 className="text-xl font-extrabold">Sedang offline</h1>
      <p className="mt-2 max-w-xs text-sm text-ink/65">
        Halaman ini belum tersimpan. Entri buku yang pernah dibuka tetap bisa
        dibaca. Fitur AI (Foto & Asisten) memerlukan koneksi.
      </p>
      <div className="mt-5 flex gap-2">
        <Link
          href="/"
          className="rounded-xl bg-hama px-4 py-2.5 text-sm font-semibold text-white"
        >
          Beranda
        </Link>
        <Link
          href="/entri"
          className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Telusur entri
        </Link>
      </div>
    </div>
  );
}
