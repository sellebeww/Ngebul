# Cara membatalkan

Repo Git dibuat oleh audit ini. `main` (commit `ac35e98`) adalah salinan persis kondisi sebelum audit.

| Commit | Tahap |
|---|---|
| `ac35e98` | baseline (sebelum audit) |
| `0209847` | keamanan: header + CSP, override postcss |
| `33d0d3d` | pembersihan: import tak terpakai, ikon, `.gitignore` |
| `6119569` | aksesibilitas: kontras, fokus, skip link, ARIA, modal |
| `59c65d3` | dokumen audit + README |
| `e667236` | perbaikan hasil red-team: kontras pada latar kartu, guard IME (pesan commit `6119569` menyebut "60 aturan"; angka yang benar 59 + 5) |

```sh
# Batalkan semuanya (kembali ke kondisi awal):
git checkout main && npm ci

# Batalkan satu tahap saja, misalnya aksesibilitas:
git checkout chore/audit-20261019 && git revert 6119569

# Kembali ke folder tanpa Git seperti semula (setelah checkout main):
rm -rf .git
```
`npm ci` diperlukan setelah membatalkan commit keamanan karena `package-lock.json` berubah (postcss bersarang di `next`).
