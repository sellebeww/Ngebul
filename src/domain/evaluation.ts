import { CONFIG } from './config';
import { daysBetween } from './dates';
import { calibrate, project, structural, warningOutcome } from './engine';
import type { Household } from './types';
export function compareModes(h:Household,reference:string) {
 return ['Catatan bulanan','Rata-rata bertanggal','KasMusim'].map((name,mode)=>{
 let detected=0,falseAlarms=0,leadTotal=0,exposedFines=0,observations=0;
 for(const a of h.actuals) {
  const saved=a.snapshot;
  if(!saved || saved.asOf>a.date) continue;
  const snap={...h,...saved.plan};
  snap.checkins=[{id:'backtest',householdId:h.id,time:saved.asOf,minutes:0}];
  const forecast=project(snap,saved.asOf,mode===2?'conservative':'usual',{},CONFIG.comparisonDays);
  const monthlyFailure=forecast.days.at(-1)!.balance<0;
  for(const p of a.payments) {
   const predicted=forecast.payments.find(x=>x.obligationId===p.obligationId && x.due===p.due);
   const warned=mode===0?monthlyFailure:predicted && !predicted.covered;
   const out=warningOutcome(warned?saved.asOf:undefined,p.due,p.paidOn,reference);
   if(!out.resolved) continue;
   observations++;if(out.detected){detected++;leadTotal+=out.leadDays;exposedFines+=p.fine;} if(out.falseAlarm)falseAlarms++;
  }
 }
 return {name,detected,falseAlarms,lead:detected?leadTotal/detected:0,exposedFines,observations};
 });
}
export function metrics(h:Household,now:string) {
 const records=h.actuals.filter(a=>a.date>=h.trial.start && a.date<=now),payments=records.flatMap(a=>a.payments);
 const late=payments.filter(p=>p.paidOn?p.paidOn>p.due:p.due<now);
 const checkins=h.checkins.filter(c=>c.time.slice(0,10)>=h.trial.start && c.time.slice(0,10)<=now);
 const elapsed=Math.max(1,Math.min(CONFIG.trialWeeks,Math.ceil(daysBetween(h.trial.start,now)/7)));
 const active=new Set(checkins.map(c=>Math.floor(daysBetween(h.trial.start,c.time.slice(0,10))/7)).filter(w=>w>=0 && w<elapsed));
 return {lateCount:late.length,lateDays:late.reduce((s,p)=>s+Math.max(0,daysBetween(p.due,p.paidOn||now)),0),fines:payments.reduce((s,p)=>s+p.fine,0),activeWeeks:active.size,activePercent:active.size/elapsed*100,retained:elapsed>=8?active.has(7):null,minutes:checkins.length?checkins.reduce((s,c)=>s+c.minutes,0)/checkins.length:null,calibration:calibrate(h)};
}
export function cohort(households:Household[],date:string) {const count=households.filter(h=>structural(h,date).flagged).length;return {count,total:households.length,percent:households.length?count/households.length*100:0};}
