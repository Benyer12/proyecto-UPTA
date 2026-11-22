'use client';

import dynamic from 'next/dynamic';

const FondoCosmico = dynamic(() => import('./FondoCosmico'), { ssr: false });
const AntigravityParticles = dynamic(() => import('./components/AntigravityParticles'), { ssr: false });

export default function FondoWrapper() {
  return (
    <>
      <FondoCosmico />
      <AntigravityParticles />
    </>
  );
}
