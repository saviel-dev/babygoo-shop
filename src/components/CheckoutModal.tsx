import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ItemCarrito, DetallePedido, Pedido } from '@/types';
import { obtenerProductoPorId, guardarPedido, vaciarCarrito } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  items: ItemCarrito[];
  totalPrecio: number;
  onPedidoCreado: () => void;
}

export function CheckoutModal({ abierto, onCerrar, items, totalPrecio, onPedidoCreado }: Props) {
  const { toast } = useToast();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comprobante, setComprobante] = useState<string>('');
  const [verDetalles, setVerDetalles] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const manejarComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      toast({ title: 'Error', description: 'El archivo no debe superar 5MB', variant: 'destructive' });
      return;
    }
    const lector = new FileReader();
    lector.onload = () => setComprobante(lector.result as string);
    lector.readAsDataURL(archivo);
  };

  const detalles: DetallePedido[] = items.map(item => {
    const prod = obtenerProductoPorId(item.productoId);
    return {
      productoId: item.productoId,
      nombreProducto: prod?.nombre || '',
      cantidad: item.cantidad,
      precioUnitario: prod?.precio || 0,
    };
  });

  const enviar = () => {
    if (!nombre.trim() || !telefono.trim()) {
      toast({ title: 'Campos requeridos', description: 'Ingresa tu nombre y teléfono.', variant: 'destructive' });
      return;
    }
    setEnviando(true);

    const pedido: Pedido = {
      id: crypto.randomUUID(),
      nombreCliente: nombre.trim(),
      correo: correo.trim() || undefined,
      telefono: telefono.trim(),
      comprobante: comprobante || undefined,
      detalles,
      total: totalPrecio,
      estado: 'Pendiente',
      creadoEn: new Date().toISOString(),
    };

    guardarPedido(pedido);
    vaciarCarrito();
    toast({ title: '¡Pedido enviado!', description: 'Nos pondremos en contacto contigo pronto.' });
    setNombre(''); setCorreo(''); setTelefono(''); setComprobante('');
    setEnviando(false);
    onPedidoCreado();
    onCerrar();
  };

  return (
    <Dialog open={abierto} onOpenChange={onCerrar}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          <DialogDescription>Completa tus datos para enviar tu pedido.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="María García" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input id="telefono" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+52 55 1234 5678" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="correo">Correo (opcional)</Label>
            <Input id="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="comprobante">Comprobante de pago (máx. 5MB)</Label>
            <Input id="comprobante" type="file" accept="image/*" onChange={manejarComprobante} />
          </div>
        </div>

        {/* Resumen */}
        <div className="mt-4 border rounded-lg p-3">
          <button
            className="flex items-center justify-between w-full text-sm font-medium"
            onClick={() => setVerDetalles(!verDetalles)}
          >
            Ver detalles del pedido
            {verDetalles ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {verDetalles && (
            <div className="mt-3 space-y-2">
              {detalles.map(d => (
                <div key={d.productoId} className="flex justify-between text-sm">
                  <span>{d.nombreProducto} x{d.cantidad}</span>
                  <span className="font-medium">${(d.precioUnitario * d.cantidad).toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between font-bold mt-3 pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">${totalPrecio.toLocaleString('es-MX')} MXN</span>
          </div>
        </div>

        <Button className="w-full mt-4" size="lg" onClick={enviar} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar Pedido'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
