import './globals.css';
import type { Metadata, Viewport } from 'next';
export const metadata: Metadata = { title:'Lotus Water Lab', description:'A playful mineral water calculator for coffee, tea and sparkling water.' };
export const viewport: Viewport = { themeColor:'#1d4435' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="aurora" aria-hidden="true"><span/><span/><span/></div><div className="app-root">{children}</div></body></html>}
