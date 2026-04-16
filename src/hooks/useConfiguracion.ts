import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ConfiguracionTienda } from '@/types';

const CONFIG_DEFAULT: ConfiguracionTienda = {
  nombreTienda: 'BabyGoo',
  telefono: '+52 55 1234 5678',
  correo: 'contacto@babygoo.mx',
  whatsapp: 'https://wa.me/5841228655550',
  mensajeBienvenida: '¡Bienvenidos a BabyGoo! Ropa de bebé con amor.',
  moneda: 'MXN',
};

export function useConfiguracion() {
  const [config, setConfig] = useState<ConfiguracionTienda>(CONFIG_DEFAULT);
  const [cargando, setCargando] = useState(true);

  const mapear = (row: Record<string, unknown>): ConfiguracionTienda => ({
    nombreTienda: row.nombre_tienda as string,
    telefono: row.telefono as string,
    correo: row.correo as string,
    whatsapp: row.whatsapp as string,
    mensajeBienvenida: row.mensaje_bienvenida as string,
    moneda: row.moneda as string,
  });

  const cargar = useCallback(async (background = false) => {
    if (!background) setCargando(true);
    const { data } = await supabase
      .from('configuracion_tienda')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (data) {
      setConfig(mapear(data as Record<string, unknown>));
    } else {
      // Si no existe la fila de configuración, la creamos con los valores por defecto
      await supabase.from('configuracion_tienda').upsert({
        id: 1,
        nombre_tienda: CONFIG_DEFAULT.nombreTienda,
        telefono: CONFIG_DEFAULT.telefono,
        correo: CONFIG_DEFAULT.correo,
        whatsapp: CONFIG_DEFAULT.whatsapp,
        mensaje_bienvenida: CONFIG_DEFAULT.mensajeBienvenida,
        moneda: CONFIG_DEFAULT.moneda,
      });
    }
    if (!background) setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
    const canal = supabase
      .channel(`realtime:configuracion:${Math.random()}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'configuracion_tienda' }, () => cargar(true))
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [cargar]);

  const guardarConfiguracion = async (nuevaConfig: ConfiguracionTienda) => {
    const { error } = await supabase.from('configuracion_tienda').upsert({
      id: 1,
      nombre_tienda: nuevaConfig.nombreTienda,
      telefono: nuevaConfig.telefono,
      correo: nuevaConfig.correo,
      whatsapp: nuevaConfig.whatsapp,
      mensaje_bienvenida: nuevaConfig.mensajeBienvenida,
      moneda: nuevaConfig.moneda,
    });
    return { error: error?.message };
  };

  const formatearMoneda = (valor: number) => {
    return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${config.moneda}`;
  };

  return { config, cargando, guardarConfiguracion, formatearMoneda, recargar: cargar };
}
