import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, RefreshCw, ArrowDownUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Producto, Talla, Categoria } from '@/types';
import Swal from 'sweetalert2';
import { useProductos } from '@/hooks/useProductos';
import { useCategorias } from '@/hooks/useCategorias';
import { useConfiguracion } from '@/hooks/useConfiguracion';
import { Loader2 } from 'lucide-react';
const TALLAS: Talla[] = ['RN', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '24M'];

const productoVacio: Omit<Producto, 'id' | 'creadoEn'> = {
  nombre: '', descripcion: '', precio: 0, talla: 'RN', categoria: 'Unisex',
  imagen: '', stock: 0, disponible: true,
};

export default function PaginaInventario() {
  const { productos, cargando: cargandoProd, crearProducto, actualizarProducto, eliminarProducto, recargar: recargarProd } = useProductos();
  const { categorias, cargando: cargandoCat, recargar: recargarCat } = useCategorias();
  const { formatearMoneda } = useConfiguracion();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(productoVacio);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTalla, setFiltroTalla] = useState('Todas');

  // Estados para el modal de movimientos
  const [movSearch, setMovSearch] = useState('');
  const [movSelectedProd, setMovSelectedProd] = useState<Producto | null>(null);
  const [movTipo, setMovTipo] = useState<'Entrada' | 'Salida' | ''>('');
  const [movCantidad, setMovCantidad] = useState<string>('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 6;

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroCategoria, filtroTalla, productos.length]);
  const abrirCrear = () => {
    setEditando(null);
    setForm(productoVacio);
    setModalAbierto(true);
  };

  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, talla: p.talla, categoria: p.categoria, imagen: p.imagen, stock: p.stock, disponible: p.disponible });
    setModalAbierto(true);
  };

  const manejarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 2 * 1024 * 1024) {
      Swal.fire({ title: 'Error', text: 'La imagen no debe superar 2MB', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }
    const lector = new FileReader();
    lector.onload = () => setForm({ ...form, imagen: lector.result as string });
    lector.readAsDataURL(archivo);
  };

  const abrirMovimiento = () => {
    setMovSearch('');
    setMovSelectedProd(null);
    setMovTipo('');
    setMovCantidad('');
    setModalMovimientoAbierto(true);
  };

  const guardarMovimiento = async () => {
    if (!movSelectedProd || !movTipo) return;
    const cant = parseInt(movCantidad, 10);
    if (isNaN(cant) || cant <= 0) {
      Swal.fire({ title: 'Error', text: 'Ingresa una cantidad válida mayor a 0 y sin decimales', icon: 'error', confirmButtonColor: '#7c3aed' });
      return;
    }

    let nuevoStock = movSelectedProd.stock;
    if (movTipo === 'Entrada') {
      nuevoStock += cant;
    } else if (movTipo === 'Salida') {
      if (cant > nuevoStock) {
        Swal.fire({ title: 'Error', text: 'No hay suficiente stock para esta salida. Stock actual: ' + nuevoStock, icon: 'error', confirmButtonColor: '#7c3aed' });
        return;
      }
      nuevoStock -= cant;
    }

    const res = await actualizarProducto(movSelectedProd.id, { stock: nuevoStock });
    if (res?.error) {
      Swal.fire({ title: 'Error', text: res.error.message || 'Error al actualizar stock', icon: 'error', confirmButtonColor: '#7c3aed' });
      return;
    }

    setModalMovimientoAbierto(false);
    Swal.fire({ title: '¡Exito!', text: 'Movimiento registrado correctamente', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
  };

  const guardar = async () => {
    if (!form.nombre.trim()) { Swal.fire({ title: 'Error', text: 'El nombre es requerido', icon: 'error', confirmButtonColor: '#7c3aed' }); return; }
    if (form.precio < 0) { Swal.fire({ title: 'Error', text: 'El precio no puede ser negativo', icon: 'error', confirmButtonColor: '#7c3aed' }); return; }

    setGuardando(true);
    const productoData = { ...form };
    let res;
    if (editando) {
      res = await actualizarProducto(editando.id, productoData);
    } else {
      res = await crearProducto(productoData);
    }

    if (res?.error) {
      setGuardando(false);
      Swal.fire({ title: 'Error', text: res.error.message || 'Hubo un error al guardar', icon: 'error', confirmButtonColor: '#7c3aed' });
      return;
    }

    setGuardando(false);
    setModalAbierto(false);
    Swal.fire({ title: '¡Éxito!', text: editando ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
  };

  const borrar = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    const res = await eliminarProducto(id);
    if (res?.error) {
      Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
      return;
    }
    Swal.fire({ title: '¡Eliminado!', text: 'El producto ha sido borrado del inventario.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
  };


  const productosFiltrados = useMemo(() => {
    let lista = productos;
    if (filtroCategoria !== 'Todas') lista = lista.filter(p => p.categoria === filtroCategoria);
    if (filtroTalla !== 'Todas') lista = lista.filter(p => p.talla === filtroTalla);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(p => p.nombre.toLowerCase().includes(q));
    }
    return lista;
  }, [productos, filtroCategoria, filtroTalla, busqueda]);

  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);

  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return productosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [productosFiltrados, paginaActual]);

  if (cargandoProd || cargandoCat) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            title="Actualizar datos"
            onClick={() => { recargarProd(); recargarCat(); }}
            className="text-slate-500 hover:text-primary hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 hover:scale-110 active:scale-90 shadow-sm group"
          >
            <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
          <Button variant="secondary" onClick={abrirMovimiento} className="gap-2"><ArrowDownUp className="h-4 w-4" /> Movimiento</Button>
          <Button onClick={abrirCrear} className="gap-2"><Plus className="h-4 w-4" /> Agregar Producto</Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-10" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroTalla} onValueChange={setFiltroTalla}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas</SelectItem>
            {TALLAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-primary/10">
            <TableRow>
              <TableHead className="text-center">Imagen</TableHead>
              <TableHead className="text-center">Nombre</TableHead>
              <TableHead className="hidden md:table-cell text-center">Talla</TableHead>
              <TableHead className="hidden md:table-cell text-center">Categoría</TableHead>
              <TableHead className="text-center">Precio</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Disponible</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginados.map(p => (
              <TableRow key={p.id}>
                <TableCell><div className="flex justify-center"><img src={p.imagen} alt={p.nombre} className="w-10 h-10 rounded object-cover" /></div></TableCell>
                <TableCell className="font-medium text-center">{p.nombre}</TableCell>
                <TableCell className="hidden md:table-cell text-center">{p.talla}</TableCell>
                <TableCell className="hidden md:table-cell text-center">{p.categoria}</TableCell>
                <TableCell className="text-center">{formatearMoneda(p.precio)}</TableCell>
                <TableCell className="text-center">{p.stock}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex justify-center">
                    {p.disponible ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500/80" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="icon" onClick={() => abrirEditar(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => borrar(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Modal crear/editar */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>Completa la información del producto.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Precio (MXN) *</Label>
              <Input type="number" min={0} value={form.precio} onChange={e => setForm({ ...form, precio: Math.max(0, Number(e.target.value)) })} />
            </div>
            <div className="space-y-2">
              <Label>Talla</Label>
              <Select value={form.talla} onValueChange={v => setForm({ ...form, talla: v as Talla })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TALLAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v as Categoria })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })} />
            </div>
            <div className="space-y-2">
              <Label>Imagen del Producto</Label>
              <Input type="file" accept="image/*" onChange={manejarImagen} />
              {form.imagen && (
                <div className="mt-2 text-xs flex items-center gap-2">
                  <img src={form.imagen} alt="Preview" className="w-10 h-10 rounded object-cover" />
                  <span className="text-muted-foreground truncate max-w-[150px]">Imagen lista</span>
                </div>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                id="disponible"
                checked={form.disponible}
                onCheckedChange={v => setForm({ ...form, disponible: !!v })}
              />
              <Label htmlFor="disponible">Disponible en tienda</Label>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={guardar} disabled={guardando}>
            {guardando ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />{editando ? 'Guardando...' : 'Creando...'}</>
            ) : (
              editando ? 'Guardar Cambios' : 'Crear Producto'
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal Movimiento de inventario */}
      <Dialog open={modalMovimientoAbierto} onOpenChange={setModalMovimientoAbierto}>
        <DialogContent className="sm:max-w-md overflow-visible">
          <DialogHeader>
            <DialogTitle>Movimiento de Inventario</DialogTitle>
            <DialogDescription>Registra una entrada o salida de stock.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2 relative">
              <Label>Buscar Producto</Label>
              <Input
                placeholder="Escribe el nombre del producto..."
                value={movSearch}
                onChange={e => {
                  setMovSearch(e.target.value);
                  setMovSelectedProd(null);
                  setMovTipo('');
                  setMovCantidad('');
                }}
              />
              {movSearch && !movSelectedProd && (
                <div className="absolute top-full left-0 mt-1 z-50 w-full bg-white border border-slate-200 max-h-40 overflow-y-auto shadow-lg rounded-md">
                  {productos
                    .filter(p => p.nombre.toLowerCase().includes(movSearch.toLowerCase()))
                    .map(p => (
                      <div
                        key={p.id}
                        className="p-2 hover:bg-slate-100 cursor-pointer text-sm border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setMovSelectedProd(p);
                          setMovSearch(p.nombre);
                        }}
                      >
                        <div className="font-medium text-slate-800">{p.nombre}</div>
                        <div className="text-xs text-slate-500">Stock actual: {p.stock}</div>
                      </div>
                    ))}
                  {productos.filter(p => p.nombre.toLowerCase().includes(movSearch.toLowerCase())).length === 0 && (
                    <div className="p-3 text-sm text-slate-500 text-center">No se encontraron productos</div>
                  )}
                </div>
              )}
            </div>

            {movSelectedProd && (
              <div className="p-3 bg-slate-50 rounded-md border border-slate-100 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 truncate mr-2">{movSelectedProd.nombre}</span>
                <span className="text-xs px-2 py-1 bg-slate-200/50 text-slate-600 rounded-full font-medium whitespace-nowrap">Stock: {movSelectedProd.stock}</span>
              </div>
            )}

            {movSelectedProd && (
              <div className="space-y-2">
                <Label>Tipo de Movimiento</Label>
                <Select value={movTipo} onValueChange={(v: 'Entrada' | 'Salida') => setMovTipo(v)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona si es Entrada o Salida" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Salida">Salida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {movSelectedProd && movTipo && (
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={movCantidad}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]+$/.test(val)) {
                      setMovCantidad(val);
                    }
                  }}
                  placeholder="Escribe la cantidad (ej. 10)"
                />
              </div>
            )}
          </div>
          <Button
            className="w-full mt-4"
            onClick={guardarMovimiento}
            disabled={!movSelectedProd || !movTipo || !movCantidad}
          >
            Guardar Movimiento
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
