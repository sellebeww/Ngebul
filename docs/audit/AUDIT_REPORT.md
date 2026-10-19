# Laporan Audit — KasMusim (19 Oktober 2026)

Branch: `chore/audit-20261019` · Baseline: `main` (`ac35e98`) · Dokumen terkait: [THREAT_MODEL](THREAT_MODEL.md), [DECISIONS](DECISIONS.md), [MANUAL_ACTIONS](MANUAL_ACTIONS.md), [ROLLBACK](ROLLBACK.md)

## 1. Ringkasan eksekutif
KasMusim adalah aplikasi Next.js 15 kecil (13 file sumber) yang berjalan sepenuhnya di klien dan menyimpan data di `localStorage`. Kondisi awal sudah sehat: typecheck bersih, 28/28 tes lulus, build dan smoke UI lulus, tanpa secret maupun sink XSS. Audit memperbaiki 2 kerentanan dependensi (`npm audit`: 1 high + 1 moderate → 0), menambahkan CSP dan header keamanan, memperbaiki 64 warna teks yang gagal kontras WCAG AA, serta 6 perbaikan aksesibilitas/UX lain. Tidak ada file yang dihapus. Ukuran bundle praktis tidak berubah (`/` 21 kB → 21.1 kB, First Load 124 kB tetap). Output backtest identik dengan baseline, sehingga logika domain tidak berubah.

## 2. File dan folder yang dihapus
Tidak ada. Satu-satunya artefak yang dibuang adalah entri lock untuk `next/node_modules/postcss@8.4.31` (diganti 8.5.30 lewat override). `artifacts/`, `.next/`, dan `tsconfig.tsbuildinfo` sudah diabaikan Git dan dibiarkan.

## 3. Aset visual
| Aset | Aksi | Ukuran |
|---|---|---|
| `src/app/icon.svg` | **Baru**: ikon situs (ikon Sprout dari lucide, warna brand), menghilangkan 404 `favicon.ico` | 0,6 KB |
| `artifacts/desktop.png`, `artifacts/mobile.png` | Tidak diubah: hasil smoke test, diabaikan Git | — |

Sumber tidak memuat gambar, font kustom, atau folder `public/`. Font memakai font sistem (Arial/Georgia), sehingga tidak ada yang perlu disubset.

## 4. Struktur direktori
Tidak diubah karena sudah logis dan sesuai konvensi App Router:
```
src/app/         layout, page, globals.css, icon.svg
src/components/  App.tsx, Chart.tsx
src/domain/      logika murni + engine.test.ts
scripts/         backtest.ts, smoke.mjs
docs/audit/      dokumen audit ini
```

## 5. Standar penamaan
Sudah konsisten, sehingga tidak ada penggantian nama: komponen `PascalCase.tsx`, modul domain `lowercase.ts`, konstanta `UPPER_SNAKE` (`CONFIG`, `DEMO_DATE`, `SCENARIOS`, `KEY`), fungsi/variabel `camelCase`.

## 6. Kode, dependensi, dan duplikasi
- Dihapus: import tipe `Income` yang tak terpakai di [engine.ts](../../src/domain/engine.ts), import `addDays` di [evaluation.ts](../../src/domain/evaluation.ts), dan parameter `v` di [Chart.tsx](../../src/components/Chart.tsx). Bukti: `tsc --noUnusedLocals --noUnusedParameters` menemukan 3 error sebelum, 0 sesudah.
- Ekspor domain: semuanya punya pemakai (diperiksa dengan grep per nama ekspor).
- Dependensi: keempat dependensi runtime dan kesembilan devDependency dipakai (D12). Tidak ada yang dihapus atau dipindah.
- `.gitignore`: ditambah `.DS_Store`, `*.log`, dan `!.env.example`.
- Format kode padat tidak diubah (D5; keputusan di MANUAL_ACTIONS #2).

## 7. Temuan keamanan
| ID | Keparahan | Lokasi | Deskripsi | Status |
|---|---|---|---|---|
| S-01 | Tinggi (menurut npm) / risiko nyata rendah | `next@15.5.28` → `postcss@8.4.31` | GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp (baca file via `sourceMappingURL`), GHSA-qx2v-qp2m-jg93 (XSS stringify). Hanya saat build dengan CSS dari penyerang | **Diperbaiki** `[TERVERIFIKASI]`: override ke 8.5.30, `npm audit` 0 |
| S-02 | Sedang | [next.config.ts](../../next.config.ts) | Tidak ada CSP atau header keamanan | **Diperbaiki** `[TERVERIFIKASI]`: CSP (`connect-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy. Header terlihat di `curl -I`; 0 pelanggaran CSP di konsol pada mode prod dan dev |
| S-03 | Rendah | `src/components/App.tsx` (`KEY`) | `localStorage` tidak terenkripsi; pemilih peran bukan autentikasi | Diterima sesuai desain MVP; sudah didokumentasikan di README |
| S-04 | Rendah | [App.tsx:19](../../src/components/App.tsx#L19) | Data `localStorage` hanya diperiksa `Array.isArray`; objek yang bentuknya rusak dapat membuat UI crash | Saran lanjutan (validasi skema) |
| S-05 | Info | `crypto.randomUUID()` | Gagal di HTTP non-localhost | Didokumentasikan di MANUAL_ACTIONS #4 |
| S-06 | Info | CSP | Masih memakai `'unsafe-inline'` untuk script (batasan App Router tanpa nonce) | Diterima (D3) |
| S-07 | Info | — | Tidak memakai HSTS | Ditunda sampai target deploy jelas (D4) |

Pemindaian yang dilakukan:
- Secret: regex API key/token/password/private key/URL berkredensial di semua file kecuali `node_modules`/lock. Hasil: 0. Riwayat Git hanya berisi baseline.
- Sink berbahaya: `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`. Hasil: 0.
- Prompt injection di konten repo: tidak ditemukan.

`[ASUMSI]`: tidak memakai gitleaks/semgrep karena tidak terpasang. Grep regex tidak sekomprehensif keduanya.

## 8. UI/UX dan aksesibilitas
| Perbaikan | Bukti |
|---|---|
| Kontras teks: 59 warna dinaikkan ke ≥4.6:1 (hanya lightness, hue tetap), termasuk badge status *Tertutup/Rawan/Belum tertutup* yang sebelumnya 2.6–3.0:1. Red-team menemukan bahwa pengukuran pertama memakai latar halaman, bukan latar kartu. 5 warna lagi diperbaiki terhadap latar sebenarnya: `.runway-number span` 4.20, `.runway-bottom` 4.24, `.card-label` di atas `.subtle-tag` 3.90, `.demo-strip select` (mobile) 4.32, `.demo-tag` 4.35, semuanya → ≥4.6 | Skrip kontras per pasangan teks/latar. Sisa kegagalan: 7 ikon dekoratif + angka tanggal di luar bulan (D6). `[ASUMSI]`: latar ditentukan dari aturan CSS, bukan diukur piksel per piksel di peramban |
| Outline fokus `#a4b894` (2.1:1) → `var(--green)` (≥3:1) | CSS |
| Skip link "Langsung ke konten" → `main#main` | Playwright: Tab pertama fokus ke skip link, Enter memindahkan fokus ke `main` |
| Logo `<a href="#">` → `<button>` | Tidak ada lagi `href="#"` |
| `aria-current="page"` pada navigasi, `aria-expanded` pada tombol menu | JSX |
| **Bug:** "Data & pengaturan" tidak menutup menu mobile (smoke test sebelumnya punya workaround) | Diperbaiki; smoke kini memeriksa `aria-expanded=false` |
| Modal: Escape menutup (diabaikan saat komposisi IME), fokus awal masuk ke modal. Catatan: isian yang belum disimpan hilang, sama seperti tombol Tutup | Smoke: Escape menutup dialog |

Pemeriksaan responsif pada 360/768/1280/1920 px di kelima tab: tidak ada scroll horizontal `[TERVERIFIKASI]`. Screenshot sebelum dan sesudah pada 1440 px: tata letak identik. Tidak ada animasi/transition, jadi `prefers-reduced-motion` tidak relevan. Tidak ada tema gelap; `body` punya latar eksplisit.

Sisa yang belum dikerjakan: focus trap dan pengembalian fokus pada modal (D10), ukuran huruf 8–10 px (MANUAL_ACTIONS #3).

## 9. Hasil verifikasi
| Pemeriksaan | Baseline | Sesudah (clone bersih, `npm ci`) |
|---|---|---|
| `npm run typecheck` | 0 error | 0 error `[TERVERIFIKASI]` |
| `tsc --noUnusedLocals --noUnusedParameters` | 3 error | 0 `[TERVERIFIKASI]` |
| `npm test` | 28/28 | 28/28 `[TERVERIFIKASI]` |
| `npm run build` | lulus, `/` 21 kB / 124 kB | lulus, `/` 21.1 kB / 124 kB `[TERVERIFIKASI]` |
| `npm audit` | 1 high, 1 moderate | 0 `[TERVERIFIKASI]` |
| `npm run backtest` | — | output identik dengan baseline `[TERVERIFIKASI]` |
| `npm run test:ui` (Chrome headless) | PASS | PASS + 2 asersi baru `[TERVERIFIKASI]` |
| Konsol peramban (5 tab, prod) | 1 error (404 favicon) | 0 error/warning `[TERVERIFIKASI]` |
| Konsol peramban (`npm run dev`) | — | 0 error/warning di Chrome `[TERVERIFIKASI]`. Safari versi lama mungkin memblokir websocket HMR karena `connect-src 'self'` `[TIDAK DIUJI]` |
| Lint (ESLint) | tidak dikonfigurasi | tidak dijalankan (D5) `[TIDAK DIUJI]` |

## 10. Masalah tersisa dan saran lanjutan (urut prioritas)
1. Validasi skema data `localStorage` saat dimuat (S-04).
2. Prettier + ESLint (`react-hooks`) dalam commit terpisah (MANUAL_ACTIONS #2).
3. Focus trap dan pengembalian fokus pada modal, atau ganti dengan `<dialog>` native.
4. Ukuran huruf minimum 12 px (MANUAL_ACTIONS #3).
5. Upgrade ke Next 16 secara terencana (Next 15 akan berhenti mendapat patch); setelah itu hapus override postcss.
6. Impor cadangan JSON (README menyebutnya belum ada).
7. Tombol menu mobile: ganti label sesuai keadaan (Buka/Tutup) dan tambahkan `aria-controls`.

**Red-team pass** (sub-agent terpisah, read-only) mengonfirmasi hash commit, 3 identifier tak terpakai, 28/28 tes, audit 0, backtest identik, header, D12, tidak ada push/rewrite/.env, dan tidak ada secret di diff. Temuannya yang sudah diperbaiki: kontras pada latar kartu, hitungan 60 → 59, guard IME untuk Escape, path absolut di dokumen.

## 11. Cara membatalkan
Lihat [ROLLBACK.md](ROLLBACK.md). Singkatnya, `git checkout main && npm ci` mengembalikan kondisi awal.
