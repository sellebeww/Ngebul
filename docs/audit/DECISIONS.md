# Keputusan selama audit

| # | Keputusan | Alasan | Alternatif yang ditolak |
|---|---|---|---|
| D1 | Membuat repo Git lokal (`main` = baseline, kerja di `chore/audit-20261019`), tanpa remote | Proyek belum memakai Git; protokol meminta checkpoint yang dapat dibatalkan | Arsip zip di luar folder (lebih sulit ditinjau per tahap) |
| D2 | Menutup kerentanan postcss dengan `overrides.next.postcss = ^8.5.30` | `next@15.5.28` sudah versi 15.x terbaru tetapi masih mem-pin postcss 8.4.31; `npm audit fix` hanya menawarkan Next 16 (mayor) | Upgrade ke Next 16 (breaking, perlu keputusan pengguna) |
| D3 | CSP memakai `'unsafe-inline'` untuk script | App Router menyisipkan skrip inline; CSP berbasis nonce memaksa render dinamis per request | CSP nonce + middleware (lebih kompleks, hilangnya prerender statis) |
| D4 | Tidak menambah HSTS | Target deploy tidak diketahui dan aplikasi berjalan di HTTP lokal | Menambahkan sekarang (tidak berpengaruh di HTTP, berisiko bila domain dipakai bersama) |
| D5 | Tidak menambah ESLint/Prettier | Proyek 13 file dengan TS `strict`; `tsc --noUnusedLocals` dipakai sekali sebagai pengganti lint. Format ulang akan mengubah hampir setiap baris | Memasang ESLint + Prettier (lihat Saran lanjutan) |
| D6 | Kontras: hanya lightness warna teks yang digelapkan (hue tetap) sampai ≥4.6:1; ikon dekoratif dan angka tanggal di luar bulan dikecualikan | Memenuhi WCAG AA tanpa desain ulang | Mengganti palet atau ukuran huruf (keputusan desain) |
| D7 | Ukuran huruf 8–10 px tidak diubah | Mengubah ukuran huruf adalah keputusan desain dan dapat menggeser tata letak | Menaikkan minimum ke 12 px |
| D8 | Tidak membuat `robots.txt`/`sitemap`/OG | Aplikasi lokal yang menurut README tidak dipublikasikan | Membuat metadata SEO penuh |
| D9 | Ikon situs memakai `src/app/icon.svg` (konvensi Next) | Menghilangkan 404 `favicon.ico` tanpa folder `public/` | PNG/ICO multi-ukuran |
| D10 | Modal: Escape menutup dan fokus awal di tombol Tutup; tanpa focus trap | Perbaikan minimal yang aman; focus trap penuh perlu komponen tambahan | Library dialog / `<dialog>` native (refactor lebih besar) |
| D11 | `webpack.cache = false` di `next.config.ts` dipertahankan | Kemungkinan disengaja (ruang disk/stabilitas); tidak ada bukti masalah | Menghapusnya |
| D12 | Tidak ada file, aset, atau dependensi yang dihapus | `depcheck`-manual: keempat dependensi runtime dan semua devDependency dipakai (lucide-react, next, react, react-dom; tailwind/postcss di CSS, playwright di smoke, tsx di backtest, vitest di tes). Tidak ada aset gambar di sumber | — |
