import type { Metadata } from "next";
import Link from "next/link";
import FotoClient from "@/components/FotoClient";
import Icon from "@/components/Icon";
import { tokenRouterConfigured } from "@/lib/ai";

export const metadata: Metadata = {
  title: "Foto & Diagnosa",
  description:
    "Potret gejala padi, AI menduga penyebab dari 24 gangguan buku saku.",
};

// Evaluasi ketersediaan AI per-permintaan (env diset saat runtime di host).
export const dynamic = "force-dynamic";

export default function FotoPage() {
  if (!tokenRouterConfigured()) {
    return (
      <div className="px-4 py-5">
        <h1 className="text-xl font-extrabold">Foto & Diagnosa</h1>
        <div className="mt-4 rounded-2xl border border-padi/40 bg-padi-light p-4">
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="info" size={20} className="text-[#8a6d00]" /> Fitur AI
            belum aktif
          </p>
          <p className="mt-2 text-sm text-ink/75">
            Diagnosa foto memerlukan koneksi ke layanan AI yang belum
            dikonfigurasi. Sementara itu, gunakan{" "}
            <Link href="/diagnosa" className="font-semibold text-hama underline">
              Tabel Gejala
            </Link>{" "}
            — diagnosa cepat tanpa AI, tetap andal dan bisa offline.
          </p>
        </div>
      </div>
    );
  }
  return <FotoClient />;
}
