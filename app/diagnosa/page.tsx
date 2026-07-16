import type { Metadata } from "next";
import DiagnosaClient from "@/components/DiagnosaClient";
import { qidRows } from "@/lib/konten";

export const metadata: Metadata = {
  title: "Tabel Gejala",
  description:
    "Diagnosa cepat tanpa AI: centang gejala yang terlihat, sistem menyaring kandidat gangguan padi dan menautkannya ke entri.",
};

export default function DiagnosaPage() {
  return <DiagnosaClient rows={qidRows()} />;
}
