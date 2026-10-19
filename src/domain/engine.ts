import { CONFIG } from './config';
import { addDays, daysBetween } from './dates';
import type { Case, Changes, Household, Income, Obligation, Payment, Projection, Range } from './types';
export const essential = (o: Obligation) => ['makan','sewa','listrik','air','obat','sekolah'].includes(o.category);
export const penalty = (o: Obligation) => o.penalty.kind === 'rp' ? o.penalty.value : o.amount * o.penalty.value / 100;
export function order(a: Obligation, b: Obligation, essentialsFirst = true) {
 const rules={essential:essentialsFirst ? Number(essential(b))-Number(essential(a)):0,penalty:penalty(b)-penalty(a),nonNegotiable:Number(a.negotiable)-Number(b.negotiable),priority:a.priority-b.priority};
 for(const key of CONFIG.defaultOrder) if(rules[key]) return rules[key];
 return a.id.localeCompare(b.id);
}
export function freshness(h: Household, start: string) {
 const last = h.checkins.map(c=>c.time.slice(0,10)).sort().at(-1);
 const days = last ? Math.max(0,daysBetween(last,start)) : null;
 return { days, stale: days === null || days > CONFIG.staleDays };
}
export function widen(range: Range, stale: boolean): Range {
 return stale ? { min: Math.max(0,range.min*(1-CONFIG.staleWidening)), usual: range.usual, max:range.max*(1+CONFIG.staleWidening) } : range;
}
export function occurrences(date: string, repeat: number | undefined, start: string, end: string) {
 const result: string[] = []; let d = date;
 if (repeat && repeat > 0 && d < start) d = addDays(d,Math.ceil(daysBetween(d,start)/repeat)*repeat);
 while(d <= end) { if(d >= start) result.push(d); if(!repeat || repeat<=0) break; d=addDays(d,repeat); }
 return result;
}
export function rng(seed: number) { let n=seed>>>0; return () => { n=(Math.imul(1664525,n)+1013904223)>>>0; return n/4294967296; }; }
function triangular(r: Range, random: ()=>number) {
 if(r.max===r.min) return r.min;
 const u=random(), f=(r.usual-r.min)/(r.max-r.min);
 return u<f ? r.min+Math.sqrt(u*(r.max-r.min)*(r.usual-r.min)) : r.max-Math.sqrt((1-u)*(r.max-r.min)*(r.max-r.usual));
}
export function project(h: Household, start: string, mode: Case = 'conservative', changes: Changes = {}, horizon = CONFIG.horizonDays, random?: ()=>number): Projection {
 const end=addDays(start,horizon-1), stale=freshness(h,start).stale;
 const inflow = new Map<string,number>();
 const put=(date:string,amount:number)=>inflow.set(date,(inflow.get(date)||0)+amount);
 let balance=0, totalIncome=0;
 for(const f of h.funds) { if(f.available==='segera') balance+=f.amount; else if(f.available==='setelah_tanggal' && f.date) { if(f.date<=start) balance+=f.amount; else put(f.date,f.amount); } }
 for(const i of h.incomes) {
  const width=Math.max(0,daysBetween(i.arrivalStart,i.arrivalEnd));
  const range=widen(i.range,stale);
  // Include windows opening before today whose latest arrival is still ahead.
  for(const open of occurrences(i.arrivalStart,i.repeatDays,addDays(start,-width-i.lateDays),end)) {
   if(i.activeMonths.length && !i.activeMonths.includes(Number(open.slice(5,7)))) continue;
   const offset=random ? Math.floor(random()*(width+i.lateDays+1)) : mode==='conservative'?width+i.lateDays:mode==='usual'?Math.round(width/2+i.lateDays/2):0;
   const date=addDays(open,offset);
   const amount=random?triangular(range,random):mode==='conservative'?range.min:mode==='usual'?range.usual:range.max;
   if(date>=start && date<=end) {put(date,amount); totalIncome+=amount;}
  }
 }
 if(changes.extraIncome && changes.extraDate && changes.extraDate>=start && changes.extraDate<=end) {put(changes.extraDate,changes.extraIncome);totalIncome+=changes.extraIncome;}
 const dues=new Map<string,Obligation[]>();
 for(const o of h.obligations) for(const date of occurrences(o.due,o.repeatDays,start,end)) {
  const due=changes.deferId===o.id && o.deferrable ? addDays(date,Math.max(0,changes.deferDays||0)):date;
  if(due<=end) dues.set(due,[...(dues.get(due)||[]),{...o,due}]);
 }
 const payments: Payment[]=[], days: Projection['days']=[]; let firstFailure: string|undefined, essentialTotal=0;
 for(let d=0;d<horizon;d++) {
  const date=addDays(start,d); balance+=inflow.get(date)||0;
  for(const o of (dues.get(date)||[]).sort((a,b)=>order(a,b,changes.essentialsFirst!==false))) {
   const shortfall=Math.max(0,o.amount-Math.max(0,balance)); balance-=o.amount;
   const isEssential=essential(o); if(isEssential) essentialTotal+=o.amount;
   if(isEssential && shortfall>0 && !firstFailure) firstFailure=date;
   payments.push({id:o.id+'@'+date,obligationId:o.id,name:o.name,due:date,amount:o.amount,shortfall,covered:shortfall===0,essential:isEssential,fine:shortfall>0?penalty(o):0,graceRemaining:Math.max(0,daysBetween(start,addDays(date,o.graceDays))),reason:changes.essentialsFirst!==false && isEssential?'Kebutuhan pokok didahulukan':penalty(o)>0?'Risiko denda':!o.negotiable?'Sulit dinegosiasikan':'Prioritas pilihan rumah tangga',negotiable:o.negotiable,deferrable:o.deferrable});
  }
  balance-=h.variables.reduce((s,v)=>s+Math.max(v.floor,v.weekly.usual*(1-Math.min(1,Math.max(0,changes.variableReduction||0))))/7,0);
  days.push({date,balance});
 }
 return {days,payments,firstFailure,runway:firstFailure?daysBetween(start,firstFailure):horizon,totalIncome,essentialTotal,shortfall:payments.reduce((s,p)=>s+p.shortfall,0)};
}
export function structural(h: Household,start:string,changes:Changes={}) {
 // Expense/date changes NEVER remove the original structural gap.
 const base=project(h,start,'usual',{extraIncome:changes.extraIncome,extraDate:changes.extraDate});
 const gap=Math.max(0,base.essentialTotal-base.totalIncome);
 return { flagged:gap>0, gap, weeklyGap:gap/(CONFIG.horizonDays/7) };
}
export function simulate(h:Household,start:string,changes:Changes={},count=CONFIG.simulations,seed=CONFIG.randomSeed) {
 const random=rng(seed), runs=Array.from({length:count},()=>project(h,start,'usual',changes,CONFIG.horizonDays,random));
 const quantile=(values:number[],q:number)=>values.sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(q*values.length))];
 return { band:runs[0].days.map((d,index)=>({date:d.date,low:quantile(runs.map(r=>r.days[index].balance),CONFIG.bandQuantiles[0]),high:quantile(runs.map(r=>r.days[index].balance),CONFIG.bandQuantiles[1])})), probabilities:runs[0].payments.map(p=>{const value=runs.filter(r=>r.payments.find(x=>x.id===p.id)?.covered).length/count;return {id:p.id,low:Math.max(0,Math.floor(value*100/CONFIG.probabilityStep)*CONFIG.probabilityStep-CONFIG.probabilityStep),high:Math.min(100,Math.ceil(value*100/CONFIG.probabilityStep)*CONFIG.probabilityStep+CONFIG.probabilityStep)};}) };
}
export function calibrate(h: Household) {
 return h.incomes.map(i=>{ const values=h.actuals.flatMap(a=>a.incomes.filter(v=>v.sourceId===i.id));const outside=values.filter(v=>v.amount<v.forecast.min || v.amount>v.forecast.max).length;
 return {sourceId:i.id,name:i.name,count:values.length,outside,accuracy:values.length?1-outside/values.length:null,suggestion:values.length>=CONFIG.calibrationWeeks && outside>=2 ? {min:Math.min(...values.map(v=>v.amount)),usual:values.reduce((s,v)=>s+v.amount,0)/values.length,max:Math.max(...values.map(v=>v.amount))}:null}; });
}
export function warningOutcome(warnedOn:string|undefined,due:string,paidOn?:string,observedThrough?:string) {
 const resolved=!!paidOn || (!!observedThrough && observedThrough>=due);
 const late=paidOn?paidOn>due:resolved;
 return {leadDays:warnedOn?Math.max(0,daysBetween(warnedOn,due)):0,falseAlarm:!!warnedOn && resolved && !late,detected:!!warnedOn && resolved && late,resolved};
}
export const PRODUCT_NOTE='Alat perencanaan, bukan nasihat keuangan. Hasil bergantung pada asumsi yang Anda isi.';
