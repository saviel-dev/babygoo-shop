import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useCategorias() {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async (background = false) => {
    if (!background) setCargando(true);
    const { data } = await supabase
      .from('categorias')
      .select('nombre')
      .order('orden', { ascending: true });
    if (data) setCategorias((data as { nombre: string }[]).map(c => c.nombre));
    if (!background) setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const canal = supabase
      .channel(`realtime:categorias:${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => cargar(true))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [cargar]);

  const agregarCategoria = async (nombre: string) => {
    const normalizado = nombre.trim();
    if (!normalizado) return { error: 'Nombre vacío' };
    // Obtener max orden
    const { data: max } = await supabase.from('categorias').select('orden').order('orden', { ascending: false }).limit(1);
    const maxOrden = max && max.length > 0 ? (max[0] as { orden: number }).orden : 0;
    const { error } = await supabase.from('categorias').insert({ nombre: normalizado, orden: maxOrden + 1 });
    return { error: error?.message };
  };

  const editarCategoria = async (original: string, nuevo: string) => {
    const normalizado = nuevo.trim();
    if (!normalizado) return { error: 'Nombre vacío' };
    const { error } = await supabase.from('categorias').update({ nombre: normalizado }).eq('nombre', original);
    return { error: error?.message };
  };

  const eliminarCategoria = async (nombre: string) => {
    const { error } = await supabase.from('categorias').delete().eq('nombre', nombre);
    return { error: error?.message };
  };

  return { categorias, cargando, agregarCategoria, editarCategoria, eliminarCategoria, recargar: cargar };
}
