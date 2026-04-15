import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Producto, Talla, Categoria } from '@/types';
import { obtenerProductos, guardarProducto, eliminarProducto } from '@/store';
import { useToast } from '@/hooks/use-toast';

const TALLAS: Talla[] = ['RN', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '24M'];
const CATEGORIAS: Categoria[] = ['Niño', 'Niña', 'Unisex', 'Accesorios'];

const productoVacio: Omit<Producto, 'id' | 'creadoEn'> = {
  nombre: '', descripcion: '', precio: 0, talla: 'RN', categoria: 'Unisex',
  imagen: '', stock: 0, disponible: true,
};

export default function PaginaInventario() {
  const { toast } = useToast();
  const [productos, setProductos] = useState(obtenerProductos());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState(productoVacio);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroTalla, setFiltroTalla] = useState('Todas');

  const refrescar = () => setProductos(obtenerProductos());

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
    if (!form.nombre.trim()) { toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' }); return; }
    if (form.precio < 0) { toast({ title: 'Error', description: 'El precio no puede ser negativo', variant: 'destructive' }); return; }

    const producto: Producto = {
      id: editando?.id || crypto.randomUUID(),
      ...form,
      creadoEn: editando?.creadoEn || new Date().toISOString(),
    };
    guardarProducto(producto);
    refrescar();
    setModalAbierto(false);
    toast({ title: editando ? 'Producto actualizado' : 'Producto creado' });
  };

  const borrar = (id: string) => {
    eliminarProducto(id);
    refrescar();
    toast({ title: 'Producto eliminado' });
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
            {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Talla</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden sm:table-cell">Disponible</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productosFiltrados.map(p => (
              <TableRow key={p.id}>
                <TableCell><img src={p.imagen} alt={p.nombre} className="w-10 h-10 rounded object-cover" /></TableCell>
                <TableCell className="font-medium">{p.nombre}</TableCell>
                <TableCell className="hidden md:table-cell">{p.talla}</TableCell>
                <TableCell className="hidden md:table-cell">{p.categoria}</TableCell>
                <TableCell>${p.precio.toLocaleString('es-MX')}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell className="hidden sm:table-cell">{p.disponible ? '✅' : '❌'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
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
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
