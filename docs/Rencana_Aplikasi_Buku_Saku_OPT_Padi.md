# Rencana Pembuatan Aplikasi: "Klinik Padi Kalbar"
### Digitalisasi Buku Saku Hama, Penyakit & Masalah Hara Padi Lahan Tadah Hujan Kalimantan Barat

**Penyusun rencana:** Abdullah Umar, SP, MSc — Balai Besar Penerapan Modernisasi Pertanian Kalimantan Barat
**Versi dokumen:** 1.0 · Juli 2026
**Basis konten:** Buku Saku OPT & Hara Padi Tadah Hujan Kalbar (24 entri: 11 hama, 6 penyakit, 7 masalah hara), berdampingan dengan Buku Saku PM-AAS (BRMP, 2026)
**Keputusan arah:** Aplikasi **web (online, mobile-friendly)** dengan **fitur pintar/AI** (identifikasi OPT dari foto + asisten tanya-jawab)

> Catatan penting soal konektivitas: pengguna sasaran (penyuluh & petani) sering berada di lahan dengan sinyal lemah. Aplikasi tetap dibangun *online-first* sesuai keputusan, tetapi rencana ini menyertakan **PWA + cache konten teks** sebagai lapisan ketahanan agar entri buku tetap terbaca saat sinyal hilang. Fitur AI (butuh server) tetap memerlukan koneksi.

---

## 1. Ringkasan Eksekutif

Aplikasi ini mengubah buku saku statis menjadi alat identifikasi dan pengambilan keputusan interaktif di lapangan. Tiga pintu masuk utama: **(a) Telusur & Cari** entri OPT/hara, **(b) Diagnosa Cepat** lewat tabel gejala interaktif, dan **(c) Fitur AI** — foto tanaman sakit lalu aplikasi menduga penyebabnya, serta asisten tanya-jawab yang menjawab hanya dari isi buku (bukan mengarang).

Nilai utama: mempercepat identifikasi yang tepat, menekan salah semprot, mendukung prinsip PHT, dan menjadi kanal penyuluhan digital BBP Modernisasi Pertanian Kalbar. Semua rekomendasi pengendalian mengacu pada isi buku dan pedoman Kementan, dengan penegasan bahwa bahan aktif bersifat acuan.

**Prinsip pembatas yang harus dijaga sepanjang pengembangan:** AI adalah alat bantu dugaan, **bukan** pemberi keputusan final. Setiap hasil AI selalu diarahkan ke entri buku resmi untuk konfirmasi manusia, dan setiap rekomendasi pestisida disertai peringatan "gunakan hanya produk terdaftar/berizin sesuai label".

---

## 2. Tujuan & Ukuran Keberhasilan

| Tujuan | Indikator (KPI) | Target awal (6 bln) |
|---|---|---|
| Mempercepat identifikasi OPT/hara | Waktu rata-rata dari buka app → entri yang tepat | < 60 detik |
| Akurasi dugaan AI foto | Top-3 accuracy pada set uji lapangan | ≥ 80% |
| Adopsi penyuluh/petani | Pengguna aktif bulanan (MAU) di Kalbar | ≥ 500 |
| Kualitas jawaban asisten | % jawaban terkonfirmasi benar oleh penyuluh (sampling) | ≥ 90% |
| Keandalan konten | Semua rekomendasi tertaut ke entri sumber | 100% |

**Bukan tujuan (out of scope) tahap ini:** transaksi jual-beli saprodi, data cuaca real-time, integrasi keuangan, dan diagnosis untuk komoditas selain padi.

---

## 3. Pengguna Sasaran & Skenario Pemakaian

**Persona 1 — Penyuluh/POPT (pengguna inti).** Butuh identifikasi cepat & akurat, ambang tindakan, dan bahan penyuluhan. Skenario: berdiri di petak, memotret daun bergejala, membandingkan dugaan AI dengan ciri pembeda di entri, memutuskan tindakan.

**Persona 2 — Petani/ketua kelompok tani.** Butuh bahasa sederhana, visual, dan langkah praktis. Skenario: melihat gejala aneh, memotret, membaca "apa yang harus dilakukan".

**Persona 3 — Admin BBP Modernisasi Pertanian Kalbar.** Butuh mengelola konten, memantau pemakaian, dan meninjau foto yang dikirim untuk memperbaiki model. Skenario: menambah entri baru, memvalidasi foto, melihat statistik OPT yang paling sering dilaporkan per kabupaten.

Alur inti (happy path): `Buka app → Foto / Cari / Tabel gejala → Dugaan + daftar kandidat → Buka entri lengkap → Cek ciri pembeda → Lihat PHT & ambang → (opsional) Tanya asisten → Simpan/bagikan`.

---

## 4. Arsitektur Sistem (tingkat tinggi)

```
                        ┌──────────────────────────────┐
                        │   Klien: Web App (PWA)        │
                        │   Mobile-first, React/Next.js │
                        │   - Telusur/Cari (offline)    │
                        │   - Kamera & unggah foto       │
                        │   - Chat asisten               │
                        └───────────────┬───────────────┘
                                        │ HTTPS / JSON
                        ┌───────────────▼───────────────┐
                        │   Backend API (Node/FastAPI)   │
                        │   - Auth ringan                │
                        │   - Endpoint konten            │
                        │   - Orkestrasi AI              │
                        │   - Rate limit & logging       │
                        └───┬─────────────┬─────────────┬┘
                            │             │             │
                ┌───────────▼──┐  ┌───────▼──────┐  ┌───▼───────────────┐
                │ DB Konten     │  │ Layanan AI   │  │ Object Storage    │
                │ (PostgreSQL)  │  │ Visi + LLM   │  │ (foto, model)     │
                │ 24 entri, QID │  │ + Vektor RAG │  │ S3/MinIO          │
                └───────────────┘  └──────────────┘  └───────────────────┘
```

Komponen kunci:
- **Klien PWA** — satu basis kode untuk HP & desktop, dapat "di-install" ke layar depan, dengan *service worker* menyimpan konten teks entri agar tetap terbaca offline.
- **Backend API** — pusat orkestrasi: melayani konten, meneruskan foto ke model visi, menjalankan pipeline RAG untuk asisten, mencatat log.
- **DB Konten** — sumber kebenaran tunggal untuk 24 entri (dari `entries_padi_tadah_hujan.py`), tabel identifikasi cepat (QID), referensi, tips, dan varietas.
- **Layanan AI** — dua bagian: (1) model visi untuk klasifikasi gambar OPT, (2) LLM + basis vektor (RAG) untuk asisten tanya-jawab yang "dikurung" pada isi buku.
- **Object storage** — menyimpan foto contoh, foto kiriman pengguna (untuk perbaikan model), dan berkas bobot model.

---

## 5. Model & Struktur Data

Konten buku sudah terstruktur rapi — ini aset besar karena bisa langsung diubah menjadi basis data. Setiap entri sudah memiliki field baku:

`no, nama, latin, gejala, pembeda, penyebab, kondisi, dampak, identifikasi, pht[], tip, photo/cap, suggest`

**Tabel utama (PostgreSQL):**

- **entri** — `id, no, kategori (hama|penyakit|hara), nama, nama_latin, gejala, pembeda, penyebab, kondisi, dampak, identifikasi, tip, foto_url, caption, saran_foto, kata_kunci[]`
- **pht_langkah** — `id, entri_id, urutan, tingkat (budidaya|mekanik|hayati|kimia), teks`
- **qid** (tabel identifikasi cepat) — `id, kategori, gejala_ringkas, dugaan, cara_cek, entri_id`
- **referensi** — `id, urutan, teks, url`
- **tips_umum**, **varietas** — daftar konten penutup.
- **foto** — `id, entri_id, url, sumber, lisensi, is_primary`
- **label_ai** — `id, entri_id, nama_kelas` (memetakan kelas model visi → entri).
- **laporan_pengamatan** (opsional, fase lanjut) — `id, user_id, entri_id, foto_url, lat, lon, kabupaten, catatan, hasil_ai, dikonfirmasi, dibuat_pada`.
- **pengguna** — `id, peran (petani|penyuluh|admin), nama, wilayah, dibuat_pada`.
- **log_ai** — `id, tipe (visi|chat), input_ringkas, output, skor, umpan_balik, dibuat_pada`.

**Langkah migrasi data:** buat skrip `export_konten.py` yang membaca `entries_padi_tadah_hujan.py` dan `padi_tadah_hujan.py`, lalu menulis `konten.json` + perintah *seed* database. Dengan ini, memperbarui buku otomatis memperbarui aplikasi (satu sumber kebenaran).

---

## 6. Fitur — Rincian

### 6.1 Fitur Inti (non-AI)

1. **Beranda / Dashboard** — tiga tombol besar: *Foto & Diagnosa*, *Tabel Gejala*, *Telusur Entri*; plus pencarian teks.
2. **Telusur & Filter** — daftar 24 entri, filter per kategori (hama/penyakit/hara) dengan kode warna sama seperti buku (hijau/teal/coklat), urut & cari nama/latin/kata kunci.
3. **Halaman Detail Entri** — replika terstruktur satu entri: foto/ilustrasi, gejala khas, **ciri pembeda** (ditonjolkan), penyebab, kondisi, dampak, identifikasi + ambang, kotak **PHT** (berjenjang), kotak **Tips**. Tombol "Tanya asisten tentang entri ini" dan "Bandingkan dengan yang mirip".
4. **Tabel Identifikasi Cepat interaktif** — versi digital QID: pilih kategori & centang gejala yang terlihat → sistem menyaring dan mengurutkan kandidat, tiap baris tertaut ke entri. Ini "diagnosa tanpa AI" yang tetal andal.
5. **Mode Perbandingan** — sandingkan 2–3 entri mirip (mis. penggerek vs orong-orong vs kresek HDB) fokus pada baris *ciri pembeda*.
6. **Bagikan & Simpan** — bagikan entri via WhatsApp/tautan, simpan favorit, ekspor ringkas ke gambar/PDF untuk penyuluhan.
7. **Referensi, Tips, Varietas** — halaman statis dari buku.

### 6.2 Fitur AI — A. Identifikasi OPT dari Foto (Computer Vision)

**Alur pengguna:** ambil/unggah foto → app mengirim ke server → model mengembalikan **daftar kandidat berurut dengan tingkat keyakinan** (mis. "Blas daun 78%, Bercak coklat 12%, HDB 6%") → tiap kandidat tertaut ke entri untuk konfirmasi lewat ciri pembeda.

**Pendekatan bertahap (realistis untuk keterbatasan data awal):**

- **Tahap 1 — LLM multimodal (cepat rilis).** Gunakan model visi-bahasa siap pakai (mis. model multimodal via API) dengan *prompt* terstruktur yang memuat ringkasan 24 kelas + ciri pembeda dari buku. Model diminta menilai foto dan memilih kandidat dari daftar tertutup, menyebut ciri yang teramati, dan **selalu** mengarahkan ke entri. Kelebihan: tanpa perlu dataset besar. Kekurangan: akurasi bergantung kualitas model & prompt, biaya per panggilan.
- **Tahap 2 — Model klasifikasi khusus (akurasi lebih tinggi).** Latih model *image classifier* (mis. arsitektur ringan seperti MobileNet/EfficientNet via *transfer learning*) pada dataset foto OPT padi yang dilabeli. Butuh **1.000–3.000+ foto** terlabel per tahap awal (idealnya 100–200 foto/kelas). Sumber data: foto buku, dokumentasi lapangan BBP/POPT Kalbar, kontribusi pengguna yang divalidasi, dan dataset publik OPT padi.
- **Tahap 3 — Hibrida.** Model khusus untuk kelas yang datanya cukup + fallback ke LLM multimodal untuk kasus tak yakin, dengan aturan ambang keyakinan.

**Aturan keselamatan (wajib):**
- Selalu tampilkan **beberapa kandidat**, bukan satu jawaban tunggal.
- Bila keyakinan rendah (< ambang), tampilkan pesan "belum yakin — gunakan Tabel Gejala atau kirim foto lebih jelas".
- Tegaskan: "Dugaan AI perlu dikonfirmasi dengan ciri pembeda di lapangan."
- Batasi ke domain padi; tolak foto non-relevan.

**Data & privasi:** foto kiriman disimpan dengan izin, dipakai untuk perbaikan model; metadata lokasi opsional (untuk peta sebaran) dengan persetujuan.

### 6.3 Fitur AI — B. Asisten Tanya-Jawab (Chatbot RAG)

**Tujuan:** menjawab pertanyaan bahasa alami ("kenapa daun padi saya menggulung saat kemarau?", "beda blas dan bercak coklat apa?") **hanya berdasarkan isi buku**, bukan pengetahuan bebas yang bisa keliru.

**Arsitektur RAG (Retrieval-Augmented Generation):**
1. **Indexing** — potong 24 entri + tips + varietas + referensi menjadi bagian-bagian kecil (*chunks*), buat *embedding*, simpan di basis vektor (mis. pgvector/Qdrant).
2. **Retrieval** — pertanyaan pengguna → cari *chunk* paling relevan.
3. **Generation** — LLM menjawab **hanya** dari *chunk* terambil, wajib menyertakan **rujukan entri** ("Sumber: entri Blas") dan menolak menjawab di luar cakupan buku ("informasi ini belum ada di buku saku").

**Pagar pengaman (guardrails):**
- Jawaban singkat, bahasa sederhana, selalu menautkan entri sumber.
- Tidak memberi dosis pestisida spesifik di luar yang tertulis; selalu tambahkan peringatan produk terdaftar/label.
- Tidak menjawab topik medis/keuangan/di luar padi tadah hujan.
- Log jawaban untuk audit kualitas oleh penyuluh.

**Bahasa:** utamakan Bahasa Indonesia; pertimbangkan istilah lokal umum. Antarmuka suara (voice-to-text) dapat ditambahkan di fase lanjut untuk pengguna berliterasi rendah.

---

## 7. Rancangan Antarmuka (UI/UX)

Prinsip: **mobile-first, tombol besar, kontras tinggi, ikon konsisten dengan buku**, teks besar terbaca di bawah sinar matahari. Palet mengikuti buku: Hijau `#1F7A43` (hama), Teal `#0E7C7B` (penyakit), Coklat `#9C6B3F` (hara), aksen Kuning Padi `#F2A900`.

Layar utama:
1. **Beranda** — 3 aksi besar + pencarian + entri yang sering dilihat.
2. **Kamera/Diagnosa** — antarmuka ambil foto, panduan "foto yang baik" (fokus, cahaya), hasil kandidat berkartu.
3. **Hasil AI** — kartu kandidat berurut + keyakinan + tombol "Buka entri" & "Kenapa dugaan ini?".
4. **Detail Entri** — tata letak seperti buku, ciri pembeda ditonjolkan, kotak PHT & Tips berwarna.
5. **Tabel Gejala interaktif** — daftar centang gejala → kandidat menyaring langsung.
6. **Asisten** — antarmuka chat dengan contoh pertanyaan, kutipan sumber di tiap jawaban.
7. **Profil/Riwayat** — favorit, riwayat diagnosa, pengaturan bahasa & wilayah.

Aksesibilitas: memenuhi kontras WCAG AA, target sentuh ≥ 44px, dukungan pembaca layar untuk teks entri.

---

## 8. Rekomendasi Tumpukan Teknologi (Tech Stack)

| Lapisan | Pilihan disarankan | Alasan |
|---|---|---|
| Frontend | Next.js (React) + PWA + Tailwind | Mobile-first, SSR untuk cepat, PWA untuk cache offline konten |
| Backend | Node.js (NestJS) **atau** Python (FastAPI) | FastAPI unggul bila banyak kerja AI/ML Python |
| Database | PostgreSQL + pgvector | Relasional untuk konten + vektor untuk RAG dalam satu sistem |
| Object storage | S3 / MinIO | Foto & bobot model |
| Model visi | Transfer learning (EfficientNet/MobileNet) + API multimodal untuk fase awal | Ringan, bisa mulai tanpa dataset besar |
| RAG/LLM | LLM via API + framework RAG (mis. LangChain/LlamaIndex) | Cepat dibangun, guardrail terkelola |
| Hosting | VPS/cloud regional Indonesia (mis. layanan cloud nasional) | Latensi & kepatuhan data |
| Analitik | Event logging + dashboard (mis. Metabase) | Pantau pemakaian & OPT terpopuler |

Pertimbangan biaya: fitur AI berbasis API dikenai biaya per pemakaian — perlu *rate limit*, *caching* jawaban umum, dan pemantauan kuota. Model visi khusus (Tahap 2) menurunkan biaya jangka panjang.

---

## 9. Peta Jalan (Roadmap) & Tahapan

### Fase 0 — Persiapan (2–3 minggu)
- Finalisasi ruang lingkup, desain UI (wireframe → prototype), skema data.
- Skrip ekspor konten buku → `konten.json` + seed DB.
- Kumpulkan & rapikan aset foto (lisensi jelas) dan mulai pelabelan.

### Fase 1 — MVP Konten (4–6 minggu) — *rilis pertama, tanpa AI berat*
- PWA: beranda, telusur/cari, detail entri, **tabel gejala interaktif**, referensi/tips/varietas.
- Cache offline konten teks. Bagikan & favorit.
- Nilai: sudah berguna di lapangan sebagai "buku saku pintar".

### Fase 2 — Asisten RAG (3–5 minggu)
- Index konten → basis vektor; endpoint chat dengan guardrail & kutipan sumber.
- Uji kualitas jawaban bersama penyuluh (set pertanyaan uji).

### Fase 3 — Identifikasi Foto Tahap 1 (3–4 minggu)
- Pipeline foto → LLM multimodal dengan prompt kelas tertutup + ciri pembeda.
- Kartu kandidat + ambang keyakinan + arahan ke entri.

### Fase 4 — Model Visi Khusus Tahap 2 (8–12 minggu, paralel pengumpulan data)
- Kumpulkan/labeli dataset (target 100–200 foto/kelas), latih classifier, evaluasi.
- Loop perbaikan: foto pengguna tervalidasi → tambah data → latih ulang.

### Fase 5 — Fitur Lanjut (opsional)
- Pencatatan pengamatan + GPS → **peta sebaran OPT** per kabupaten (Sekadau, Sintang, dst.) untuk peringatan dini.
- Dashboard admin, notifikasi musiman, antarmuka suara, mode banyak bahasa/dialek.
- Integrasi dengan sistem BBP/Kementan bila diperlukan.

**Total perkiraan hingga fitur AI matang:** ~6–9 bulan bergantung ketersediaan data foto & tim.

---

## 10. Kebutuhan Tim & Sumber Daya

| Peran | Fungsi | Fase paling dibutuhkan |
|---|---|---|
| Product owner / ahli materi (Anda) | Validasi konten & rekomendasi, prioritas | Semua |
| UI/UX designer | Wireframe, prototipe, aksesibilitas | 0–1 |
| Frontend dev (React/Next.js) | PWA & antarmuka | 1–5 |
| Backend dev | API, DB, orkestrasi AI | 1–5 |
| ML engineer | Model visi & RAG | 2–4 |
| Anotator data (bisa penyuluh/mahasiswa magang) | Pelabelan foto | 0, 4 |
| QA / uji lapangan | Uji bersama penyuluh & petani | 1–5 |

Untuk instansi pemerintah, opsi pelaksanaan: pengembangan internal, kerja sama perguruan tinggi (mis. Untan), atau pihak ketiga melalui pengadaan. Aset foto & validasi domain sebaiknya tetap dikuasai BBP.

---

## 11. Data Foto & Pelatihan Model (kritis untuk AI)

Ini adalah **risiko dan penentu keberhasilan terbesar** fitur foto. Kualitas model = kualitas & jumlah data.

- **Sumber:** foto buku (terbatas), dokumentasi POPT/penyuluh Kalbar, kegiatan lapangan, kontribusi pengguna (dengan validasi), dataset publik OPT padi (cek lisensi).
- **Standar foto:** fokus pada gejala, pencahayaan cukup, sertakan skala/latar konsisten; kumpulkan variasi (fase tanaman, tingkat keparahan, sudut).
- **Pelabelan:** dilakukan/diverifikasi ahli (Anda/penyuluh senior) agar label benar; simpan metadata (lokasi, tanggal, fase).
- **Etika & lisensi:** persetujuan pengguna untuk pemakaian foto; hormati hak cipta foto buku/publikasi.
- **Loop perbaikan berkelanjutan:** foto pengguna → antrean validasi admin → data latih → latih ulang berkala.

Rekomendasi: mulai program pengumpulan foto **sejak Fase 0** agar Tahap 2 tidak tersendat.

---

## 12. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data foto kurang → akurasi AI rendah | Fitur unggulan gagal dipercaya | Mulai kumpul foto lebih awal; pakai LLM multimodal dulu; selalu tampilkan multi-kandidat |
| AI memberi dugaan salah lalu petani salah tindak | Kerugian hasil, hilang kepercayaan | Guardrail: multi-kandidat, ambang keyakinan, konfirmasi lewat ciri pembeda, peringatan pestisida |
| Sinyal lemah di lahan | Fitur AI tak jalan | PWA cache konten teks; fitur diagnosa non-AI (tabel gejala) tetap offline |
| Biaya API AI membengkak | Anggaran | Rate limit, cache jawaban umum, migrasi ke model khusus |
| Konten usang / bahan aktif berubah | Rekomendasi keliru | Satu sumber kebenaran dari buku; jadwal peninjauan berkala; tautkan pedoman Kementan terbaru |
| Ketergantungan vendor | Keberlanjutan | Utamakan komponen open-source & data milik BBP |

---

## 13. Keamanan, Privasi & Kepatuhan
- Autentikasi ringan (cukup untuk penyuluh/admin; petani bisa mode tamu).
- Enkripsi in-transit (HTTPS) dan penyimpanan foto terkontrol.
- Persetujuan (consent) untuk foto & lokasi; kebijakan privasi jelas dalam Bahasa Indonesia.
- Kepatuhan data pemerintah: pertimbangkan hosting di Indonesia dan tata kelola data BBP.
- Audit log untuk keluaran AI (akuntabilitas rekomendasi).

---

## 14. Estimasi Biaya (indikatif, perlu dirinci saat perencanaan anggaran)
- **Pengembangan** (Fase 1–3): bergantung skema (internal vs pihak ketiga) — susun RAB terpisah.
- **Operasional bulanan:** hosting/VPS + database + object storage (relatif kecil di awal) + **biaya API AI** (variabel per pemakaian — komponen terbesar bila trafik tinggi).
- **Penghematan jangka panjang:** melatih model visi khusus mengurangi biaya API foto; cache mengurangi biaya chat.
> Sediakan pos anggaran khusus "biaya inferensi AI" dan pantau sejak hari pertama.

---

## 15. Langkah Selanjutnya (rekomendasi tindakan segera)
1. **Kunci ruang lingkup MVP (Fase 1)** dan setujui wireframe.
2. **Buat skrip ekspor** `entries_padi_tadah_hujan.py` → `konten.json` (bisa saya bantu buat sekarang) sebagai fondasi data.
3. **Mulai program pengumpulan & pelabelan foto** OPT padi Kalbar (paling menentukan keberhasilan AI).
4. **Bangun prototipe RAG kecil** memakai 24 entri untuk membuktikan konsep asisten sebelum investasi besar.
5. **Tetapkan model pelaksanaan** (internal / kerja sama kampus / pihak ketiga) dan susun RAB.

---

### Lampiran A — Pemetaan Isi Buku → Fitur Aplikasi
| Elemen buku | Menjadi fitur |
|---|---|
| 24 entri terstruktur | Basis data entri + halaman detail |
| Tabel Identifikasi Cepat (QID) | Diagnosa interaktif tanpa AI |
| Ciri pembeda | Inti konfirmasi manual & mode perbandingan; konteks untuk AI |
| Kotak PHT berjenjang | Panduan tindakan berurutan |
| Foto & "saran foto" | Aset awal model visi + panduan foto |
| Referensi & catatan bahan aktif | Halaman rujukan + guardrail peringatan pestisida |
| Varietas & tips | Konten penyuluhan + bahan jawaban asisten |

### Lampiran B — Contoh Aturan Guardrail Asisten (ringkas)
- Jawab hanya dari konten buku; jika tak ada, katakan belum tersedia.
- Selalu sertakan "Sumber: entri <nama>".
- Untuk pestisida: sebut hanya bahan aktif yang tertulis + peringatan produk terdaftar/label.
- Tolak topik di luar padi tadah hujan Kalbar.
- Untuk dugaan foto: tampilkan ≥ 2 kandidat + arahkan konfirmasi ciri pembeda.
