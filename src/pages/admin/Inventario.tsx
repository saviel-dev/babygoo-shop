import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Producto, Talla, Categoria } from '@/types';
import { obtenerProductos, guardarProducto, eliminarProducto, formatearMoneda, obtenerCategorias } from '@/store';
import Swal from 'sweetalert2';

const TALLAS: Talla[] = ['RN', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '24M'];

const productoVacio: Omit<Producto, 'id' | 'creadoEn'> = {
  nombre: '', descripcion: '', precio: 0, talla: 'RN', categoria: 'Unisex',
  imagen: '', stock: 0, disponible: true,
};

export default function PaginaInventario() {
  const [productos, setProductos] = useState(obtenerProductos());
  const [categorias, setCategorias] = useState<string[]>(() => obtenerCategorias());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState(productoVacio);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTalla, setFiltroTalla] = useState('Todas');

  const refrescar = () => {
    setProductos(obtenerProductos());
    setCategorias(obtenerCategorias());
  };

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

  const guardar = () => {
    if (!form.nombre.trim()) { Swal.fire({ title: 'Error', text: 'El nombre es requerido', icon: 'error', confirmButtonColor: '#7c3aed' }); return; }
    if (form.precio < 0) { Swal.fire({ title: 'Error', text: 'El precio no puede ser negativo', icon: 'error', confirmButtonColor: '#7c3aed' }); return; }

    const producto: Producto = {
      id: editando?.id || crypto.randomUUID(),
      ...form,
      creadoEn: editando?.creadoEn || new Date().toISOString(),
    };
    guardarProducto(producto);
    refrescar();
    setModalAbierto(false);
    Swal.fire({ title: '¡Éxito!', text: editando ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', icon: 'success', confirmButtonColor: '#7c3aed', timer: 1500, showConfirmButton: false });
  };

  const borrar = (id: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarProducto(id);
        refrescar();
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El producto ha sido borrado del inventario.',
          icon: 'success',
          confirmButtonColor: '#7c3aed',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button onClick={abrirCrear} className="gap-2"><Plus className="h-4 w-4" /> Agregar Producto</Button>
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
            {productosFiltrados.map(p => (
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
              <Label>URL Imagen</Label>
              <Input value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} placeholder="https://..." />
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
          <Button className="w-full mt-4" onClick={guardar}>
            {editando ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
