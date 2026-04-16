import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ItemCarrito, DetallePedido } from '@/types';
import { vaciarCarrito } from '@/store';
import { usePedidos } from '@/hooks/usePedidos';
import { useProductos } from '@/hooks/useProductos';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import Swal from 'sweetalert2';
import { ChevronDown, ChevronUp, Copy, CheckCircle2, Landmark } from 'lucide-react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  items: ItemCarrito[];
  totalPrecio: number;
  onPedidoCreado: () => void;
}

export function CheckoutModal({ abierto, onCerrar, items, totalPrecio, onPedidoCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [comprobante, setComprobante] = useState<string>('');
  const [verDetalles, setVerDetalles] = useState(false);
  const [verDatosBancarios, setVerDatosBancarios] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const { crearPedido } = usePedidos();
  const { productosPorId } = useProductos();
  const { formatearMoneda } = useConfiguracion();

  const manejarComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      Swal.fire({ title: 'Error', text: 'El archivo no debe superar 5MB', icon: 'error' });
      return;
    }
    const lector = new FileReader();
    lector.onload = () => setComprobante(lector.result as string);
    lector.readAsDataURL(archivo);
  };

  const copiarDato = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const detalles: DetallePedido[] = items.map(item => {
    const prod = productosPorId(item.productoId);
    return {
      productoId: item.productoId,
      nombreProducto: prod?.nombre || '',
      cantidad: item.cantidad,
      precioUnitario: prod?.precio || 0,
    };
  });

  const enviar = async () => {
    if (!nombre.trim() || !telefono.trim()) {
      Swal.fire({ title: 'Campos requeridos', text: 'Ingresa tu nombre y teléfono.', icon: 'warning' });
      return;
    }
    setEnviando(true);
    const res = await crearPedido({
      nombreCliente: nombre.trim(),
      correo: correo.trim() || undefined,
      telefono: telefono.trim(),
      comprobante: comprobante || undefined,
      detalles,
      total: totalPrecio,
    });
    if (res?.error) {
      Swal.fire({ title: 'Error', text: 'Hubo un error al enviar el pedido. Intenta de nuevo.', icon: 'error' });
      setEnviando(false);
      return;
    }
    vaciarCarrito();
    Swal.fire({
      title: '¡Pedido enviado!',
      text: 'Nos pondremos en contacto contigo pronto.',
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
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
          <div className="space-y-2">
            <Label htmlFor="correo">Correo (opcional)</Label>
            <Input id="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comprobante">Comprobante de pago (máx. 5MB)</Label>
            <Input id="comprobante" type="file" accept="image/*" onChange={manejarComprobante} className="file:text-sm file:font-medium file:text-primary file:bg-primary/5 file:border-0 file:rounded file:px-2 file:py-1 cursor-pointer" />
          </div>
        </div>

        {/* Datos Bancarios Desplegables */}
        <div className="mt-4 border border-indigo-100 rounded-lg p-3 bg-indigo-50/30">
          <button
            className="flex items-center justify-between w-full text-sm font-bold text-indigo-900 group"
            onClick={() => setVerDatosBancarios(!verDatosBancarios)}
          >
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" /> Datos para Transferencia
            </div>
            {verDatosBancarios ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-indigo-400" />}
          </button>
          
          {verDatosBancarios && (
            <div className="mt-3 space-y-3 p-3 bg-white rounded-md border border-indigo-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Banco</p>
                <p className="font-semibold text-slate-800 text-sm">BBVA Bancomer</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Cuenta CLABE</p>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded border border-slate-100">
                  <span className="font-mono font-black text-indigo-700 tracking-widest">012345678901234567</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => copiarDato('012345678901234567')}
                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
                    title="Copiar CLABE"
                  >
                    {copiado ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Titular</p>
                <p className="font-semibold text-slate-800 text-sm">BabyGoo Store S.A. de C.V.</p>
              </div>
            </div>
          )}
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
                  <span className="font-medium">{formatearMoneda(d.precioUnitario * d.cantidad)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between font-bold mt-3 pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">{formatearMoneda(totalPrecio)}</span>
          </div>
        </div>

        <Button className="w-full mt-4" size="lg" onClick={enviar} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar Pedido'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
