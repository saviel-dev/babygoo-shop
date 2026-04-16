import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carrusel } from '@/components/Carrusel';
import { TarjetaProducto } from '@/components/TarjetaProducto';
import { useProductos } from '@/hooks/useProductos';
import { useCategorias } from '@/hooks/useCategorias';
import { VistaProducto } from '@/types';
import { cn } from '@/lib/utils';



export default function PaginaTienda() {
  const carrito = useOutletContext<{ agregar: (id: string) => void }>();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [pagina, setPagina] = useState(0);
  const POR_PAGINA = 15;
  const { productosDisponibles, cargando: cargandoProd } = useProductos();
  const { categorias: catLista, cargando: cargandoCat } = useCategorias();
  const categorias = useMemo(() => ['Todas', ...catLista], [catLista]);

  const productos = useMemo(() => {
    let lista = productosDisponibles;
    if (categoriaFiltro !== 'Todas') lista = lista.filter(p => p.categoria === categoriaFiltro);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
    }
    return lista;
  }, [productosDisponibles, busqueda, categoriaFiltro]);

  const totalPaginas = Math.ceil(productos.length / POR_PAGINA);
  const productosPagina = productos.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  const manejarBusqueda = (val: string) => {
    setBusqueda(val);
    setPagina(0);
  };

  const manejarFiltro = (val: string) => {
    setCategoriaFiltro(val);
    setPagina(0);
  };

  if (cargandoProd || cargandoCat) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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
              onChange={e => manejarBusqueda(e.target.value)}
            />
          </div>
          <Select value={categoriaFiltro} onValueChange={manejarFiltro}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Productos */}
        {productos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {productosPagina.map(p => (
                <TarjetaProducto
                  key={p.id}
                  producto={p}
                  onAgregar={carrito.agregar}
                />
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => { setPagina(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={pagina === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm font-medium text-slate-500">
                  Página {pagina + 1} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  onClick={() => { setPagina(p => Math.min(totalPaginas - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={pagina >= totalPaginas - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
