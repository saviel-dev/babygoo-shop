import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { obtenerPedidos, guardarPedido } from '@/store';
import { Pedido, EstadoPedido } from '@/types';

const ESTADOS: EstadoPedido[] = ['Pendiente', 'En proceso', 'Cancelado', 'Entregado'];

const colorEstado: Record<EstadoPedido, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'En proceso': 'bg-blue-100 text-blue-800',
  'Cancelado': 'bg-red-100 text-red-800',
  'Entregado': 'bg-green-100 text-green-800',
};

export default function PaginaPedidos() {
  const [pedidos, setPedidos] = useState(obtenerPedidos());
  const [detalle, setDetalle] = useState<Pedido | null>(null);

  const cambiarEstado = (pedido: Pedido, nuevoEstado: EstadoPedido) => {
    const actualizado = { ...pedido, estado: nuevoEstado };
    guardarPedido(actualizado);
    setPedidos(obtenerPedidos());
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No hay pedidos aún</div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombreCliente}</TableCell>
                  <TableCell className="hidden md:table-cell">{p.telefono}</TableCell>
                  <TableCell>${p.total.toLocaleString('es-MX')}</TableCell>
                  <TableCell>
                    <Select value={p.estado} onValueChange={v => cambiarEstado(p, v as EstadoPedido)}>
                      <SelectTrigger className="w-32 h-8">
                        <Badge className={`${colorEstado[p.estado]} border-0 text-xs`}>{p.estado}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {new Date(p.creadoEn).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setDetalle(p)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal detalle */}
      <Dialog open={!!detalle} onOpenChange={() => setDetalle(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido</DialogTitle>
            <DialogDescription>Información completa del pedido.</DialogDescription>
          </DialogHeader>
          {detalle && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Cliente:</span> {detalle.nombreCliente}</div>
                <div><span className="text-muted-foreground">Teléfono:</span> {detalle.telefono}</div>
                {detalle.correo && <div className="col-span-2"><span className="text-muted-foreground">Correo:</span> {detalle.correo}</div>}
                <div><span className="text-muted-foreground">Estado:</span> <Badge className={`${colorEstado[detalle.estado]} border-0`}>{detalle.estado}</Badge></div>
                <div><span className="text-muted-foreground">Fecha:</span> {new Date(detalle.creadoEn).toLocaleString('es-MX')}</div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <p className="font-medium">Productos:</p>
                {detalle.detalles.map((d, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{d.nombreProducto} x{d.cantidad}</span>
                    <span>${(d.precioUnitario * d.cantidad).toLocaleString('es-MX')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>${detalle.total.toLocaleString('es-MX')} MXN</span>
                </div>
              </div>
              {detalle.comprobante && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-2">Comprobante:</p>
                  <img src={detalle.comprobante} alt="Comprobante" className="max-h-48 rounded border" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
