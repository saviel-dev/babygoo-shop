import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Producto } from '@/types';
import { registrarActividad } from './useActividad';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapear = (row: Record<string, unknown>): Producto => ({
    id: row.id as string,
    nombre: row.nombre as string,
    descripcion: row.descripcion as string,
    precio: Number(row.precio),
    talla: row.talla as Producto['talla'],
    categoria: row.categoria as string,
    imagen: row.imagen as string,
    stock: Number(row.stock),
    disponible: row.disponible as boolean,
    creadoEn: row.creado_en as string,
  });

  const cargar = useCallback(async (background = false) => {
    if (!background) setCargando(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('creado_en', { ascending: false });
    if (error) setError(error.message);
    else setProductos((data as Record<string, unknown>[]).map(mapear));
    if (!background) setCargando(false);
  }, []);

  useEffect(() => {
    cargar();

    const canal = supabase
      .channel(`realtime:productos:${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        cargar(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [cargar]);

  const crearProducto = async (producto: Omit<Producto, 'id' | 'creadoEn'>) => {
    const { error } = await supabase.from('productos').insert({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      talla: producto.talla,
      categoria: producto.categoria,
      imagen: producto.imagen,
      stock: producto.stock,
      disponible: producto.disponible,
    });
    return { error };
  };

  const actualizarProducto = async (id: string, cambios: Partial<Omit<Producto, 'id' | 'creadoEn'>>) => {
    const payload: Record<string, unknown> = {};
    if (cambios.nombre !== undefined) payload.nombre = cambios.nombre;
    if (cambios.descripcion !== undefined) payload.descripcion = cambios.descripcion;
    if (cambios.precio !== undefined) payload.precio = cambios.precio;
    if (cambios.talla !== undefined) payload.talla = cambios.talla;
    if (cambios.categoria !== undefined) payload.categoria = cambios.categoria;
    if (cambios.imagen !== undefined) payload.imagen = cambios.imagen;
    if (cambios.stock !== undefined) payload.stock = cambios.stock;
    if (cambios.disponible !== undefined) payload.disponible = cambios.disponible;
    const { error } = await supabase.from('productos').update(payload).eq('id', id);
    return { error };
  };

  const eliminarProducto = async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) {
      await registrarActividad('producto', 'Producto eliminado');
    }
    return { error };
  };

  const productosPorId = (id: string) => productos.find(p => p.id === id);
  const productosDisponibles = productos.filter(p => p.disponible);

  return { productos, productosDisponibles, productosPorId, cargando, error, crearProducto, actualizarProducto, eliminarProducto, recargar: cargar };
}
