import { Producto } from '@/types';
import { formatearMoneda } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  producto: Producto;
  onAgregar: (id: string) => void;
}

export function TarjetaProducto({ producto, onAgregar }: Props) {
  const sinStock = producto.stock <= 0;

  return (
    <Card className={cn("group transition-all flex flex-col border-none hover:shadow-lg shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden", sinStock && "opacity-60 grayscale hover:shadow-none")}>
      <div className="flex items-center justify-center overflow-hidden bg-[#f8f9fa] aspect-square p-4 relative">
        {sinStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
            <span className="bg-slate-900 text-white font-bold px-3 py-1 text-[10px] uppercase tracking-widest rotate-[-12deg] shadow-lg rounded-sm">
              Agotado
            </span>
          </div>
        )}
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full transition-transform group-hover:scale-105 drop-shadow-md object-contain mix-blend-multiply"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-1">
        <CardContent className="flex flex-col items-center flex-1 p-4 gap-2">
          <h3 className="font-bold text-base text-foreground text-center leading-tight line-clamp-1" title={producto.nombre}>{producto.nombre}</h3>
          <p className="text-xs text-muted-foreground text-center line-clamp-2 leading-relaxed" title={producto.descripcion}>{producto.descripcion}</p>
          <span className="text-lg font-mono tracking-tight font-black text-foreground mt-auto pt-2">{formatearMoneda(producto.precio).split(' ')[0]} <span className="text-[10px] font-sans font-semibold text-muted-foreground tracking-normal">{formatearMoneda(producto.precio).split(' ')[1]}</span></span>
        </CardContent>
        <Button 
          className="w-full rounded-none h-10 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-[0.98] active:bg-primary/90 transition-all duration-150" 
          onClick={() => onAgregar(producto.id)}
          disabled={sinStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {sinStock ? 'Sin stock' : 'Agregar'}
        </Button>
      </div>
    </Card>
  );
}
