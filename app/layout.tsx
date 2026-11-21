
import PowerSyncInitializer from '../powersync/PowerSync_initializer';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import FondoWrapper from './FondoWrapper';
import { Outfit, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700', '900'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Universo del Conocimiento',
  description:
    'Plataforma educativa gamificada para niños de 10 a 12 años. Explora planetas, aprende matemáticas, lengua y ciencias.',
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('universo-theme');var v=(t==='light'||t==='dark')?t:'dark';var r=document.documentElement;r.dataset.theme=v;r.classList.remove('light','dark');r.classList.add(v);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${outfit.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={outfit.className}>
        <FondoWrapper />
        <PowerSyncInitializer />
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
