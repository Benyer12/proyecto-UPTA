'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function actualizarProgresoUsuario(nivelId: number, completado: boolean, estrellas: number) {
  const cookieStore = await cookies();

  // Crear el cliente de Supabase para el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignorar si se llama desde un Server Component
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignorar si se llama desde un Server Component
          }
        },
      },
    }
  );

  // Obtener el usuario autenticado actual
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Usuario no autenticado');
  }

  // Insertar o actualizar en tu tabla 'progreso_usuario'
  const { error } = await supabase
    .from('progreso_usuario')
    .upsert({
      usuario_id: user.id,
      nivel_id: nivelId,
      completado: completado,
      estrellas: estrellas,
      ultima_sesion: new Date().toISOString()
    }, {
      onConflict: 'usuario_id,nivel_id' // Asegúrate de tener esta restricción única en Supabase
    });

  if (error) {
    console.error('Error al guardar el progreso:', error.message);
    throw new Error('No se pudo guardar el progreso');
  }

  return { success: true };
}