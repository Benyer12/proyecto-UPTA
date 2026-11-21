
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${geistMono.variable}`}>
      <body className={`${outfit.className} bg-[#010103] text-white`}>
        <FondoWrapper />
        <PowerSyncInitializer />
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
