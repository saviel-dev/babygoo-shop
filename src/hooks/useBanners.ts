import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Banner } from '@/types';

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cargando, setCargando] = useState(true);

  const mapear = (row: Record<string, unknown>): Banner => ({
    id: row.id as string,
    titulo: row.titulo as string,
    subtitulo: row.subtitulo as string,
    color: row.color as string,
  });

  const cargar = useCallback(async (background = false) => {
    if (!background) setCargando(true);
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('orden', { ascending: true });
    if (data) setBanners((data as Record<string, unknown>[]).map(mapear));
    if (!background) setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const canal = supabase
      .channel(`realtime:banners:${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => cargar(true))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [cargar]);

  const crearBanner = async (banner: Omit<Banner, 'id'>) => {
    if (banners.length >= 3) return { error: 'Máximo 3 banners' };
    const maxOrden = banners.length > 0 ? Math.max(...banners.map((_, i) => i + 1)) : 0;
    const { error } = await supabase.from('banners').insert({
      titulo: banner.titulo,
      subtitulo: banner.subtitulo,
      color: banner.color,
      orden: maxOrden + 1,
    });
    return { error: error?.message };
  };

  const actualizarBanner = async (id: string, cambios: Omit<Banner, 'id'>) => {
    const { error } = await supabase.from('banners').update({
      titulo: cambios.titulo,
      subtitulo: cambios.subtitulo,
      color: cambios.color,
    }).eq('id', id);
    return { error: error?.message };
  };

  const eliminarBanner = async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    return { error: error?.message };
  };

  return { banners, cargando, crearBanner, actualizarBanner, eliminarBanner, recargar: cargar };
}
