# -*- coding: utf-8 -*-
"""Ekspor konten buku saku -> konten.json (sumber data tunggal untuk aplikasi).

Membaca modul konten (content/padi_tadah_hujan.py yang mengimpor
content/entries_padi_tadah_hujan.py) lalu menulis satu berkas JSON terstruktur
yang siap dipakai frontend / seed database.

Pemakaian:
    python scripts/export_konten.py
    python scripts/export_konten.py --content content/padi_tadah_hujan.py --out data/konten.json

Catatan: skrip ini TIDAK mengubah isi buku. Buku (modul .py) tetap menjadi
sumber kebenaran tunggal; jalankan ulang skrip ini setiap kali konten berubah.
"""
import os, sys, re, json, argparse, importlib.util, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# key bagian (di modul konten) -> kategori kanonik untuk aplikasi
KATEGORI = {"bug": "hama", "microbe": "penyakit", "water": "hara"}

STOPWORDS = {"padi", "daun", "dan", "di", "de", "sp", "spp", "pv"}


def load_content(path):
    """Muat modul konten; pastikan direktori content ada di sys.path agar
    'from entries_padi_tadah_hujan import ...' berhasil."""
    d = os.path.dirname(os.path.abspath(path))
    if d not in sys.path:
        sys.path.insert(0, d)
    spec = importlib.util.spec_from_file_location("content_module", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def slugify(text):
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def keywords(nama, latin):
    """Kata kunci sederhana untuk pencarian: dari nama umum + nama latin."""
    words = re.split(r"[^a-zA-Z]+", f"{nama} {latin or ''}".lower())
    out = []
    for w in words:
        if len(w) >= 3 and w not in STOPWORDS and w not in out:
            out.append(w)
    return out


def entry_to_dict(e, kategori):
    """Ubah satu entri (dict dari modul konten) ke skema aplikasi."""
    foto = e.get("photo")
    return {
        "no": e["no"],
        "slug": slugify(e["nama"]),
        "kategori": kategori,
        "nama": e["nama"],
        "nama_latin": e.get("latin", ""),
        "gejala": e.get("gejala", ""),
        "pembeda": e.get("pembeda", ""),
        "penyebab": e.get("penyebab", ""),
        "kondisi": e.get("kondisi", ""),
        "dampak": e.get("dampak", ""),
        "identifikasi": e.get("identifikasi", ""),
        "tip": e.get("tip", ""),
        "pht": [{"urutan": i + 1, "teks": t} for i, t in enumerate(e.get("pht", []))],
        "foto": {
            # "file" = berkas sumber (PNG) di assets/photos; "path" menunjuk
            # keluaran WebP yang dihasilkan sync_public.mjs saat build (~88%
            # lebih kecil). Ekstensi sengaja dipaksa .webp agar konten.json
            # selaras dengan berkas yang benar-benar disalin ke public/.
            "file": foto,
            "path": (f"assets/photos/{os.path.splitext(foto)[0]}.webp" if foto else None),
            "caption": e.get("cap"),
            "saran_foto": e.get("suggest"),
            "ada_foto": bool(foto),
        },
        "kata_kunci": keywords(e["nama"], e.get("latin")),
    }


def build_produk(C, entries):
    """Katalog biopestisida + rekomendasi per-entri. Validasi silang: setiap
    slug entri & id produk pada REKOMENDASI harus dikenal (gagal cepat)."""
    katalog = list(getattr(C, "PRODUK", []))
    rekomendasi_src = getattr(C, "REKOMENDASI", {})
    if not katalog:
        return {"katalog": [], "rekomendasi": {}, "catatan_aplikasi": ""}

    slug_set = {e["slug"] for e in entries}
    id_set = {p["id"] for p in katalog}

    rekomendasi = {}
    for slug, r in rekomendasi_src.items():
        if slug not in slug_set:
            raise ValueError(f"REKOMENDASI merujuk slug entri tak dikenal: {slug!r}")
        ids = r.get("produk", [])
        for pid in ids:
            if pid not in id_set:
                raise ValueError(f"REKOMENDASI[{slug!r}] merujuk id produk tak dikenal: {pid!r}")
        rekomendasi[slug] = {"produk_ids": ids, "catatan": r.get("catatan", "")}

    return {
        "katalog": katalog,
        "rekomendasi": rekomendasi,
        "catatan_aplikasi": getattr(C, "CATATAN_APLIKASI", ""),
    }


def build(C):
    sections_meta = []
    entries = []
    for sec in C.SECTIONS:
        kategori = KATEGORI.get(sec.get("key"), sec.get("key"))
        sections_meta.append({
            "num": sec["num"],
            "kategori": kategori,
            "title": sec["title"],
            "sub": sec.get("sub", ""),
            "color": sec.get("color"),
            "light": sec.get("light"),
            "icon": sec.get("icon"),
            "key": sec.get("key"),
            "jumlah": len(sec["entries"]),
        })
        for e in sec["entries"]:
            entries.append(entry_to_dict(e, kategori))

    qid = [{
        "kategori": KATEGORI.get(k, k),
        "key": k,
        "gejala_ringkas": gj,
        "dugaan": dug,
        "cara_cek": cek,
    } for (k, gj, dug, cek) in C.QID]

    produk = build_produk(C, entries)

    data = {
        "meta": {
            "judul": " ".join(C.BOOK.get("title_lines", [])).strip(),
            "subjudul": C.BOOK.get("subtitle", ""),
            "kicker": C.BOOK.get("kicker", ""),
            "penyusun": "Abdullah Umar, SP, MSc",
            "institusi": "Balai Besar Penerapan Modernisasi Pertanian Kalimantan Barat",
            "pendamping": C.BOOK.get("companion", []),
            "org": C.BOOK.get("org", ""),
            "versi": "1.0",
            "diekspor_pada": datetime.datetime.now().isoformat(timespec="seconds"),
            "jumlah_entri": len(entries),
        },
        "sections": sections_meta,
        "legenda": [{"icon": k, "label": lab, "color": c} for (k, lab, c) in getattr(C, "LEGEND", [])],
        "cara_pakai": list(getattr(C, "CARA", [])),
        "alur_keputusan": getattr(C, "DECISION", ""),
        "tentang": list(getattr(C, "ABOUT", [])),
        "tentang_box": getattr(C, "ABOUT_BOX", {}),
        "entries": entries,
        "produk": produk,
        "tabel_identifikasi_cepat": qid,
        "referensi": [{"urutan": i + 1, "teks": r} for i, r in enumerate(getattr(C, "REFS", []))],
        "catatan_referensi": getattr(C, "REF_NOTE", ""),
        "tips": list(getattr(C, "TIPS", [])),
        "varietas": {"judul": getattr(C, "VARIETAS_TITLE", ""), "teks": getattr(C, "VARIETAS", "")},
        "back": getattr(C, "BACK", {}),
    }
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--content", default=os.path.join(ROOT, "content", "padi_tadah_hujan.py"))
    ap.add_argument("--out", default=os.path.join(ROOT, "data", "konten.json"))
    a = ap.parse_args()

    C = load_content(os.path.abspath(a.content))
    data = build(C)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # ringkasan verifikasi
    n = len(data["entries"])
    per = {}
    for e in data["entries"]:
        per[e["kategori"]] = per.get(e["kategori"], 0) + 1
    berfoto = sum(1 for e in data["entries"] if e["foto"]["ada_foto"])
    print(f"OK: {n} entri -> {a.out}")
    print(f"  per kategori : {per}")
    print(f"  QID          : {len(data['tabel_identifikasi_cepat'])} baris")
    print(f"  referensi    : {len(data['referensi'])}")
    print(f"  tips         : {len(data['tips'])}")
    print(f"  entri berfoto: {berfoto}/{n} (sisanya pakai saran_foto)")
    pr = data.get("produk", {})
    print(f"  produk        : {len(pr.get('katalog', []))} katalog, "
          f"{len(pr.get('rekomendasi', {}))} entri ber-rekomendasi")


if __name__ == "__main__":
    main()
