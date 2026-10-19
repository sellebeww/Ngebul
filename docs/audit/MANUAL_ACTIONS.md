# Tindakan manual

Hanya hal yang tidak bisa diputuskan atau dikerjakan oleh agent. Tidak ada secret yang perlu dirotasi (pemindaian tidak menemukan kredensial).

| Prioritas | Memblokir rilis? | Item |
|---|---|---|
| 1 | Ya | Tinjau lalu gabungkan branch audit |
| 2 | Tidak | Putuskan format ulang kode (Prettier) |
| 3 | Tidak | Putuskan ukuran huruf minimum |
| 4 | Hanya bila dipublikasikan | HTTPS + HSTS sebelum deploy di luar localhost |

## 1. Tinjau dan gabungkan branch audit (±15 menit)
**Kenapa:** semua perubahan ada di branch lokal `chore/audit-20261019`. Agent tidak melakukan merge ke `main`.
Dari folder proyek:
```sh
git log --oneline main..chore/audit-20261019
git diff main..chore/audit-20261019 -- . ':!package-lock.json'
npm ci && npm test && npm run build
git checkout main && git merge --ff-only chore/audit-20261019
```
**Laporkan balik:** apakah merge dilakukan atau ada perubahan yang ingin dibatalkan.

## 2. Format ulang kode dengan Prettier? (keputusan, ±5 menit)
**Kenapa:** kode ditulis sangat padat (misalnya `App.tsx` ±46 KB dalam ~100 baris), sulit ditinjau dan di-diff. Memformat ulang menyentuh hampir setiap baris, jadi saya tidak melakukannya tanpa izin.
**Laporkan balik:** "ya, format" atau "tidak". Bila ya, agent dapat memasang Prettier + ESLint dalam commit terpisah.

## 3. Ukuran huruf minimum (keputusan desain, ±5 menit)
**Kenapa:** banyak teks pendukung berukuran 8–10 px (`.brand-sub`, `.probability`, `.demo-tag`, `footer`). Kontrasnya sudah sesuai AA, tetapi masih sulit dibaca di ponsel. Menaikkan ukuran akan mengubah tata letak.
**Laporkan balik:** ukuran minimum yang diinginkan (saran: 12 px).

## 4. Sebelum dipublikasikan di luar localhost
**Kenapa:** `crypto.randomUUID()` hanya berjalan di konteks aman (HTTPS atau localhost), dan HSTS sengaja tidak dipasang (D4).
**Langkah:** sajikan lewat HTTPS, lalu tambahkan `{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }` ke `securityHeaders` di `next.config.ts`. Jangan memakai `output: 'export'` tanpa memindahkan header ke konfigurasi server/hosting.
