import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carrusel } from '@/components/Carrusel';
import { TarjetaProducto } from '@/components/TarjetaProducto';
import { obtenerProductosDisponibles } from '@/store';
import { Categoria, VistaProducto } from '@/types';
import { cn } from '@/lib/utils';

const categorias: ('Todas' | Categoria)[] = ['Todas', 'Niño', 'Niña', 'Unisex', 'Accesorios'];

export default function PaginaTienda() {
  const carrito = useOutletContext<{ agregar: (id: string) => void }>();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [vista, setVista] = useState<VistaProducto>('grid');

  const productos = useMemo(() => {
    let lista = obtenerProductosDisponibles();
    if (categoriaFiltro !== 'Todas') lista = lista.filter(p => p.categoria === categoriaFiltro);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
    }
    return lista;
  }, [busqueda, categoriaFiltro]);

  return (
    <div>
      <Carrusel />

      <div className="container mx-auto px-4 pb-8">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button variant={vista === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setVista('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={vista === 'lista' ? 'default' : 'outline'} size="icon" onClick={() => setVista('lista')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Productos */}
        {productos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className={cn(
            vista === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          )}>
            {productos.map(p => (
              <TarjetaProducto
                key={p.id}
                producto={p}
                vista={vista}
                onAgregar={carrito.agregar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
