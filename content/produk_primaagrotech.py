# -*- coding: utf-8 -*-
"""Katalog biopestisida PRIMAAGROTECH + pemetaan ke entri gangguan padi.

Hanya produk yang sasarannya relevan untuk padi lahan tadah hujan yang
dimasukkan (produk multi-komoditas lain seperti untuk kopi/karet/bawang tidak
dicantumkan). Semua produk sudah berizin; nomor izin tidak ditampilkan di app.
Dosis mengikuti petunjuk kemasan (tidak dicantumkan sebagai angka).

REKOMENDASI memetakan slug entri -> daftar id produk (+ catatan opsional).
Slug entri harus sama dengan slugify(nama) di export_konten.py; divalidasi
saat ekspor (gagal bila slug/produk tak dikenal).
"""

# --- Katalog produk (hanya yang bersasaran padi) ---
PRODUK = [
    dict(
        id="vertiplus",
        nama="VERTIPLUS",
        jenis="Insektisida mikroba",
        komposisi=["Verticillium lecanii", "Beauveria bassiana"],
        sasaran_umum="Hama pengisap: wereng, kutu kebul, kutu putih, psyllidae.",
    ),
    dict(
        id="metarizep",
        nama="METARIZEP",
        jenis="Insektisida mikroba",
        komposisi=["Metarhizium anisopliae", "Beauveria bassiana"],
        sasaran_umum="Wereng coklat, kutu daun, thrips.",
    ),
    dict(
        id="entomobac",
        nama="ENTOMOBAC",
        jenis="Insektisida mikroba",
        komposisi=["Metarhizium anisopliae", "Beauveria bassiana"],
        sasaran_umum="Penggerek (daun/buah), wereng, psyllidae, larva kumbang.",
    ),
    dict(
        id="paenamaxi",
        nama="PAENAMAXI",
        jenis="Fungisida mikroba",
        komposisi=["Paenibacillus polymyxa", "Bacillus amyloliquefaciens"],
        sasaran_umum="Blas, hawar daun bakteri, bercak daun.",
    ),
    dict(
        id="biotracol",
        nama="BIOTRACOL",
        jenis="Fungisida mikroba",
        komposisi=["Streptomyces thermovulgaris", "Trichoderma harzianum"],
        sasaran_umum="Blas, hawar daun bakteri, layu, busuk.",
    ),
    dict(
        id="primadeco",
        nama="PRIMADECO",
        jenis="Fungisida mikroba",
        komposisi=["Streptomyces thermovulgaris", "Geobacillus thermocatenulatus"],
        sasaran_umum="Blas (ledakan padi), hawar daun bakteri, layu.",
    ),
    dict(
        id="bactoplus",
        nama="BACTOPLUS",
        jenis="Pupuk hayati",
        komposisi=["Azospirillum brasilense", "Pseudomonas fluorescens", "Trichoderma asperellum"],
        sasaran_umum="Perbaiki serapan hara & pulihkan kesuburan tanah; hemat pupuk s/d 30%.",
    ),
]

# --- Pemetaan entri -> produk (utamakan produk sesuai sasaran) ---
# Urutan produk = prioritas tampil. catatan opsional untuk konteks khusus.
_VEKTOR = (
    "Produk menekan vektor (wereng hijau) penyebar virus, bukan virusnya. "
    "Utamakan pencegahan: varietas tahan + kendali wereng sejak dini."
)
REKOMENDASI = {
    # Penyakit — sasaran kuat
    "blas-blast": dict(produk=["paenamaxi", "biotracol", "primadeco"]),
    "hawar-daun-bakteri-hdb-kresek": dict(produk=["paenamaxi", "biotracol", "primadeco"]),
    "hawar-pelepah-daun": dict(produk=["biotracol"]),
    # Hama pengisap / wereng
    "wereng-batang-coklat-wbc": dict(produk=["metarizep", "vertiplus", "entomobac"]),
    "wereng-hijau": dict(produk=["vertiplus", "metarizep", "entomobac"]),
    "tungro": dict(produk=["vertiplus", "metarizep", "entomobac"], catatan=_VEKTOR),
    # Hama penggerek / pemakan daun
    "penggerek-batang-padi": dict(produk=["entomobac", "metarizep"]),
    "hama-putih-palsu-pelipat-daun": dict(produk=["entomobac"]),
    "belalang-ulat-grayak": dict(produk=["entomobac", "metarizep"]),
    # Hara — pupuk hayati pendukung
    "defisiensi-nitrogen-n": dict(produk=["bactoplus"]),
    "defisiensi-fosfor-p": dict(produk=["bactoplus"]),
    "defisiensi-kalium-k": dict(produk=["bactoplus"]),
    "defisiensi-zink-zn": dict(produk=["bactoplus"]),
    "kemasaman-tanah-keracunan-aluminium-al": dict(produk=["bactoplus"]),
}

# Ditampilkan sekali di UI (dosis tak diberikan sebagai angka).
CATATAN_APLIKASI = "Dosis & cara pakai: ikuti petunjuk pada kemasan."
