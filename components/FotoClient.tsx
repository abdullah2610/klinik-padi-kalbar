"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import ProdukRekomendasi from "./ProdukRekomendasi";
import { siapkanFoto } from "@/lib/foto";
import { batasKuota, catatKuota, sisaKuota } from "@/lib/kuota-klien";
import { katTheme } from "@/lib/theme";
import type { Kategori, Produk } from "@/lib/types";

interface Kandidat {
  slug: string;
  nama: string;
  kategori: Kategori;
  nama_latin: string;
  foto_path: string | null;
  keyakinan: number;
  alasan: string;
  produk: Produk[];
}
interface Hasil {
  kandidat: Kandidat[];
  cukup_yakin: boolean;
  catatan: string;
}

export default function FotoClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [error, setError] = useState<string | null>(null);
  // null selama SSR/sebelum mount; localStorage baru terbaca di klien.
  const [sisa, setSisa] = useState<number | null>(null);

  useEffect(() => {
    setSisa(sisaKuota("foto"));
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  // Pratinjau memakai object URL (bukan data URL) agar HP kelas bawah tak
  // menahan seluruh gambar sebagai string di memori. Wajib dilepas manual.
  function pasangPreview(url: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreview(url);
  }

  const kuotaHabis = sisa !== null && sisa <= 0;

  async function onPilih(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = ""; // izinkan pilih ulang berkas sama
    if (!file) return;
    // Jatah per-perangkat habis: hentikan sebelum kompresi/unggah.
    if (sisaKuota("foto") <= 0) {
      setSisa(0);
      return;
    }
    setError(null);
    setHasil(null);
    setLoading(true);
    try {
      const foto = await siapkanFoto(file);
      pasangPreview(URL.createObjectURL(foto.blob));
      await kirim(foto.data, foto.mediaType);
    } catch {
      setLoading(false);
      setError("Gagal membaca foto. Coba foto lain.");
    }
  }

  async function kirim(data: string, mediaType: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data, mediaType }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal memproses foto.");
        return;
      }
      // Hitung pemakaian hanya saat diagnosa berhasil — kegagalan tak memakan jatah.
      catatKuota("foto");
      setSisa(sisaKuota("foto"));
      setHasil(json as Hasil);
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksi.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    pasangPreview(null);
    setHasil(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="px-4 py-5">
      <h1 className="text-xl font-extrabold">Foto & Diagnosa</h1>
      <p className="mt-1 text-sm text-ink/65">
        Potret gejala pada daun/batang/malai. AI menduga penyebab dari 24
        gangguan buku. <span className="font-semibold">Dugaan, bukan kepastian</span> —
        konfirmasi lewat ciri pembeda di entri.
      </p>

      {sisa !== null && !kuotaHabis && (
        <p className="mt-2 text-xs text-ink/50">
          Sisa jatah diagnosa hari ini:{" "}
          <span className="font-semibold text-ink/70">{sisa}</span> dari{" "}
          {batasKuota("foto")}.
        </p>
      )}

      {kuotaHabis && (
        <div className="mt-4 rounded-xl border border-padi/40 bg-padi-light p-4 text-sm text-ink/80">
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="info" size={18} className="text-[#8a6d00]" /> Jatah
            diagnosa foto hari ini habis
          </p>
          <p className="mt-1">
            Batas {batasKuota("foto")} diagnosa/hari untuk perangkat ini sudah
            tercapai. Jatah pulih besok.
          </p>
          <Link
            href="/diagnosa"
            className="mt-2 inline-block font-semibold text-hama underline"
          >
            Gunakan Tabel Gejala →
          </Link>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPilih}
        className="hidden"
      />

      {/* Area foto */}
      <div className="mt-4">
        {preview ? (
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Foto gejala" className="max-h-72 w-full object-cover" />
          </div>
        ) : kuotaHabis ? null : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-hama/40 bg-hama-light py-12 text-hama"
          >
            <Icon name="camera" size={40} />
            <span className="font-semibold">Ambil / unggah foto</span>
            <span className="text-xs text-ink/55">
              Fokus pada gejala, cahaya cukup
            </span>
          </button>
        )}
      </div>

      {preview && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex-1 rounded-xl border border-black/15 bg-white py-2.5 text-sm font-semibold"
          >
            Foto ulang
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink/60"
          >
            Hapus
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white p-4 text-sm text-ink/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-hama border-t-transparent" />
          Menganalisis foto…
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-alert/25 bg-alert/5 p-4 text-sm text-ink/75">
          <p className="flex items-center gap-2 font-semibold text-alert">
            <Icon name="warning" size={18} /> {error}
          </p>
          <Link
            href="/diagnosa"
            className="mt-2 inline-block font-semibold text-hama underline"
          >
            Buka Tabel Gejala →
          </Link>
        </div>
      )}

      {/* Hasil */}
      {hasil && (
        <div className="mt-5">
          {!hasil.cukup_yakin && (
            <div className="mb-3 rounded-xl border border-padi/40 bg-padi-light p-3 text-sm text-ink/80">
              <p className="flex items-center gap-2 font-semibold">
                <Icon name="info" size={18} className="text-[#8a6d00]" /> Belum
                yakin
              </p>
              <p className="mt-1">{hasil.catatan}</p>
              <Link
                href="/diagnosa"
                className="mt-2 inline-block font-semibold text-hama underline"
              >
                Coba Tabel Gejala →
              </Link>
            </div>
          )}

          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink/50">
            Kandidat ({hasil.kandidat.length})
          </h2>
          <ul className="grid gap-3">
            {hasil.kandidat.map((k, i) => {
              const t = katTheme(k.kategori);
              return (
                <li key={k.slug}>
                  <Link
                    href={`/entri/${k.slug}`}
                    className="block rounded-2xl border border-black/10 bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${t.bg}`}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold leading-tight">
                        {k.nama}
                      </span>
                      <span className={`text-sm font-bold ${t.text}`}>
                        {k.keyakinan}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
                      <div
                        className={`h-full ${t.bg}`}
                        style={{ width: `${k.keyakinan}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[13px] text-ink/70">{k.alasan}</p>
                    <ProdukRekomendasi produk={k.produk ?? []} compact />
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-hama">
                      Buka entri & cek ciri pembeda
                      <Icon name="chevron-right" size={14} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 flex gap-2 rounded-xl bg-black/[0.03] px-3 py-2.5 text-[12px] leading-relaxed text-ink/60">
            <Icon name="warning" size={16} className="mt-0.5 shrink-0 text-alert" />
            Dugaan AI perlu dikonfirmasi dengan ciri pembeda di lapangan.
            Rekomendasi pestisida bersifat acuan; gunakan produk terdaftar sesuai
            label.
          </p>
        </div>
      )}
    </div>
  );
}
