import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
const errors=[],external=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3000')&&!r.url().startsWith('blob:'))external.push(r.url());});
const nav=async(name)=>{await page.locator('.nav-list').getByRole('button',{name,exact:true}).click();};
try {
 const response=await page.goto('http://127.0.0.1:3000');assert.equal(response.status(),200);
 await page.getByRole('heading',{name:'Rencanakan hari, tenangkan langkah.'}).waitFor();
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
 for(const id of ['S1','S2','S3','S4','S5','S6','S7','S8']){
  await page.getByLabel('Jalankan skenario uji').selectOption(id);
  if(['S3','S5','S6'].includes(id))await page.getByText('Pendapatan biasa tidak menutup kebutuhan pokok',{exact:true}).waitFor();
  if(id==='S4') {await page.getByRole('heading',{name:'Dampak terhadap rencana'}).waitFor();assert.match(await page.locator('tbody').innerText(),/84 hari/);}
  if(id==='S8')await page.getByText('Data usang · keyakinan rendah.').waitFor();
 }
 await page.getByLabel('Jalankan skenario uji').selectOption('S5');
 await nav('Simulasi');await page.locator('input[type=range]').fill('100');
 await page.getByText('Pendapatan biasa tidak menutup kebutuhan pokok',{exact:true}).waitFor();
 assert.match(await page.locator('main').innerText(),/Kekurangan struktural tetap ada/);
 await nav('Kalender kewajiban');await page.getByLabel('Tampilan kalender').selectOption('minggu');
 await page.getByRole('button',{name:'Tambah',exact:true}).click();
 await page.getByLabel('Nama kewajiban').fill('Uji tagihan');
 await page.locator('input[name=amount]').fill('100000');
 await page.getByRole('button',{name:'Simpan kewajiban'}).click();
 await page.reload();await page.getByRole('heading',{name:'Rencanakan hari, tenangkan langkah.'}).waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kasmusim-v1')));
 assert(saved.find(h=>h.id==='rt-4').obligations.some(o=>o.name==='Uji tagihan'));
 await nav('Evaluasi uji');await page.getByRole('heading',{name:'Apakah peringatan datang lebih awal?'}).waitFor();
 await page.locator('.sidebar-bottom').getByRole('button',{name:'Data & pengaturan'}).click();
 await page.getByLabel('Peran tampilan lokal').selectOption('Pendamping');
 await page.getByRole('heading',{name:'Belum ada izin rumah tangga'}).waitFor();
 await page.getByRole('button',{name:'Kembali sebagai anggota'}).click();
 // New household, persisted onboarding, check-in, and deletion.
 await page.getByRole('button',{name:'Rumah tangga baru'}).click();
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByRole('button',{name:'Rumah tangga baru'}).click();
 await page.getByLabel('Nama panggilan rumah tangga').fill('Keluarga Uji');
 await page.getByLabel('Total dana yang langsung bisa dipakai (Rp)').fill('2000000');
 await page.getByRole('button',{name:'Lanjut',exact:true}).click();
 await page.getByRole('dialog').getByLabel('Paling sedikit (Rp)',{exact:true}).fill('700000');
 await page.getByRole('dialog').getByLabel('Biasanya (Rp)',{exact:true}).fill('900000');
 await page.getByRole('dialog').getByLabel('Paling banyak (Rp)',{exact:true}).fill('1200000');
 await page.getByRole('button',{name:'Lanjut',exact:true}).click();
 await page.getByLabel(/Saya memahami penyimpanan lokal/).check();
 await page.getByRole('button',{name:'Simpan & lihat rencana'}).click();
 await nav('Check-in mingguan');
 await page.locator('form input[type=number]').first().fill('800000');
 await page.getByRole('button',{name:'Simpan check-in',exact:true}).click();
 assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('kasmusim-v1')))).find(h=>h.name==='Keluarga Uji').actuals.length===1);
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Buka menu'}).click();await nav('Ringkasan');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Mobile page must not overflow horizontally');
 await page.locator('.toast').waitFor({state:'hidden',timeout:10000});
 await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Buka menu'}).click();
 await page.locator('.sidebar-bottom').getByRole('button',{name:'Data & pengaturan'}).click();
 assert.equal(await page.getByRole('button',{name:'Buka menu'}).getAttribute('aria-expanded'),'false','Settings closes the mobile menu');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Ekspor semua data'}).click();assert.equal((await downloadPromise).suggestedFilename(),'kasmusim-data.json');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Hapus semua data',exact:true}).click();
 await page.getByRole('heading',{name:'Mulai dari uang yang ada hari ini.'}).waitFor();
 await page.reload();await page.getByRole('heading',{name:'Mulai dari uang yang ada hari ini.'}).waitFor();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS: S1–S8, structural guardrail, calendar, persistence, consent, onboarding, check-in, evaluation, mobile, export/delete, no external requests.');
} finally {await browser.close();}
