import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ActividadReciente } from '@/types';

export const registrarActividad = async (tipo: ActividadReciente['tipo'], mensaje: string) => {
  await supabase.from('actividad_reciente').insert({ tipo, mensaje });
};

export function useActividad() {
  const [actividad, setActividad] = useState<ActividadReciente[]>([]);
  const [cargando, setCargando] = useState(true);

  const mapear = (row: Record<string, unknown>): ActividadReciente => ({
    id: row.id as string,
    tipo: row.tipo as ActividadReciente['tipo'],
    mensaje: row.mensaje as string,
    fecha: row.fecha as string,
  });

  const cargar = useCallback(async (background = false) => {
    if (!background) setCargando(true);
    const { data } = await supabase
      .from('actividad_reciente')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(50);
    if (data) setActividad((data as Record<string, unknown>[]).map(mapear));
    if (!background) setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const canal = supabase
      .channel(`realtime:actividad:${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actividad_reciente' }, () => cargar(true))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [cargar]);

  const agregarActividad = async (tipo: ActividadReciente['tipo'], mensaje: string) => {
    await supabase.from('actividad_reciente').insert({ tipo, mensaje });
  };

  return { actividad, cargando, agregarActividad };
}
