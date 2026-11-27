
import PowerSyncInitializer from '../powersync/PowerSync_initializer';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import FondoWrapper from './FondoWrapper';
import { Outfit, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import MotionProvider from './components/MotionProvider';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Universo del Conocimiento',
  description:
    'Plataforma educativa gamificada para niños de 10 a 12 años. Explora planetas, aprende matemáticas, lengua y ciencias.',
  manifest: '/manifest.webmanifest',
};

const THEME_INIT_SCRIPT = `(function(){try{var r=document.documentElement;var t=localStorage.getItem('universo-theme');var v=(t==='light'||t==='dark')?t:'dark';r.dataset.theme=v;r.classList.remove('light','dark');r.classList.add(v);var m=document.querySelector('meta[name="color-scheme"]');if(m){m.content=v;}var dm=localStorage.getItem('universo-design-mode');r.dataset.designMode=(dm==='eco'||dm==='original')?dm:'original';var er=localStorage.getItem('universo-easy-reading');r.dataset.easyReading=(er==='true')?'true':'false';}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${outfit.variable} ${geistMono.variable}`}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={outfit.className}>
        <MotionProvider>
          <div className="scroll-progress-bar" aria-hidden="true" />
          <FondoWrapper />
          <PowerSyncInitializer />
          <Header />
          <main className="pt-20">{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
