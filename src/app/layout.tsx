import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'KasMusim — Rencanakan hari, tenangkan langkah',description:'Perencana arus kas rumah tangga dengan pendapatan tidak tetap. Data tersimpan di perangkat.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>;}
