import { addDays } from './dates';
import { project } from './engine';
import type { Household, Obligation } from './types';
export const DEMO_DATE='2026-10-18';
export const SCENARIOS=[
 {id:'S1',title:'Semua kebutuhan tertutup',household:0,description:'Pendapatan cukup dan masuk sebelum kewajiban.'},
 {id:'S2',title:'Pembayaran datang terlambat',household:1,description:'Kontrakan jatuh tempo sebelum uang dagangan masuk.'},
 {id:'S3',title:'Sekolah di minggu sepi',household:2,description:'Uang sekolah besar perlu dibicarakan lebih awal.'},
 {id:'S4',title:'Coba penghematan & penundaan',household:1,description:'Kurangi pengeluaran 50% dan tunda iuran 9 hari.'},
 {id:'S5',title:'Kebutuhan pokok belum tercukupi',household:4,description:'Pendapatan biasa lebih kecil daripada kebutuhan pokok.'},
 {id:'S6',title:'Dari panen ke paceklik',household:3,description:'Dana panen tersedia, pendapatan berikutnya di luar horizon.'},
 {id:'S7',title:'Perkiraan perlu diperbarui',household:5,description:'Realisasi berulang kali di luar rentang awal.'},
 {id:'S8',title:'Dua minggu tanpa kabar',household:0,description:'Data usang; rentang diperlebar dan keyakinan diturunkan.'},
];
export function makeSeeds(start=DEMO_DATE):Household[] {
 const names=['Keluarga Rini','Keluarga Agus','Keluarga Wati','Keluarga Darto','Keluarga Sari','Keluarga Nia'];
 const jobs=['Ojek & kurir daring','Pedagang pasar','Pekerja bangunan harian','Petani musiman','Penjahit lepas','Dua penghasilan tidak tetap'];
 return names.map((name,k)=>{
 const id='rt-'+k;
 const obligation=(key:string,label:string,amount:number,offset:number,category:Obligation['category'],repeatDays?:number):Obligation=>({id:key,name:label,amount,due:addDays(start,offset),repeatDays,category,priority:category==='makan'?1:2,penalty:{kind:'rp',value:category==='sewa'?25000:0},graceDays:category==='sewa'?3:0,negotiable:category!=='makan',deferrable:['sosial_adat','sekolah'].includes(category)});
 const h:Household={id,name,occupation:jobs[k],dependents:k===5?4:3,fictional:true,companionConsent:false,
 funds:[{id:'cash',kind:'tunai',amount:[2200000,800000,650000,7200000,400000,1300000][k],available:'segera'},{id:'locked',kind:'tabungan_terkunci',amount:500000,available:'terkunci'}],
 incomes:[{id:'income-'+k,householdId:id,name:jobs[k],pattern:k===3?'musiman':k===4?'per_proyek':'mingguan',range:{min:[1250000,900000,500000,8000000,200000,500000][k],usual:[1500000,1150000,850000,10000000,350000,800000][k],max:[1800000,1450000,1100000,12000000,600000,1100000][k]},arrivalStart:addDays(start,k===3?100:2),arrivalEnd:addDays(start,k===3?114:k===1?9:5),repeatDays:k===3?120:7,lateDays:k===1?2:0,activeMonths:[],confidence:'sedang'}],
 obligations:[obligation('food','Belanja makan',350000,0,'makan',7),obligation('rent','Kontrakan',700000,k===1?5:10,'sewa',28),obligation('power','Listrik & air',150000,14,'listrik',28),obligation('school','Keperluan sekolah',k===2?1200000:150000,k===2?4:18,'sekolah',28),obligation('social','Iuran keluarga',200000,3,'sosial_adat',28),obligation('installment','Cicilan barang',100000,22,'cicilan',28)],
 variables:[{id:'variable',name:'Jajan & pengeluaran fleksibel',weekly:{min:70000,usual:140000,max:210000},floor:70000}],actuals:[],checkins:[],
 trial:{id:'trial-'+k,householdId:id,week:8,status:'segar',baseline:{lateCount:5+k,lateDays:20+k*3,fines:100000,recallBiased:true},start:addDays(start,-56)}};
 if(k===5) h.incomes.push({...h.incomes[0],id:'income-second',name:'Pesanan makanan',range:{min:250000,usual:450000,max:650000},arrivalStart:addDays(start,1),arrivalEnd:addDays(start,6)});
 for(let w=0;w<14;w++) {
 const date=addDays(start,-98+w*7);
 const snapshot=shiftHousehold(h,start,date);snapshot.checkins=[{id:'prior',householdId:id,time:date,minutes:2}];
 // Independent, explicitly synthetic actual-income and delay assumptions.
 snapshot.incomes=snapshot.incomes.map(i=>({...i,range:{min:Math.round(i.range.usual*(k===5?(w%2?1.7:.3):(.75+(w%4)*.15))),usual:Math.round(i.range.usual*(k===5?(w%2?1.7:.3):(.75+(w%4)*.15))),max:Math.round(i.range.usual*(k===5?(w%2?1.7:.3):(.75+(w%4)*.15)))},arrivalStart:addDays(i.arrivalStart,w%3===0?4:0),arrivalEnd:addDays(i.arrivalStart,w%3===0?4:0),lateDays:0}));
 const actual=project(snapshot,date,'usual',{},7);
 h.actuals.push({id:'actual-'+w,week:w-5,date,incomes:h.incomes.map(i=>({sourceId:i.id,amount:k===3?0:Math.round(i.range.usual*(k===5?(w%2?1.7:.3):(.75+(w%4)*.15))),forecast:k===3?{min:0,usual:0,max:0}:{...i.range}})),payments:actual.payments.map(p=>({obligationId:p.obligationId,due:p.due,paidOn:addDays(p.due,p.covered?0:3+w%3),amount:p.amount,fine:p.covered?0:p.fine})),notes:'Riwayat simulasi; saldo awal mingguan asumsi tetap.',snapshot:{asOf:date,plan:{funds:h.funds,incomes:shiftHousehold(h,start,date).incomes,obligations:shiftHousehold(h,start,date).obligations,variables:h.variables}}});
 h.checkins.push({id:'check-'+w,householdId:id,time:addDays(date,6)+'T10:00:00+07:00',minutes:1.5+w%3});
 }
 return h;
 });
}
export function shiftHousehold(h:Household,from:string,to:string):Household {
 const delta=Math.round((Date.parse(to)-Date.parse(from))/86400000);
 return {...h,incomes:h.incomes.map(i=>({...i,arrivalStart:addDays(i.arrivalStart,delta),arrivalEnd:addDays(i.arrivalEnd,delta)})),obligations:h.obligations.map(o=>({...o,due:addDays(o.due,delta)}))};
}
export function scenarioHousehold(h:Household,id:string,start:string):Household {
 if(id==='S4') return {...h,funds:h.funds.map(f=>f.id==='cash'?{...f,amount:1500000}:f)};
 return id==='S8'?{...h,checkins:[{id:'stale',householdId:h.id,time:addDays(start,-14),minutes:2}]}:h;
}
