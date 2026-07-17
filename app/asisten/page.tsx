import type { Metadata } from "next";
import Link from "next/link";
import AsistenClient from "@/components/AsistenClient";
import Icon from "@/components/Icon";
import { tokenRouterConfigured } from "@/lib/ai";
import { entryBySlug } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Asisten",
  description: "Tanya-jawab dari isi buku saku OPT & hara padi tadah hujan.",
};

export const dynamic = "force-dynamic";

export default async function AsistenPage({
  searchParams,
}: {
  searchParams: Promise<{ tentang?: string }>;
}) {
  const { tentang } = await searchParams;
  const fokus = tentang ? entryBySlug(tentang) : undefined;

  if (!tokenRouterConfigured()) {
    return (
      <div className="px-4 py-5">
        <h1 className="text-xl font-extrabold">Asisten</h1>
        <div className="mt-4 rounded-2xl border border-padi/40 bg-padi-light p-4">
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="info" size={20} className="text-[#8a6d00]" /> Asisten AI
            belum aktif
          </p>
          <p className="mt-2 text-sm text-ink/75">
            Asisten tanya-jawab memerlukan layanan AI yang belum dikonfigurasi.
            Sementara itu, buka{" "}
            <Link href="/entri" className="font-semibold text-hama underline">
              Telusur Entri
            </Link>{" "}
            atau{" "}
            <Link href="/diagnosa" className="font-semibold text-hama underline">
              Tabel Gejala
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return <AsistenClient fokusSlug={fokus?.slug} fokusNama={fokus?.nama} />;
}
