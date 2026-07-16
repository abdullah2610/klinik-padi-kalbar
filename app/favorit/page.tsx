import type { Metadata } from "next";
import FavoritClient from "@/components/FavoritClient";
import { entries } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Favorit",
  description: "Entri buku saku yang Anda simpan.",
};

export default function FavoritPage() {
  return <FavoritClient entries={entries} />;
}
