"use client";

import { useEffect } from 'react';
import { inicializarBaseDatos } from '@/lib/powersync';

export default function PowerSyncInitializer() {
  useEffect(() => {
    inicializarBaseDatos();
  }, []);
// En tu archivo de conexión o donde sospeches que está el error
  return null; // Este componente no renderiza nada, solo ejecuta la lógica
}

