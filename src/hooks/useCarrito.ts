import { useState, useCallback, useMemo } from 'react';
import { ItemCarrito } from '@/types';
import {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
  actualizarCantidadCarrito,
  vaciarCarrito,
  obtenerProductoPorId,
} from '@/store';

export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>(obtenerCarrito());

  const refrescar = useCallback(() => {
    setItems(obtenerCarrito());
  }, []);

  const agregar = useCallback((productoId: string, cantidad = 1) => {
    agregarAlCarrito(productoId, cantidad);
    refrescar();
  }, [refrescar]);

  const eliminar = useCallback((productoId: string) => {
    eliminarDelCarrito(productoId);
    refrescar();
  }, [refrescar]);

  const actualizar = useCallback((productoId: string, cantidad: number) => {
    actualizarCantidadCarrito(productoId, cantidad);
    refrescar();
  }, [refrescar]);

  const vaciar = useCallback(() => {
    vaciarCarrito();
    refrescar();
  }, [refrescar]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);

  const totalPrecio = useMemo(() => {
    return items.reduce((sum, item) => {
      const prod = obtenerProductoPorId(item.productoId);
      return sum + (prod ? prod.precio * item.cantidad : 0);
    }, 0);
  }, [items]);

  return { items, agregar, eliminar, actualizar, vaciar, totalItems, totalPrecio, refrescar };
}
