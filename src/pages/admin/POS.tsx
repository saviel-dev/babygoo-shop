import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, Receipt, User, Phone, Tag, ClipboardList, X, Download, Loader2, RefreshCw } from 'lucide-react';
import { useProductos } from '@/hooks/useProductos';
import { usePedidos } from '@/hooks/usePedidos';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { Producto, DetallePedido, Pedido } from '@/types';
import * as htmlToImage from 'html-to-image';
import Swal from 'sweetalert2';

interface ItemVenta {
  producto: Producto;
  cantidad: number;
}

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'WhatsApp Pay'];

export default function PaginaPOS() {
  const { productosDisponibles: productos, cargando: cargandoProd, recargar: recargarProd } = useProductos();
  const { pedidos, crearPedido, actualizarEstado, cargando: cargandoPed, recargar: recargarPed } = usePedidos();
  const { formatearMoneda, cargando: cargandoConfig } = useConfiguracion();

  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const POR_PAGINA = 8;
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [descuento, setDescuento] = useState(0);
  const [modalImportar, setModalImportar] = useState(false);
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [ticketGenerado, setTicketGenerado] = useState<Pedido | null>(null);
  const [pedidoImportadoId, setPedidoImportadoId] = useState<string | null>(null);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      p.talla.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
  const productosPagina = productosFiltrados.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  const manejarBusqueda = (val: string) => {
    setBusqueda(val);
    setPagina(0);
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          Swal.fire({ title: 'Stock insuficiente', text: `Solo hay ${producto.stock} unidades disponibles.`, icon: 'warning', confirmButtonColor: '#7c3aed', timer: 2000, showConfirmButton: false });
          return prev;
        }
        return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito(prev => prev
      .map(i => i.producto.id === id ? { ...i, cantidad: Math.max(0, Math.min(i.producto.stock, i.cantidad + delta)) } : i)
      .filter(i => i.cantidad > 0)
    );
  };

  const eliminarItem = (id: string) => setCarrito(prev => prev.filter(i => i.producto.id !== id));

  const subtotal = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const montoDescuento = (subtotal * descuento) / 100;
  const total = subtotal - montoDescuento;

  const pedidosDisponibles = useMemo(() => {
    const q = busquedaPedido.toLowerCase();
    return pedidos
      .filter(p => p.estado !== 'Entregado')
      .filter(p =>
        p.nombreCliente.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.telefono || '').toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [modalImportar, busquedaPedido, pedidos]);

  const importarPedido = (pedido: Pedido) => {
    const nuevosItems: ItemVenta[] = [];
    for (const detalle of pedido.detalles) {
      const prod = productos.find(p => p.id === detalle.productoId);
      if (prod && prod.disponible && prod.stock > 0) {
        const cantidadImportar = Math.min(detalle.cantidad, prod.stock);
        nuevosItems.push({ producto: prod, cantidad: cantidadImportar });
      }
    }
    if (nuevosItems.length === 0) {
      Swal.fire({ title: 'Sin productos disponibles', text: 'Los productos de este pedido no tienen stock actualmente.', icon: 'info', confirmButtonColor: '#7c3aed' });
      return;
    }
    setCarrito(nuevosItems);
    setCliente(pedido.nombreCliente);
    setTelefono(pedido.telefono !== 'POS - Sin teléfono' ? pedido.telefono : '');
    setPedidoImportadoId(pedido.id);
    setModalImportar(false);
    setBusquedaPedido('');
    Swal.fire({ title: '¡Importado!', text: `Se cargaron ${nuevosItems.length} producto(s) del pedido de ${pedido.nombreCliente}.`, icon: 'success', confirmButtonColor: '#7c3aed', timer: 1800, showConfirmButton: false });
  };

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      Swal.fire({ title: 'Carrito vacío', text: 'Agrega al menos un producto para continuar.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }
    if (!cliente.trim()) {
      Swal.fire({ title: 'Falta el nombre', text: 'Ingresa el nombre del cliente.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Confirmar venta?',
      html: `
        <div style="text-align:left;font-size:14px;line-height:1.8">
          <b>Cliente:</b> ${cliente}<br/>
          <b>Método de pago:</b> ${metodoPago}<br/>
          <b>Total:</b> <span style="color:#7c3aed;font-weight:800">${formatearMoneda(total)}</span>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, registrar venta',
      cancelButtonText: 'Cancelar',
    });

    if (!confirm.isConfirmed) return;

    // Registrar el pedido
    const detalles: DetallePedido[] = carrito.map(i => ({
      productoId: i.producto.id,
      nombreProducto: i.producto.nombre,
      cantidad: i.cantidad,
      precioUnitario: i.producto.precio,
    }));

    let finalId = '';

    if (pedidoImportadoId) {
      // Si el pedido ya existe, solo actualizamos su estado
      // (asumimos que el stock ya fue descontado al crear el original)
      const { error } = await actualizarEstado(pedidoImportadoId, 'Entregado');
      if (error) {
        Swal.fire({ title: 'Error', text: 'No se pudo actualizar el pedido original.', icon: 'error', confirmButtonColor: '#7c3aed' });
        return;
      }
      finalId = pedidoImportadoId;
    } else {
      // Si es una venta nueva desde cero
      const result = await crearPedido({
        nombreCliente: cliente,
        telefono: telefono || 'POS - Sin teléfono',
        detalles,
        total,
      });

      if (result.error || !result.id) {
        Swal.fire({ title: 'Error', text: 'No se pudo procesar la venta.', icon: 'error', confirmButtonColor: '#7c3aed' });
        return;
      }
      finalId = result.id;
      // En POS la venta es inmediata
      await actualizarEstado(finalId, 'Entregado');
    }

    // Limpiar formulario y mostrar ticket mock
    const pedidoFinal: Pedido = {
      id: finalId,
      nombreCliente: cliente,
      telefono: telefono || 'POS - Sin teléfono',
      detalles,
      total,
      estado: 'Entregado',
      creadoEn: new Date().toISOString(),
    };

    setCarrito([]);
    setCliente('');
    setTelefono('');
    setDescuento(0);
    setMetodoPago('Efectivo');
    setPedidoImportadoId(null);

    setTicketGenerado(pedidoFinal);
  };

  const descargarTicket = async () => {
    const elemento = document.getElementById('ticket-capture');
    if (!elemento || !ticketGenerado) return;
    
    try {
      const url = await htmlToImage.toPng(elemento, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ticket_${ticketGenerado.nombreCliente.replace(/\s+/g, '_')}_${ticketGenerado.id.slice(0, 6).toUpperCase()}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'Error', text: 'No se pudo generar el ticket.', icon: 'error', confirmButtonColor: '#7c3aed' });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full min-h-[600px]">
      {(cargandoProd || cargandoPed || cargandoConfig) && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}

      {/* ── Modal Importar desde Pedido ── */}
      <Dialog open={modalImportar} onOpenChange={v => { setModalImportar(v); if (!v) setBusquedaPedido(''); }}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2 pr-6">
                <ClipboardList className="w-4 h-4 text-primary" /> Importar desde Pedido
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-5 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o ID de pedido..."
                className="pl-9 h-9 text-sm"
                value={busquedaPedido}
                onChange={e => setBusquedaPedido(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-50" style={{ maxHeight: '55vh' }}>
            {pedidosDisponibles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No se encontraron pedidos</div>
            ) : (
              pedidosDisponibles.map(p => (
                <button
                  key={p.id}
                  onClick={() => importarPedido(p)}
                  className="w-full flex items-start gap-4 px-5 py-3.5 hover:bg-primary/5 transition-colors text-left group"
                >
                  {/* Avatar inicial */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {p.nombreCliente.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800 truncate">{p.nombreCliente}</span>
                      <span className="text-xs font-mono font-bold text-primary shrink-0">{formatearMoneda(p.total)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">#{p.id.slice(0, 8).toUpperCase()}</span>
                      <span className="text-[11px] text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400">{new Date(p.creadoEn).toLocaleDateString('es-MX')}</span>
                      <span className="text-[11px] text-slate-300">·</span>
                      <span className="text-[11px] text-slate-500">{p.detalles.length} ítem{p.detalles.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-center">
                    <Badge
                      className={`text-[10px] font-semibold border-0 ${
                        p.estado === 'Entregado' ? 'bg-green-50 text-emerald-700' :
                        p.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700' :
                        p.estado === 'En proceso' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}
                    >
                      {p.estado}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Ticket Generado ── */}
      <Dialog open={!!ticketGenerado} onOpenChange={(v) => { if(!v) setTicketGenerado(null); }}>
        <DialogContent className="sm:max-w-sm bg-slate-50 border-0 p-0 overflow-hidden shadow-2xl">
          <div className="p-8 bg-white max-h-[85vh] overflow-y-auto" id="ticket-capture">
            {ticketGenerado && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">BabyGoo!</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6">Comprobante de Venta</p>
                
                <div className="w-full space-y-3 text-sm mb-6">
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Cliente</span>
                    <span className="font-bold text-slate-800">{ticketGenerado.nombreCliente}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Fecha</span>
                    <span className="font-bold text-slate-800">{new Date(ticketGenerado.creadoEn).toLocaleString('es-MX', {dateStyle:'short', timeStyle:'short'})}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Venta #</span>
                    <span className="font-mono font-bold text-slate-800">{ticketGenerado.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="text-xs font-bold text-slate-800 border-b border-slate-800 pb-2 mb-3 uppercase tracking-wider">Detalle de Compra</h3>
                  <div className="space-y-3 mb-4">
                    {ticketGenerado.detalles.map((d, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-600 font-medium">{d.cantidad}x {d.nombreProducto}</span>
                        <span className="font-bold text-slate-800">{formatearMoneda(d.cantidad * d.precioUnitario)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-800 pt-3">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">Total Pagado</span>
                    <span className="font-mono text-xl font-black text-primary tracking-tighter">{formatearMoneda(ticketGenerado.total)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 w-full text-center text-xs text-slate-400 font-medium border-t border-dashed border-slate-200">
                  <p>¡Gracias por tu compra!</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button variant="outline" className="flex-1 font-bold text-slate-600" onClick={() => setTicketGenerado(null)}>
              Cerrar
            </Button>
            <Button className="flex-1 gap-2 font-bold shadow-lg" onClick={descargarTicket}>
              <Download className="w-4 h-4" />
              Descargar Imagen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Panel izquierdo: Catálogo ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Punto de Venta</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              title="Actualizar datos"
              onClick={() => { recargarProd(); recargarPed(); }}
              className="text-slate-500 hover:text-primary hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 hover:scale-110 active:scale-90 shadow-sm h-8 w-8 group"
            >
              <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-slate-600 hover:text-primary hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 font-bold text-xs h-8 px-3"
              onClick={() => setModalImportar(true)}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Importar desde Pedido
            </Button>
            <Badge variant="outline" className="text-slate-500 font-medium">
              {productos.length} producto{productos.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, talla o categoría..."
            className="pl-10 pr-10"
            value={busqueda}
            onChange={e => manejarBusqueda(e.target.value)}
          />
          {busqueda && (
            <button 
              onClick={() => manejarBusqueda('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1" style={{ maxHeight: '65vh' }}>
          {productosPagina.map(p => {
            const enCarrito = carrito.find(i => i.producto.id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => agregarAlCarrito(p)}
                className="group relative flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {/* Thumbnail */}
                <div className="w-full aspect-square bg-slate-50 overflow-hidden relative">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                  )}
                  {/* Badge cantidad en carrito */}
                  {enCarrito && (
                    <span className="absolute top-2 right-2 bg-primary text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                      {enCarrito.cantidad}
                    </span>
                  )}
                  {/* Overlay add */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-primary text-white rounded-full p-1.5 shadow-lg">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5 flex flex-col gap-1 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate leading-tight">{p.nombre}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{p.talla}</span>
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{p.categoria}</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-sm font-black text-primary">{formatearMoneda(p.precio)}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.stock} en stock</span>
                  </div>
                </div>
              </button>
            );
          })}

          {productosFiltrados.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No hay productos disponibles</p>
            </div>
          )}
        </div>

        {/* Controles de Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(p => Math.max(0, p - 1))}
              disabled={pagina === 0}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium text-slate-500">
              Página {pagina + 1} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={pagina >= totalPaginas - 1}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* ── Panel derecho: Carrito y Cobro ── */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
        
        {/* Datos de Venta */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Datos del cliente
            </h2>
            <button 
              onClick={() => { setCarrito([]); setCliente(''); setTelefono(''); setDescuento(0); setMetodoPago('Efectivo'); setBusqueda(''); setPedidoImportadoId(null); }} 
              className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded transition-colors font-medium"
            >
              Limpiar Todo
            </button>
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Nombre del cliente *" className="pl-9 text-sm h-9" value={cliente} onChange={e => setCliente(e.target.value)} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Teléfono (opcional)" className="pl-9 text-sm h-9" value={telefono} onChange={e => setTelefono(e.target.value)} />
          </div>
          <Select value={metodoPago} onValueChange={setMetodoPago}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Método de pago" />
            </SelectTrigger>
            <SelectContent>
              {METODOS_PAGO.map(m => <SelectItem key={m} value={m} className="text-sm">{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Carrito */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" /> Ticket
            </h2>
            {carrito.length > 0 && (
              <button onClick={() => setCarrito([])} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                Vaciar
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px]">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-slate-300">
                <ShoppingCart className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">Selecciona productos del catálogo</p>
              </div>
            ) : (
              carrito.map(item => (
                <div key={item.producto.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  {item.producto.imagen && (
                    <img src={item.producto.imagen} alt={item.producto.nombre} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{item.producto.nombre}</p>
                    <p className="text-[11px] text-slate-400">{item.producto.talla} · {formatearMoneda(item.producto.precio)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => cambiarCantidad(item.producto.id, -1)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <Minus className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-800">{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.producto.id, 1)} className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <Plus className="w-3 h-3 text-slate-600" />
                    </button>
                    <button onClick={() => eliminarItem(item.producto.id)} className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors ml-1">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales */}
          <div className="px-4 py-3 border-t border-slate-100 space-y-2">
            {/* Descuento */}
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 font-medium flex-1">Descuento (%)</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={descuento}
                onChange={e => setDescuento(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-20 h-7 text-xs text-right font-semibold"
              />
            </div>

            {carrito.length > 0 && (
              <>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatearMoneda(subtotal)}</span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span>Descuento ({descuento}%)</span>
                    <span className="font-semibold">- {formatearMoneda(montoDescuento)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-800">Total</span>
                  <span className="font-mono font-black text-lg text-primary tracking-tighter">
                    {formatearMoneda(total)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Boton cobrar */}
        <Button
          onClick={procesarVenta}
          disabled={carrito.length === 0}
          className="w-full h-12 text-base font-bold gap-2 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" />
          Registrar Venta · {formatearMoneda(total)}
        </Button>

      </div>
    </div>
  );
}
