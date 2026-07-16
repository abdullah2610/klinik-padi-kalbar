# Klinik Padi Kalbar — Proyek Aplikasi Buku Saku OPT & Hara Padi

Repositori awal untuk mendigitalkan **Buku Saku Hama, Penyakit & Masalah Hara Tanaman Padi di Lahan Tadah Hujan Kalimantan Barat** menjadi aplikasi web (online, mobile-friendly) dengan fitur AI.

**Penyusun:** Abdullah Umar, SP, MSc — Balai Besar Penerapan Modernisasi Pertanian Kalimantan Barat.

---

## Struktur Folder

```
klinik-padi-kalbar/
├── README.md                       # berkas ini
├── content/                        # SUMBER KEBENARAN TUNGGAL (isi buku)
│   ├── padi_tadah_hujan.py         # metadata buku, bagian, cara pakai, dst.
│   └── entries_padi_tadah_hujan.py # 24 entri + tabel identifikasi + referensi
├── scripts/
│   └── export_konten.py            # ubah konten .py -> data/konten.json
├── data/
│   └── konten.json                 # HASIL EKSPOR (dipakai frontend / seed DB)
├── assets/
│   └── photos/                     # 13 foto gejala (sumber publikasi BPTP/BRMP)
└── docs/
    ├── Rencana_Aplikasi_Buku_Saku_OPT_Padi.md   # rencana lengkap 15 bagian
    └── Buku_Saku_OPT_Hara_Padi_Tadah_Hujan_Kalbar.pdf  # buku final (referensi)
```

## Alur Data (prinsip satu sumber kebenaran)

```
content/*.py  ──(scripts/export_konten.py)──▶  data/konten.json  ──▶  aplikasi
   ▲                                                                    (frontend + seed database)
   │  ubah isi buku HANYA di sini, lalu jalankan ulang ekspor
```

Buku (berkas `.py` di `content/`) adalah satu-satunya tempat isi diedit. Setiap perubahan konten diikuti menjalankan ulang skrip ekspor agar `data/konten.json` sinkron. Dengan begitu buku cetak (PDF) dan aplikasi selalu berasal dari sumber yang sama.

## Cara Menjalankan Ekspor

```bash
cd klinik-padi-kalbar
python3 scripts/export_konten.py
# opsi:
python3 scripts/export_konten.py --content content/padi_tadah_hujan.py --out data/konten.json
```

Skrip mencetak ringkasan verifikasi (jumlah entri per kategori, baris QID, referensi, tips, entri berfoto).

## Skema `konten.json` (ringkas)

| Kunci | Isi |
|---|---|
| `meta` | judul, subjudul, penyusun, institusi, versi, tanggal ekspor, jumlah entri |
| `sections` | 3 bagian (hama/penyakit/hara) + warna, ikon, jumlah |
| `legenda`, `cara_pakai`, `alur_keputusan` | konten halaman panduan |
| `tentang`, `tentang_box` | halaman "Tentang" |
| `entries[]` | 24 entri: `no, slug, kategori, nama, nama_latin, gejala, pembeda, penyebab, kondisi, dampak, identifikasi, tip, pht[], foto{}, kata_kunci[]` |
| `tabel_identifikasi_cepat[]` | 24 baris: `kategori, gejala_ringkas, dugaan, cara_cek` |
| `referensi[]`, `catatan_referensi` | daftar rujukan + peringatan pestisida |
| `tips[]`, `varietas{}`, `back{}` | konten penutup |

Field `entries[].foto` berisi `{file, path, caption, saran_foto, ada_foto}`. Jika `ada_foto=false`, gunakan `saran_foto` sebagai deskripsi gambar yang perlu dilengkapi dari dokumentasi lapangan.

## Langkah Berikutnya (lihat docs/Rencana_Aplikasi...md)

1. Bangun **MVP frontend** (PWA) yang membaca `data/konten.json`: telusur, detail entri, tabel gejala interaktif.
2. **Seed database** dari `konten.json` untuk backend.
3. Mulai **pengumpulan & pelabelan foto** OPT padi Kalbar untuk model AI.
4. Prototipe **asisten RAG** dari 24 entri.

## Catatan Penting
- Rekomendasi bahan aktif pestisida di dalam konten **bersifat acuan**; gunakan hanya produk terdaftar/berizin Kementan sesuai label.
- Foto gejala bawaan bersumber dari publikasi BPTP/BRMP Kementerian Pertanian — periksa lisensi sebelum publikasi luas.
- Fitur AI adalah alat bantu dugaan; keputusan akhir tetap dikonfirmasi lewat *ciri pembeda* dan penilaian manusia.
