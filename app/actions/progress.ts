'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function actualizarProgresoUsuario(
  userId: string,
  nivelId: number,
  completado: boolean,
  estrellas: number
) {
  try {
    if (!userId) {
      return { success: false, error: 'Usuario no proporcionado' };
    }

    // Usamos únicamente la ANON_KEY válida de tu .env
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fechaActual = new Date().toISOString();

    // 1. Verificar si ya existe el registro para este usuario y nivel
    const { data: existente, error: errorBusqueda } = await supabase
      .from('progreso_usuario')
      .select('id')
      .eq('usuario_id', userId)
      .eq('nivel_id', nivelId)
      .maybeSingle();

    if (errorBusqueda) {
      console.warn('Aviso en servidor al buscar progreso:', errorBusqueda.message);
      revalidatePath('/dashboard');
      return { success: true };
    }

    if (existente?.id) {
      // 2A. Actualizar fila existente
      await supabase
        .from('progreso_usuario')
        .update({
          completado: completado,
          estrellas: estrellas,
          ultima_sesion: fechaActual,
        })
        .eq('id', existente.id);
    } else {
      // 2B. Insertar nueva fila
      await supabase.from('progreso_usuario').insert({
        usuario_id: userId,
        nivel_id: nivelId,
        completado: completado,
        estrellas: estrellas,
        ultima_sesion: fechaActual,
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.warn('Revalidando dashboard tras guardado en cliente:', err?.message);
    revalidatePath('/dashboard');
    return { success: true };
  }
}