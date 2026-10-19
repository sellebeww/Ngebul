# Model ancaman singkat — KasMusim

**Sistem:** aplikasi Next.js 15 (App Router) yang sepenuhnya berjalan di klien. Tidak ada API, basis data server, autentikasi, atau integrasi pihak ketiga. Data disimpan di `localStorage` (`kasmusim-v1`).

## Aset paling berharga
1. Data keuangan rumah tangga: dana, pendapatan, kewajiban, denda, catatan check-in (di `localStorage`).
2. Berkas ekspor `kasmusim-data.json` (berisi seluruh data rumah tangga yang terlihat).
3. Integritas proyeksi: angka yang salah dapat mendorong keputusan keuangan keliru.

## Titik masuk
- Isian formulir (onboarding, kewajiban, rencana, check-in, simulasi).
- Isi `localStorage` (bisa diubah siapa pun yang memegang profil peramban).
- Rantai build: dependensi npm, `next build`, dan postcss.
- Server dev/produksi lokal (`127.0.0.1:3000`).

## Batas kepercayaan
Profil peramban/perangkat adalah satu-satunya batas. Pemilih peran (Anggota/Pendamping/Admin) **bukan** kontrol akses; README sudah menyatakannya.

## Ancaman teratas
| # | Ancaman | Mitigasi | Status |
|---|---|---|---|
| T1 | XSS membaca `localStorage` | React meng-escape output; tidak ada `innerHTML`/`eval`; CSP | Dimitigasi |
| T2 | Dependensi/skrip menyelundupkan data ke luar | CSP `connect-src 'self'`; smoke test memastikan tidak ada request eksternal | Dimitigasi |
| T3 | Clickjacking lewat iframe | `frame-ancestors 'none'` + `X-Frame-Options: DENY` | Dimitigasi |
| T4 | Kerentanan rantai build (postcss ≤8.5.22) | Override ke 8.5.30 | Diperbaiki |
| T5 | Orang lain di perangkat yang sama membaca data | Di luar kemampuan aplikasi lokal; didokumentasikan | Diterima (desain MVP) |
| T6 | Berkas ekspor bocor | Peringatan di UI; tanggung jawab pemegang berkas | Diterima |
| T7 | `localStorage` rusak atau berbentuk aneh menyebabkan crash | Hanya diperiksa `Array.isArray` | Saran lanjutan |
| T8 | Server dev terekspos di LAN | Skrip sudah bind ke `127.0.0.1` | Dimitigasi |
| T9 | Proyeksi dibaca sebagai jaminan | Teks UI dan README berulang kali menyebut asumsi | Risiko produk, di luar lingkup kode |

## Lingkungan uji yang tersedia
Node 25.2.1 / npm 11.6.2, Vitest, Playwright + Google Chrome lokal (headless). Tidak memakai Docker, DB, atau emulator karena tidak dibutuhkan.
