import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ItemCarrito } from '@/types';
import { obtenerProductoPorId } from '@/store';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  items: ItemCarrito[];
  totalPrecio: number;
  onActualizar: (productoId: string, cantidad: number) => void;
  onEliminar: (productoId: string) => void;
  onCheckout: () => void;
}

export function CarritoSidebar({ abierto, onCerrar, items, totalPrecio, onActualizar, onEliminar, onCheckout }: Props) {
  return (
    <Sheet open={abierto} onOpenChange={onCerrar}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tu Carrito ({items.reduce((s, i) => s + i.cantidad, 0)})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Tu carrito está vacío
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {items.map(item => {
                const prod = obtenerProductoPorId(item.productoId);
                if (!prod) return null;
                return (
                  <div key={item.productoId} className="flex gap-3 p-2 rounded-lg border">
                    <img src={prod.imagen} alt={prod.nombre} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prod.nombre}</p>
                      <p className="text-xs text-muted-foreground">{prod.talla}</p>
                      <p className="text-sm font-bold text-primary">${(prod.precio * item.cantidad).toLocaleString('es-MX')}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onActualizar(item.productoId, item.cantidad - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.cantidad}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onActualizar(item.productoId, item.cantidad + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onEliminar(item.productoId)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${totalPrecio.toLocaleString('es-MX')} MXN</span>
              </div>
              <Button className="w-full" size="lg" onClick={onCheckout}>
                Proceder al pago
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
