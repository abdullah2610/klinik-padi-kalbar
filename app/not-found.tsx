import Link from "next/link";
import Icon from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-hama-light text-hama">
        <Icon name="search" size={30} />
      </span>
      <h1 className="text-xl font-extrabold">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-xs text-sm text-ink/65">
        Entri atau halaman yang Anda cari tidak ada.
      </p>
      <Link
        href="/"
        className="mt-5 rounded-xl bg-hama px-4 py-2.5 text-sm font-semibold text-white"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
