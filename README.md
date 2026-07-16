# Klinik Padi Kalbar — Buku Saku OPT & Hara Padi (Web App + Konten)

Aplikasi web (PWA, mobile-friendly) yang mendigitalkan **Buku Saku Hama, Penyakit & Masalah Hara Tanaman Padi di Lahan Tadah Hujan Kalimantan Barat** — dengan fitur AI (diagnosa foto + asisten tanya-jawab).

**Penyusun:** Abdullah Umar, SP, MSc — Balai Besar Penerapan Modernisasi Pertanian Kalimantan Barat.

24 gangguan: **11 hama · 6 penyakit · 7 masalah hara** (khas tanah mineral masam, rawan kekeringan).

---

## Status Pengembangan

| Fase | Isi | Status |
|---|---|---|
| **0** | Pipeline konten (`content/*.py` → `konten.json`) | ✅ Selesai |
| **1** | MVP PWA: beranda, telusur/cari, detail entri, tabel gejala interaktif, perbandingan, favorit, halaman panduan/tips/varietas/referensi/tentang, cache offline | ✅ Selesai |
| **2** | Asisten RAG (tanya-jawab dikurung isi buku) | ✅ Dibangun¹ |
| **3** | Diagnosa foto AI (visi, kelas tertutup 24 entri) | ✅ Dibangun¹ |
| 4 | Model visi khusus (dataset terlabel) | ⏳ Butuh pengumpulan data |
| 5 | Peta sebaran OPT, dashboard admin | ⏳ Lanjutan |

¹ Kode Fase 2 & 3 lengkap, build hijau, dan **degrade mulus tanpa API key**. Round-trip LLM langsung belum diuji di lingkungan ini karena `ANTHROPIC_API_KEY` belum tersedia — set kunci lalu uji `/foto` dan `/asisten`.

---

## Menjalankan

```bash
pnpm install
pnpm dev            # http://localhost:3000  (otomatis re-export konten + sync aset)
# produksi:
pnpm build && pnpm start
```

`predev`/`prebuild` otomatis menjalankan `export:konten` (Python) lalu `sync:public` (salin `konten.json` + foto ke `public/`). Perlu **Python 3** + **Node 20+/pnpm**.

### Fitur AI (opsional)

```bash
cp .env.example .env.local
# isi ANTHROPIC_API_KEY=...   (opsional ANTHROPIC_MODEL, default claude-opus-4-8)
```

Tanpa kunci, aplikasi tetap **jalan penuh**: Telusur, Detail, Tabel Gejala, Perbandingan, Favorit, dan halaman statis semuanya bekerja (dan bisa offline). Halaman Foto & Asisten menampilkan pemberitahuan "belum aktif" dan mengarahkan ke Tabel Gejala.

---

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** — palet mengikuti buku (hijau/teal/coklat + kuning padi)
- **PWA**: `manifest.webmanifest` + service worker (`public/sw.js`) — cache konten teks & foto untuk keterbacaan offline
- **AI**: `@anthropic-ai/sdk` — visi (structured output, kelas tertutup 24 slug via zod enum) + asisten (streaming, RAG kata-kunci atas 24 entri). Model default `claude-opus-4-8`.

Mobile-first, tombol besar, kontras tinggi, target sentuh ≥44px (WCAG AA).

---

## Alur Data (satu sumber kebenaran)

```
content/*.py ──export_konten.py──▶ data/konten.json ──sync_public.mjs──▶ public/ ──▶ app
   ▲  (edit isi buku HANYA di sini)                                   (SSG/SSR + offline cache)
```

Edit isi buku hanya di `content/`, jalankan ulang ekspor. `lib/konten.ts` mengimpor `data/konten.json` langsung (build-time) untuk render statis; SW meng-cache salinan `public/konten.json` untuk offline.

## Struktur Folder

```
klinik-padi-kalbar/
├── content/                  # SUMBER KEBENARAN (isi buku, Python)
│   ├── padi_tadah_hujan.py           # metadata, bagian, panduan
│   └── entries_padi_tadah_hujan.py   # 24 entri + QID + referensi + tips + varietas
├── scripts/
│   ├── export_konten.py      # .py -> data/konten.json
│   └── sync_public.mjs        # data/ + assets/ -> public/
├── data/konten.json          # hasil ekspor (dipakai app & seed DB)
├── assets/photos/            # 13 foto gejala (BPTP/BRMP Kementan)
├── app/                      # rute Next.js (App Router)
│   ├── page.tsx  entri/  diagnosa/  banding/  foto/  asisten/  favorit/
│   ├── panduan/ referensi/ tips/ varietas/ tentang/ lainnya/ offline/
│   └── api/foto/  api/asisten/       # route handler AI
├── components/               # UI (EntryCard, DiagnosaClient, dst.)
├── lib/                      # konten, tipe, tema, rag, ai, favorites
├── public/                   # manifest, ikon, sw.js (+ salinan konten/foto)
└── docs/                     # Rencana_Aplikasi...md + PDF buku
```

## Halaman Utama

- **Beranda** — 3 aksi besar (Foto, Tabel Gejala, Telusur) + pencarian + kategori + sering dilihat
- **Telusur** (`/entri`) — 24 entri, cari (`?q=`) & filter kategori (`?kat=`)
- **Detail** (`/entri/[slug]`) — gejala, **ciri pembeda** (ditonjolkan), penyebab, kondisi, dampak, identifikasi+ambang, PHT berjenjang, tips; favorit, bagikan, entri mirip
- **Tabel Gejala** (`/diagnosa`) — centang gejala → kandidat tersaring & tertaut entri (tanpa AI, bisa offline)
- **Bandingkan** (`/banding`) — sandingkan 2–3 entri, fokus ciri pembeda
- **Foto** (`/foto`) — potret gejala → kandidat AI berurut + keyakinan + arah ke entri
- **Asisten** (`/asisten`) — tanya-jawab dari isi buku, menautkan entri sumber

## Pagar Pengaman AI (wajib)

- AI = **alat bantu dugaan**, bukan keputusan final. Foto selalu tampilkan multi-kandidat + arahkan ke ciri pembeda.
- Asisten menjawab **hanya** dari isi buku (RAG), menolak di luar cakupan, selalu menautkan entri sumber.
- Rekomendasi pestisida bersifat acuan; gunakan hanya produk terdaftar/berizin Kementan sesuai label.

## Catatan

- Foto gejala bawaan bersumber dari publikasi BPTP/BRMP Kementerian Pertanian — periksa lisensi sebelum publikasi luas.
- Rencana lengkap 15 bagian: `docs/Rencana_Aplikasi_Buku_Saku_OPT_Padi.md`.
