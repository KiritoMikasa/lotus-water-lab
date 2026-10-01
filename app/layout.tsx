import './globals.css';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

const fraunces = localFont({
  src: [
    { path: './fonts/fraunces-normal.woff2', weight: '400 500', style: 'normal' },
    { path: './fonts/fraunces-italic.woff2', weight: '400 500', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
});
const plexMono = localFont({
  src: [
    { path: './fonts/plexmono-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/plexmono-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/plexmono-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lotus Water Lab',
  description: 'A playful mineral water calculator for coffee, tea and sparkling water.',
};
export const viewport: Viewport = { themeColor: '#F3EFE6' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body>
        <div className="app-root">{children}</div>
      </body>
    </html>
  );
}
