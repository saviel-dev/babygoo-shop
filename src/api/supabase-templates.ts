// ============================================================
// BabyGoo - Templates para migración a Supabase
// ============================================================
// Este archivo NO se usa en el prototipo local.
// Contiene funciones plantilla para cuando se migre a Supabase.

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Productos
export async function obtenerProductosSupabase() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('disponible', true)
    .gt('stock', 0)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

// Pedidos
export async function crearPedidoSupabase(pedido: any) {
  const { data, error } = await supabase
    .from('pedidos')
    .insert(pedido)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Realtime (opcional futuro)
export function suscribirsePedidos(callback: (payload: any) => void) {
  return supabase
    .channel('pedidos-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, callback)
    .subscribe();
}

// Storage - Comprobantes
export async function subirComprobante(archivo: File, pedidoId: string) {
  const ruta = `comprobantes/${pedidoId}/${archivo.name}`;
  const { data, error } = await supabase.storage
    .from('comprobantes')
    .upload(ruta, archivo);
  if (error) throw error;
  return supabase.storage.from('comprobantes').getPublicUrl(ruta).data.publicUrl;
}
*/

export {};
