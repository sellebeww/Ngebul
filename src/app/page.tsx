import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Chart from '@/components/Chart';
import { CONFIG } from '@/domain/config';
import { PRODUCT_NOTE, project, simulate } from '@/domain/engine';
import { DEMO_DATE, makeSeeds } from '@/domain/seed';
// Static page: the example is computed by the real engine at build time from fictional seed data, not hand-written numbers.
const seeds=makeSeeds(),nia=seeds[5];
const base=project(nia,DEMO_DATE),usual=project(nia,DEMO_DATE,'usual'),optimistic=project(nia,DEMO_DATE,'optimistic'),band=simulate(nia,DEMO_DATE).band;
const firstGap=base.payments.find(p=>!p.covered);
const weeks=CONFIG.horizonDays/7;
const longDate=(v:string)=>new Date(v+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long'});
const days=(n:number)=>n>=CONFIG.horizonDays?`${n}+`:String(n);
const steps=[
 ['Catat uang hari ini','Hanya dana yang langsung bisa dipakai: tunai, rekening, amplop. Tabungan terkunci tidak ikut dihitung.','± 3 menit'],
 ['Isi pendapatan sebagai rentang','Paling sedikit, biasanya, paling banyak, lengkap dengan jendela tanggal masuk dan kebiasaan telat.','Harian, mingguan, musiman'],
 ['Pasang kewajiban di kalender','Kontrakan, makan, sekolah, iuran. Tanggal, denda, tenggang, dan apakah bisa dibicarakan.','Kebutuhan pokok didahulukan'],
 ['Check-in seminggu sekali','Catat yang benar-benar terjadi. Setelah empat catatan, Ngebul mengusulkan rentang baru. Anda yang memutuskan.','± 2 menit'],
];
const refusals=[
 ['Tidak menyambung ke rekening atau e-wallet.','Anda mengetik angka sendiri. Tidak ada kata sandi bank yang diminta.'],
 ['Tidak menawarkan pinjaman, investasi, atau pembayaran.','Tidak ada produk keuangan yang dijual di balik layar.'],
 ['Tidak mengirim data ke server.','Rencana tersimpan di peramban perangkat ini, tanpa pelacak pihak ketiga. Ekspor dan hapus kapan saja.'],
 ['Tidak berpura-pura semua bisa “diatur”.','Bila pendapatan biasa tidak menutup kebutuhan pokok, Ngebul mengatakannya terus terang.'],
];
const faq=[
 ['Kenapa namanya Ngebul?','Dari ungkapan “dapur tetap ngebul”: asap dapur masih mengepul, artinya keluarga masih bisa makan. Itu juga ukuran yang dipakai aplikasi ini: kebutuhan pokok selalu dihitung lebih dulu.'],
 ['Perlu membuat akun?','Tidak. Buka aplikasinya dan mulai. Karena data hanya ada di peramban ini, berganti perangkat atau menghapus data situs akan menghilangkannya. Gunakan Ekspor di Data & pengaturan untuk menyimpan salinan.'],
 ['Apakah ini nasihat keuangan?',PRODUCT_NOTE+' Saran di dalamnya selalu berangkat dari jalur konservatif, bukan dari harapan.'],
 ['Kenapa pendapatan diisi sebagai rentang?','Karena itulah kenyataannya. Rata-rata menyembunyikan minggu sepi dan pembayaran yang mundur; rentang dan jendela tanggal menunjukkan kapan uang paling lambat datang.'],
 ['Apa arti “kekurangan struktural”?',`Ngebul membandingkan pendapatan biasa dengan kebutuhan pokok selama ${weeks} minggu. Bila lebih kecil, menunda atau berhemat hanya menggeser tanggal gagal. Aplikasi akan menyebutnya, dan mengingatkan bahwa bantuan di luar perencanaan mungkin diperlukan.`],
 ['Bisa dipakai petani?',`Bisa, dengan catatan: horizon ${weeks} minggu belum tentu mencakup satu siklus panen. Label yang muncul berlaku untuk horizon itu, bukan diagnosis satu musim penuh.`],
 ['Angka di halaman ini nyata?',`Tidak. ${nia.name} adalah satu dari enam rumah tangga fiktif di Ruang Uji. Angkanya dihitung oleh mesin yang sama dengan aplikasi, dari asumsi contoh.`],
];
export default function Profile(){
 return <div className="lp">
 <a className="skip-link" href="#isi">Langsung ke konten</a>
 <header className="lp-head"><div className="lp-wrap lp-head-row">
  <Link href="/" className="lp-brand" aria-label="Ngebul, beranda"><img src="/brand/ngebul-mark.png" alt="" width={48} height={43}/><img src="/brand/ngebul-wordmark.png" alt="" width={112} height={32}/></Link>
  <nav aria-label="Bagian halaman" className="lp-nav"><a href="#cara-kerja">Cara kerja</a><a href="#prinsip">Prinsip</a><a href="#untuk-siapa">Untuk siapa</a><a href="#tanya-jawab">Tanya jawab</a></nav>
  <Link href="/app" className="button primary">Buka aplikasi <ArrowRight size={16}/></Link>
 </div></header>
 <main id="isi" tabIndex={-1}>
 <section className="lp-wrap lp-hero">
  <div className="lp-hero-copy">
   <span className="lp-kicker">Biar dapur tetap ngebul</span>
   <h1>Uang yang ada hari ini, <em>cukup sampai kapan?</em></h1>
   <p className="lp-lead">Ngebul menunjukkan tanggal pertama kebutuhan pokok belum tertutup, sebelum hari itu tiba. Dibuat untuk rumah tangga yang penghasilannya datang harian, musiman, atau per pesanan.</p>
   <div className="button-row"><Link href="/app" className="button primary lp-cta">Coba dengan data contoh <ArrowRight size={17}/></Link><a href="#cara-kerja" className="button">Lihat cara kerjanya</a></div>
   <ul className="lp-facts"><li>Tanpa akun</li><li>Tanpa koneksi bank</li><li>Data tetap di perangkat</li></ul>
  </div>
  <figure className="lp-specimen card">
   <figcaption className="lp-specimen-head"><span className="demo-tag">CONTOH FIKTIF</span>{nia.name} · {nia.occupation.toLowerCase()}</figcaption>
   <div className="lp-compare">
    <div><span>Bila dihitung biasa</span><strong className="lp-num is-muted">{days(usual.runway)}<small> hari</small></strong></div>
    <div><span>Jalur konservatif</span><strong className="lp-num">{days(base.runway)}<small> hari</small></strong></div>
   </div>
   {firstGap&&<p className="lp-verdict"><b>{firstGap.name}</b> {longDate(firstGap.due)} belum tertutup bila uang datang paling sedikit dan paling lambat.</p>}
   <Chart base={base} usual={usual} band={band}/>
   <p className="lp-fine">Garis tegas: konservatif. Putus-putus: biasa. Pita: persentil 10–90 dari {CONFIG.simulations} simulasi. Bukan jaminan.</p>
  </figure>
 </section>

 <section className="lp-wrap lp-section" aria-labelledby="masalah">
  <p className="lp-section-no">01 · Masalahnya</p>
  <div className="lp-split">
   <h2 id="masalah" className="lp-display">Gaji bulanan punya tanggal. Penghasilan kami punya <em>musim.</em></h2>
   <div className="lp-prose">
    <p>Aplikasi anggaran pada umumnya mengandaikan uang masuk tiap tanggal 25. Bagi ojek daring, pedagang pasar, atau petani, uang datang dalam rentang: kadang lebih, sering telat, sesekali tidak sama sekali.</p>
    <p>Sementara itu kontrakan, uang sekolah, dan belanja makan datang tepat pada tanggalnya. Saldo akhir bulan bisa terlihat aman, padahal di tengah bulan ada hari ketika uangnya belum ada.</p>
   </div>
  </div>
  <ul className="lp-occupations" aria-label="Contoh pekerjaan di Ruang Uji">{seeds.map(h=><li key={h.id}>{h.occupation}</li>)}</ul>
 </section>

 <section id="cara-kerja" className="lp-wrap lp-section" aria-labelledby="cara">
  <p className="lp-section-no">02 · Cara kerja</p>
  <h2 id="cara" className="lp-display">Empat langkah, kurang dari sepuluh menit.</h2>
  <ol className="lp-steps">{steps.map(([t,d,n],i)=><li key={t}><span className="lp-step-no">{String(i+1).padStart(2,'0')}</span><div><h3>{t}</h3><p>{d}</p></div><span className="lp-step-note">{n}</span></li>)}</ol>
 </section>

 <section className="lp-wrap lp-section" aria-labelledby="jalur">
  <p className="lp-section-no">03 · Tiga jalur, satu dasar saran</p>
  <div className="lp-split">
   <h2 id="jalur" className="lp-display">Saran selalu berangkat dari jalur yang paling <em>hati-hati.</em></h2>
   <p className="lp-prose">Ngebul menghitung tiga kemungkinan dari rentang yang Anda isi. Jalur biasa dan optimis ditampilkan sebagai pembanding, agar Anda tahu seberapa jauh harapan dan kenyataan bisa berbeda.</p>
  </div>
  <div className="lp-path-grid">
   <article className="is-base"><span>Konservatif · dasar saran</span><strong className="lp-num">{days(base.runway)}<small> hari</small></strong><p>Pendapatan paling sedikit, datang di ujung paling lambat, ditambah kebiasaan telat.</p></article>
   <article><span>Biasa</span><strong className="lp-num">{days(usual.runway)}<small> hari</small></strong><p>Nilai “biasanya” yang Anda isi, di tengah jendela kedatangan.</p></article>
   <article><span>Optimis</span><strong className="lp-num">{days(optimistic.runway)}<small> hari</small></strong><p>Batas atas, datang paling awal. Hanya pembanding, tidak pernah dasar saran.</p></article>
  </div>
  <p className="lp-fine">Daya tahan {nia.name} pada contoh fiktif per {longDate(DEMO_DATE)} 2026. “{CONFIG.horizonDays}+” berarti setidaknya sepanjang horizon {weeks} minggu.</p>
 </section>

 <section id="prinsip" className="lp-band" aria-labelledby="prinsip-h">
  <div className="lp-wrap">
   <p className="lp-section-no">04 · Prinsip</p>
   <h2 id="prinsip-h" className="lp-display">Yang sengaja <em>tidak</em> kami lakukan.</h2>
   <ul className="lp-refusals">{refusals.map(([t,d])=><li key={t}><strong>{t}</strong><p>{d}</p></li>)}</ul>
   <blockquote className="lp-quote">Perencanaan tidak dapat menyelesaikan kekurangan uang yang struktural. Yang bisa dilakukan adalah memperlihatkannya lebih awal, apa adanya.</blockquote>
  </div>
 </section>

 <section id="untuk-siapa" className="lp-wrap lp-section" aria-labelledby="siapa">
  <p className="lp-section-no">05 · Untuk siapa</p>
  <h2 id="siapa" className="lp-display">Untuk yang mencatat, dan yang mendampingi.</h2>
  <div className="lp-audience">
   <article><h3>Rumah tangga</h3><p>Pencatat utama memegang data. Lihat daya tahan dana, kalender kewajiban, dan coba simulasi sebelum memutuskan: berhemat, menunda yang boleh ditunda, atau membicarakan jadwal.</p><ul><li>Kalender bulan & minggu: tertutup, rawan, belum tertutup</li><li>Simulasi “bagaimana jika” tanpa mengubah rencana utama</li><li>Ekspor JSON dan hapus semua data</li></ul></article>
   <article><h3>Pendamping & peneliti</h3><p>Pendamping hanya melihat rincian bila rumah tangga sudah mengizinkan. Ruang Uji berisi delapan skenario dan evaluasi delapan minggu untuk menguji apakah peringatan memang datang lebih awal.</p><ul><li>Mode tampilan pendamping dengan izin eksplisit</li><li>Pembanding: model bulanan, rata-rata bertanggal, Ngebul</li><li>Kelompok kekurangan struktural dilaporkan terpisah</li></ul></article>
  </div>
 </section>

 <section id="tanya-jawab" className="lp-wrap lp-section lp-faq" aria-labelledby="faq-h">
  <p className="lp-section-no">06 · Tanya jawab</p>
  <h2 id="faq-h" className="lp-display">Sebelum mulai.</h2>
  <div>{faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
 </section>

 <section className="lp-wrap lp-close">
  <img className="lp-close-mark" src="/brand/ngebul-mark.png" alt="" width={120} height={108}/>
  <h2 className="lp-display">Rencana hari ini, <em>tenang esok nanti.</em></h2>
  <p>Coba dulu dengan enam keluarga fiktif, lalu buat rencana Anda sendiri bila terasa berguna.</p>
  <Link href="/app" className="button primary lp-cta">Buka ruang keluarga <ArrowUpRight size={17}/></Link>
 </section>
 </main>
 <footer className="lp-wrap lp-foot"><img src="/brand/ngebul-wordmark.png" alt="Ngebul" width={84} height={24}/><span>{PRODUCT_NOTE}</span><span>MVP 0.1</span></footer>
 </div>;
}
