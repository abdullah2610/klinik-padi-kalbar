# -*- coding: utf-8 -*-
"""KONTEN — Buku Saku OPT & Hara Padi, Lahan Tadah Hujan Kalimantan Barat.
Disusun oleh Abdullah Umar, SP, MSc — Balai Besar Penerapan Modernisasi Pertanian Kalimantan Barat.
Entri (24 gangguan) diimpor dari entries_padi_tadah_hujan.py.
"""
from entries_padi_tadah_hujan import HAMA, PENYAKIT, HARA, QID, REFS, TIPS, VARIETAS
from produk_primaagrotech import PRODUK, REKOMENDASI, CATATAN_APLIKASI

# ---------- SAMPUL & IDENTITAS ----------
BOOK = dict(
    kicker="BUKU SAKU LAPANGAN",
    cover_bg="GREEN",
    title_lines=["Hama, Penyakit &", "Masalah Hara", "Tanaman Padi"],
    subtitle="di Lahan Tadah Hujan Kalimantan Barat",
    badges=[("HAMA", "bug", "GREEN"), ("PENYAKIT", "microbe", "TEAL"), ("MASALAH HARA", "water", "BROWN")],
    companion=["Digunakan berdampingan dengan",
               "Buku Saku PM-AAS (BRMP, Kementerian Pertanian, 2026)"],
    footer_lines=["Panduan identifikasi cepat & pengendalian hama terpadu (PHT)",
                  "untuk penyuluh, petugas lapangan, dan petani"],
    org="Balai Besar Penerapan Modernisasi Pertanian Kalbar",
    running_footer="Buku Saku OPT & Hara Padi — Tadah Hujan Kalimantan Barat",
    about_title="Tentang Buku Saku Ini",
    tips_title="Tips Praktis di Lapangan",
)

# ---------- BAGIAN & ENTRI ----------
SECTIONS = [
    dict(num="1", title="Hama", sub="Organisme Pengganggu Hewan",
         color="GREEN", light="LGREEN", icon="bug", key="bug", entries=HAMA),
    dict(num="2", title="Penyakit", sub="Patogen (Bakteri, Cendawan, Virus)",
         color="TEAL", light="LTEAL", icon="microbe", key="microbe", entries=PENYAKIT),
    dict(num="3", title="Masalah Hara", sub="Keracunan, Defisiensi Hara & Cekaman Air — Khas Tadah Hujan",
         color="BROWN", light="LBROWN", icon="water", key="water", entries=HARA),
]

# ---------- HALAMAN 'TENTANG' ----------
ABOUT = [
 "Buku saku ini membantu penyuluh, petugas lapangan (POPT), dan petani mengenali secara cepat dan tepat gangguan utama tanaman padi di lahan tadah hujan Kalimantan Barat — seperti di Kabupaten Sekadau, Sintang, dan sekitarnya — lalu mengambil keputusan pengendalian yang benar.",
 "Setiap gangguan diuraikan sistematis: nama umum & ilmiah, gejala khas, ciri pembeda, penyebab, kondisi pendukung, dampak, cara identifikasi lapangan, dan rekomendasi pengendalian hama terpadu (PHT).",
 "Lahan tadah hujan menghadapi tantangan khas: bergantung penuh pada air hujan (rawan kekeringan) dan umumnya bertanah mineral masam (ultisol/podzolik) yang miskin hara. Buku ini menekankan hal tersebut, khususnya pada bagian Masalah Hara.",
 "Buku ini dirancang berdampingan dengan Buku Saku PM-AAS (BRMP, Kementerian Pertanian, 2026). Rekomendasi bahan aktif dan ambang diselaraskan dengan pedoman PM-AAS dan Direktorat Perlindungan Tanaman Pangan.",
]
ABOUT_BOX = dict(
    cakupan_title="Cakupan",
    cakupan_lines=["24 gangguan: 11 hama, 6 penyakit, dan 7 masalah hara, cekaman air",
                   "& keracunan/defisiensi khas lahan tadah hujan (tanah mineral masam)."],
    catatan_title="Catatan pemakaian",
    catatan_bullets=[
        "Foto gejala bersumber dari publikasi BPTP/BRMP Kementerian Pertanian.",
        "Ruang 'RUANG FOTO/ILUSTRASI' dapat dilengkapi foto dokumentasi lapangan Kalbar.",
        "Bahan aktif bersifat acuan; gunakan hanya produk terdaftar/berizin sesuai label."],
)

# ---------- HALAMAN 'CARA PAKAI' ----------
CARA = [
 "Mulai dari Tabel Identifikasi Cepat: cocokkan gejala di lapangan dengan barisnya.",
 "Buka entri lengkap, cek bagian 'Ciri pembeda' untuk memastikan bukan gangguan mirip.",
 "Pakai 'Identifikasi lapangan' + ambang untuk memutuskan perlu-tidaknya tindakan.",
 "Terapkan PHT berurutan: budidaya -> fisik/mekanik -> hayati -> kimia (pilihan terakhir).",
 "Untuk masalah hara & air, perbaiki kesuburan tanah, pH, dan pengelolaan air dulu sebelum menyemprot.",
]
DECISION = "Temukan OPT -> Identifikasi -> Hitung populasi/luas (min. 10 titik zig-zag, 1x/minggu) -> Sudah capai ambang? Belum: pantau 3-7 hari. Sudah: kendalikan, utamakan musuh alami."
LEGEND = [("eye","Gejala khas","GREEN"),("compare","Ciri pembeda","TEAL"),("bug","Penyebab (hama)","BROWN"),
          ("microbe","Penyebab (penyakit)","TEAL"),("water","Kondisi / penyebab hara","TEAL"),("down","Dampak","ALERT"),
          ("check","Identifikasi + ambang","GREEN"),("shield","Pengendalian PHT","GREEN"),("bulb","Tips lapangan","AMBER_D")]

# ---------- TABEL IDENTIFIKASI CEPAT ----------
QID_PER_PAGE = 13

# ---------- PENUTUP ----------
VARIETAS_TITLE = "Varietas cocok untuk lahan tadah hujan (acuan PM-AAS 2026)"
REF_NOTE = "Rekomendasi bahan aktif pestisida bersifat acuan; gunakan hanya produk yang terdaftar dan diizinkan Kementerian Pertanian, sesuai dosis pada label. Foto gejala bersumber dari publikasi BPTP/BRMP Kementerian Pertanian."
BACK = dict(
    tagline="Kenali. Pantau. Tindak tepat.",
    sub="Pengendalian hama terpadu untuk padi yang produktif, efisien, dan ramah lingkungan di lahan tadah hujan Kalimantan Barat.",
    companion=["Berdampingan dengan Buku Saku PM-AAS", "Disusun oleh Abdullah Umar, SP, MSc · BBP Modernisasi Pertanian Kalbar"],
    org="Balai Besar Penerapan Modernisasi Pertanian Kalbar",
)
