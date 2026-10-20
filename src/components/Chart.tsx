import type { Projection } from '@/domain/types';
const compact=(n:number)=>Math.abs(n)>=1000000?`${(n/1000000).toFixed(1)} jt`:`${Math.round(n/1000)} rb`;
export default function Chart({base,usual,band}:{base:Projection;usual:Projection;band:{date:string;low:number;high:number}[]}){
 const count=35, a=base.days.slice(0,count),b=usual.days.slice(0,count),r=band.slice(0,count);
 const max=Math.max(1000000,...r.map(x=>x.high),...b.map(x=>x.balance)),min=Math.min(0,...r.map(x=>x.low),...a.map(x=>x.balance));
 const x=(i:number)=>64+i/(count-1)*786,y=(v:number)=>22+(max-v)/(max-min)*182;
 const line=(values:number[])=>values.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v)}`).join(' ');
 return <div className="chart-wrap"><svg viewBox="0 0 880 245" role="img" aria-label="Proyeksi saldo 5 minggu. Garis hijau konservatif, garis putus-putus biasa, pita rentang simulasi.">
 {[0,.5,1].map(q=>{const v=min+(max-min)*q;return <g key={q}><line x1="64" x2="850" y1={y(v)} y2={y(v)} stroke="#e7ecea" strokeDasharray="4 5"/><text x="0" y={y(v)+4} fontSize="11" fill="#758078">{compact(v)}</text></g>;})}
 <path d={`${line(r.map(v=>v.high))} ${r.map((_,i)=>`L${x(r.length-1-i)},${y(r[r.length-1-i].low)}`).join(' ')} Z`} fill="#d4ebe0" opacity=".75"/>
 <line x1="64" x2="850" y1={y(0)} y2={y(0)} stroke="#b98163" strokeDasharray="3 4"/>
 <path d={line(b.map(v=>v.balance))} fill="none" stroke="#8eab9e" strokeWidth="2" strokeDasharray="5 5"/>
 <path d={line(a.map(v=>v.balance))} fill="none" stroke="#436b5c" strokeWidth="3" strokeLinejoin="round"/>
 {base.payments.filter(p=>p.due>=a[0].date&&p.due<=a.at(-1)!.date).slice(0,12).map(p=>{const i=a.findIndex(d=>d.date===p.due);return <circle key={p.id} cx={x(i)} cy={y(a[i].balance)} r="3.5" fill={p.covered?'#436b5c':'#b56846'} stroke="white"><title>{`${p.name}: ${p.covered?'tertutup':'belum tertutup'}`}</title></circle>;})}
 {[0,7,14,21,28,34].map(i=><text key={i} x={x(i)} y="234" textAnchor="middle" fill="#758078" fontSize="11">{new Date(a[i].date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</text>)}
 </svg></div>;
}
