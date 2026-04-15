import { Producto, VistaProducto } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  producto: Producto;
  vista: VistaProducto;
  onAgregar: (id: string) => void;
}

export function TarjetaProducto({ producto, vista, onAgregar }: Props) {
  const esGrid = vista === 'grid';

  return (
    <Card className={cn('overflow-hidden group transition-shadow hover:shadow-md', !esGrid && 'flex flex-row')}>
      <div className={cn('overflow-hidden bg-muted', esGrid ? 'aspect-square' : 'w-40 shrink-0')}>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className={cn('flex flex-col justify-between gap-2', esGrid ? 'p-4' : 'p-4 flex-1')}>
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-primary/70">{producto.categoria} · {producto.talla}</span>
          <h3 className="font-semibold text-sm mt-1 leading-tight">{producto.nombre}</h3>
          {!esGrid && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{producto.descripcion}</p>}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-primary">${producto.precio.toLocaleString('es-MX')} <span className="text-xs font-normal text-muted-foreground">MXN</span></span>
          <Button size="sm" onClick={() => onAgregar(producto.id)} className="gap-1">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Agregar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
