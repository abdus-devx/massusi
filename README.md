# Massusi Knowledge Hub + Decap CMS

Vanilla HTML/CSS/JavaScript knowledge hub with Decap CMS + Decap Turbo + GitHub.

## Cara kerja

1. Artikel ditulis di `massusi.net/admin/` menggunakan Decap CMS.
2. Decap Turbo membuat commit ke repository GitHub.
3. Hosting (mis. Vercel/Netlify) mendeteksi commit dan menjalankan `npm run build`.
4. `scripts/build-content.mjs` membaca `content/articles/*.md`.
5. Script menghasilkan `js/articles.generated.js` dan sitemap.
6. Website menampilkan artikel baru di `/artikel/<slug>`.

Konten tetap berada di GitHub; Turbo hanya menyediakan authentication/request proxy untuk Decap. Decap Turbo tidak menjadi database artikel terpisah.

## Setup Decap Turbo

1. Buat akun di Decap Turbo.
2. Buat Organization. Free plan saat ini menyediakan 1 site dan 1 seat.
3. Hubungkan GitHub account/organization yang memiliki repository Massusi.
4. Buat Site dengan repository Massusi, branch `main`, dan config path `admin/config.yml`.
5. Pada Admin interface URL isi:
   `https://massusi.net/admin/`
6. Salin **Site ID** dari halaman Overview Turbo.
7. Buka `admin/config.yml` dan ganti:
   `YOUR_TURBO_SITE_ID`
   dengan Site ID tersebut.
8. Commit dan push project ini ke repository Massusi.

`admin/config.yml` menggunakan backend `turbo-github` dan Decap CMS beta channel karena backend Turbo masih berada pada beta release channel menurut dokumentasi resmi Decap.

## Deployment

### Vercel

- Connect repository ke Vercel.
- Build command: `npm run build` (sudah diset di `vercel.json`).
- Output directory: `.`.
- Setelah publish, buka `https://massusi.net/admin/`.

### Netlify

- Connect repository ke Netlify.
- Build command: `npm run build` (sudah diset di `netlify.toml`).
- Publish directory: `.`.

## Struktur konten

```text
content/
└── articles/
    └── judul-artikel.md
```

Gambar yang diupload Decap:

```text
assets/uploads/
```

Field artikel yang tersedia:

- Judul
- Slug
- Kategori
- Ringkasan
- Penulis
- Tanggal terbit
- Tanggal diperbarui
- Estimasi baca
- Gambar utama
- Tags
- Featured
- Isi artikel (Markdown)

## Catatan

`js/articles.generated.js` adalah file hasil build. Jangan mengedit file ini secara manual. Sumber artikelnya adalah file Markdown di `content/articles/`.
