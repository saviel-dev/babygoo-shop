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
  return (
    <Card className="group transition-all flex flex-col border-none hover:shadow-lg shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center justify-center overflow-hidden bg-[#f8f9fa] aspect-square p-6">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full transition-transform group-hover:scale-105 drop-shadow-md object-contain mix-blend-multiply"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-1">
        <CardContent className="flex flex-col items-center flex-1 p-5 gap-3">
          <h3 className="font-bold text-lg md:text-xl text-foreground text-center leading-tight line-clamp-1" title={producto.nombre}>{producto.nombre}</h3>
          <p className="text-sm md:text-base text-muted-foreground text-center line-clamp-3 leading-relaxed" title={producto.descripcion}>{producto.descripcion}</p>
          <span className="text-xl md:text-2xl font-mono tracking-tight font-bold text-foreground mt-auto pt-2">{formatearMoneda(producto.precio).split(' ')[0]} <span className="text-xs font-sans font-normal text-muted-foreground tracking-normal">{formatearMoneda(producto.precio).split(' ')[1]}</span></span>
        </CardContent>
        <Button 
          className="w-full rounded-none h-12 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] active:bg-primary/90 transition-all duration-150" 
          onClick={() => onAgregar(producto.id)}
        >
          <ShoppingCart className="h-5 w-5" />
          Agregar
        </Button>
      </div>
    </Card>
  );
}
