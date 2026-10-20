import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
// next/font self-hosts the files at build time, so CSP font-src 'self' still holds and no request leaves the device.
const sans=Plus_Jakarta_Sans({subsets:['latin'],variable:'--font-sans',display:'swap'});
export const metadata: Metadata={title:'Ngebul — Rencana hari ini, tenang esok nanti',description:'Perencana arus kas untuk rumah tangga berpendapatan tidak tetap. Data tersimpan di perangkat.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="id" className={sans.variable}><body>{children}</body></html>;}
