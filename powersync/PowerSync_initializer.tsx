"use client";

import { useEffect } from 'react';
import { inicializarBaseDatos } from '@/lib/powersync';

export default function PowerSyncInitializer() {
  useEffect(() => {
    inicializarBaseDatos();
  }, []);

  return null; // Este componente no renderiza nada, solo ejecuta la lógica
}

