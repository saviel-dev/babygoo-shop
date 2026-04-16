import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, User, Phone, Mail, Calendar, FileImage, XCircle, MessageCircle, Loader2, Bell, Trash2, RefreshCw } from 'lucide-react';
import { usePedidos } from '@/hooks/usePedidos';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { Pedido, EstadoPedido } from '@/types';
import Swal from 'sweetalert2';

const ESTADOS: EstadoPedido[] = ['Pendiente', 'En proceso', 'Cancelado', 'Entregado'];

const colorEstado: Record<EstadoPedido, string> = {
  'Pendiente': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  'En proceso': 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  'Cancelado': 'bg-red-50 text-red-700 hover:bg-red-100',
  'Entregado': 'bg-green-50 text-emerald-700 hover:bg-green-100',
};

export default function PaginaPedidos() {
  const { pedidos, cargando, nuevoPedido, limpiarNuevoPedido, actualizarEstado, eliminarEntregados, recargar } = usePedidos();
  const { formatearMoneda } = useConfiguracion();
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  if (cargando) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const cambiarEstado = async (pedido: Pedido, nuevoEstado: EstadoPedido) => {
    await actualizarEstado(pedido.id, nuevoEstado);
  };

  const manejarLimpieza = async () => {
    const entregados = pedidos.filter(p => p.estado === 'Entregado').length;
    if (entregados === 0) {
      Swal.fire({ title: 'Atención', text: 'No hay pedidos Entregados para limpiar.', icon: 'info', confirmButtonColor: '#7c3aed' });
      return;
    }

    const res = await Swal.fire({
      title: '¿Limpiar historial?',
      text: `Se eliminarán permanentemente ${entregados} pedido(s) marcado(s) como Entregado.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8'
    });

    if (res.isConfirmed) {
      const { error } = await eliminarEntregados();
      if (error) {
        Swal.fire('Error', 'No se pudieron limpiar los pedidos.', 'error');
      } else {
        Swal.fire({ title: '¡Limpiado!', text: 'El historial de entregados se borró con éxito.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 2000, showConfirmButton: false });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <Button
            variant="outline"
            size="icon"
            title="Actualizar datos"
            onClick={() => recargar()}
            className="text-slate-500 hover:text-primary hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 hover:scale-110 active:scale-90 shadow-sm h-8 w-8 group"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
          {nuevoPedido && (
            <button
              onClick={limpiarNuevoPedido}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 text-sm font-semibold animate-bounce"
            >
              <Bell className="w-4 h-4" /> Nuevo pedido
            </button>
          )}
        </div>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors gap-2 shadow-sm"
          onClick={manejarLimpieza}
        >
          <Trash2 className="w-4 h-4" />
          Limpiar Entregados
        </Button>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No hay pedidos aún</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wider pl-6">Cliente</TableHead>
                <TableHead className="hidden md:table-cell font-medium text-slate-500 text-xs uppercase tracking-wider">Teléfono</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wider">Total</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wider text-center">Estado</TableHead>
                <TableHead className="hidden sm:table-cell font-medium text-slate-500 text-xs uppercase tracking-wider">Fecha</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wider text-center pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map(p => (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                  <TableCell className="font-medium text-slate-800 pl-6">{p.nombreCliente}</TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500 text-sm font-medium">{p.telefono}</TableCell>
                  <TableCell className="font-semibold text-slate-700">{formatearMoneda(p.total)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Select value={p.estado} onValueChange={v => cambiarEstado(p, v as EstadoPedido)}>
                        <SelectTrigger className={`w-[130px] h-9 rounded-full border-0 shadow-none focus:ring-0 font-semibold text-xs transition-colors ${colorEstado[p.estado]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map(e => (
                            <SelectItem key={e} value={e} className="font-medium text-slate-700 text-xs">{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-500 text-sm font-medium">
                    {new Date(p.creadoEn).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-center">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors h-8 w-8" onClick={() => setDetalle(p)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal detalle */}
      <Dialog open={!!detalle} onOpenChange={() => setDetalle(null)}>
        <DialogContent className="sm:max-w-[360px] bg-white border-0 shadow-2xl p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-800 text-left">Detalle del Pedido</DialogTitle>
            </DialogHeader>
          </div>

          {detalle && (
            <div className="px-5 pb-5 pt-1 space-y-4 max-h-[80vh] overflow-y-auto w-full">

              {/* Cliente Info */}
              <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Cliente</span>
                  <div className="font-medium text-slate-800 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{detalle.nombreCliente}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Teléfono</span>
                  <a
                    href={`https://wa.me/${detalle.telefono.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors text-xs font-semibold mt-0.5 group"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-700 group-hover:scale-110 transition-transform" />
                    {detalle.telefono}
                  </a>
                </div>
                {detalle.correo && (
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Correo</span>
                    <a
                      href={`mailto:${detalle.correo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors text-xs font-semibold mt-0.5 group"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                      {detalle.correo}
                    </a>
                  </div>
                )}

                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Estado</span>
                  <div><Badge className={`${colorEstado[detalle.estado]} border-0 shadow-none px-2 py-0 text-[11px] font-semibold`}>{detalle.estado}</Badge></div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Fecha</span>
                  <div className="font-medium text-slate-700 flex items-center gap-1.5 text-xs"><Calendar className="w-3.5 h-3.5 text-slate-400" />{new Date(detalle.creadoEn).toLocaleDateString('es-MX')}</div>
                </div>
              </div>

              {/* Productos */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Productos</h4>
                <div className="space-y-2">
                  {detalle.detalles.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-700">{d.nombreProducto} <span className="text-slate-400 ml-1">x{d.cantidad}</span></span>
                      <span className="font-medium text-slate-700">{formatearMoneda(d.precioUnitario * d.cantidad)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm mt-2 text-primary">
                    <span className="font-bold">Total</span>
                    <span className="font-mono font-black tracking-tighter text-base">{formatearMoneda(detalle.total)}</span>
                  </div>
                </div>
              </div>

              {/* Comprobante */}
              {detalle.comprobante && (
                <div className="border-t border-slate-100 pt-3 pb-1">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Comprobante</h4>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-indigo-100/50 text-indigo-500 rounded shrink-0">
                        <FileImage className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 truncate">comp_{detalle.nombreCliente.split(' ')[0].toLowerCase()}.jpg</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 hover:scale-110 active:scale-90 shadow-sm"
                        title="Previsualizar"
                        onClick={() => setPreviewImg(detalle.comprobante || null)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <a href={detalle.comprobante} download={`comp_${detalle.nombreCliente.split(' ')[0].toLowerCase()}.jpg`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 hover:scale-110 active:scale-90 shadow-sm"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Modal Previsualización de Imagen */}
      <Dialog open={!!previewImg} onOpenChange={() => setPreviewImg(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
          <div className="relative group">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 border-0 text-white"
                onClick={() => setPreviewImg(null)}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            <img
              src={previewImg || ''}
              alt="Previsualización de comprobante"
              className="w-full h-auto max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
