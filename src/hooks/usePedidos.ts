import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Pedido, DetallePedido, EstadoPedido } from '@/types';
import { registrarActividad } from './useActividad';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevoPedido, setNuevoPedido] = useState(false);

  const mapear = (row: Record<string, unknown>): Pedido => {
    const detalles = (row.detalle_pedidos as Record<string, unknown>[] | undefined ?? []).map(
      (d): DetallePedido => ({
        productoId: d.producto_id as string,
        nombreProducto: d.nombre_producto as string,
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precio_unitario),
      })
    );
    return {
      id: row.id as string,
      nombreCliente: row.nombre_cliente as string,
      correo: row.correo as string | undefined,
      telefono: row.telefono as string,
      comprobante: row.comprobante as string | undefined,
      detalles,
      total: Number(row.total),
      estado: row.estado as EstadoPedido,
      creadoEn: row.creado_en as string,
    };
  };

  const cargar = useCallback(async (background = false) => {
    if (!background) setCargando(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, detalle_pedidos(*)')
      .order('creado_en', { ascending: false });
    if (error) setError(error.message);
    else setPedidos((data as Record<string, unknown>[]).map(mapear));
    if (!background) setCargando(false);
  }, []);

  useEffect(() => {
    cargar();

    const canal = supabase
      .channel(`realtime:pedidos:${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, () => {
        setNuevoPedido(true);
        cargar(true);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos' }, () => {
        cargar(true);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pedidos' }, () => {
        cargar(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [cargar]);

  const crearPedido = async (pedido: {
    nombreCliente: string;
    telefono: string;
    correo?: string;
    comprobante?: string;
    detalles: DetallePedido[];
    total: number;
  }) => {
    // Insertar pedido principal
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        nombre_cliente: pedido.nombreCliente,
        telefono: pedido.telefono,
        correo: pedido.correo ?? null,
        comprobante: pedido.comprobante ?? null,
        total: pedido.total,
        estado: 'Pendiente',
      })
      .select()
      .single();

    if (pedidoError || !pedidoData) return { error: pedidoError };

    // Insertar detalles
    const detallesPayload = pedido.detalles.map(d => ({
      pedido_id: (pedidoData as Record<string, unknown>).id as string,
      producto_id: d.productoId,
      nombre_producto: d.nombreProducto,
      cantidad: d.cantidad,
      precio_unitario: d.precioUnitario,
    }));

    const { error: detallesError } = await supabase.from('detalle_pedidos').insert(detallesPayload);
    
    // Descontar stock
    for (const d of pedido.detalles) {
      await supabase.rpc('descontar_stock', { p_producto_id: d.productoId, p_cantidad: d.cantidad });
    }

    if (!detallesError) {
      await registrarActividad('pedido', `Nuevo pedido de ${pedido.nombreCliente}`);
    }

    return { error: detallesError, id: (pedidoData as Record<string, unknown>).id as string };
  };

  const actualizarEstado = async (id: string, estado: EstadoPedido) => {
    const { error } = await supabase.from('pedidos').update({ estado }).eq('id', id);
    if (!error && estado === 'Entregado') {
      await registrarActividad('venta', 'Venta y entrega completada');
    }
    return { error };
  };

  const eliminarEntregados = async () => {
    const { error } = await supabase.from('pedidos').delete().eq('estado', 'Entregado');
    if (!error) {
      await registrarActividad('limpieza', 'Pedidos entregados eliminados');
    }
    return { error };
  };

  const limpiarNuevoPedido = () => setNuevoPedido(false);

  return { pedidos, cargando, error, nuevoPedido, limpiarNuevoPedido, crearPedido, actualizarEstado, eliminarEntregados, recargar: cargar };
}
