import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { obtenerConfiguracion, guardarConfiguracion, obtenerCategorias, agregarCategoria, editarCategoria, eliminarCategoria, obtenerBanners, guardarBanners, validarPasswordActual, cambiarPasswordAdmin } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Tag, ChevronLeft, ChevronRight, X, Image as ImageIcon, Lock, KeyRound } from 'lucide-react';
import { Banner } from '@/types';
import Swal from 'sweetalert2';

const POR_PAGINA = 6;

export default function PaginaAjustes() {
  const { toast } = useToast();
  const [config, setConfig] = useState(obtenerConfiguracion());

  // ── Categorías ──
  const [categorias, setCategorias] = useState<string[]>(() => obtenerCategorias());
  const [pagina, setPagina] = useState(0);
  const [modalCat, setModalCat] = useState(false);
  const [editandoCat, setEditandoCat] = useState<string | null>(null);
  const [inputCat, setInputCat] = useState('');

  // ── Banners ──
  const [banners, setBanners] = useState<Banner[]>(() => obtenerBanners());
  const [modalBanner, setModalBanner] = useState(false);
  const [editandoBanner, setEditandoBanner] = useState<Banner | null>(null);
  const bannerVacio = { titulo: '', subtitulo: '', color: 'from-primary/90 to-secondary/80' };
  const [formBanner, setFormBanner] = useState<Omit<Banner, 'id'>>(bannerVacio);

  // ── Seguridad (Contraseña) ──
  const [pwdActual, setPwdActual] = useState('');
  const [pwdNueva, setPwdNueva] = useState('');
  const [pwdConfirma, setPwdConfirma] = useState('');

  const totalPaginas = Math.ceil(categorias.length / POR_PAGINA);
  const catPagina = categorias.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  const refrescarCats = () => setCategorias(obtenerCategorias());

  const abrirCrear = () => {
    setEditandoCat(null);
    setInputCat('');
    setModalCat(true);
  };

  const abrirEditar = (cat: string) => {
    setEditandoCat(cat);
    setInputCat(cat);
    setModalCat(true);
  };

  const guardarCat = () => {
    const val = inputCat.trim();
    if (!val) {
      Swal.fire({ title: 'Campo requerido', text: 'El nombre de la categoría no puede estar vacío.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }
    if (editandoCat) {
      const ok = editarCategoria(editandoCat, val);
      if (!ok) {
        Swal.fire({ title: 'Duplicado', text: 'Ya existe una categoría con ese nombre.', icon: 'warning', confirmButtonColor: '#7c3aed' });
        return;
      }
      toast({ title: 'Categoría actualizada' });
    } else {
      const ok = agregarCategoria(val);
      if (!ok) {
        Swal.fire({ title: 'Duplicado', text: 'Ya existe una categoría con ese nombre.', icon: 'warning', confirmButtonColor: '#7c3aed' });
        return;
      }
      toast({ title: 'Categoría creada' });
    }
    refrescarCats();
    setModalCat(false);
  };

  const confirmarEliminar = async (cat: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${cat}"?`,
      text: 'Los productos que usen esta categoría conservarán su valor actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    eliminarCategoria(cat);
    refrescarCats();
    // Adjust page if we deleted last item on page
    const newTotal = Math.ceil((categorias.length - 1) / POR_PAGINA);
    if (pagina >= newTotal && newTotal > 0) setPagina(newTotal - 1);
    toast({ title: 'Categoría eliminada' });
  };

  // --- Helpers de Banners ---
  const refrescarBanners = () => setBanners(obtenerBanners());

  const abrirCrearBanner = () => {
    if (banners.length >= 3) {
      Swal.fire({ title: 'Límite alcanzado', text: 'Solo puedes tener 3 banners activos.', icon: 'info', confirmButtonColor: '#7c3aed' });
      return;
    }
    setEditandoBanner(null);
    setFormBanner(bannerVacio);
    setModalBanner(true);
  };

  const abrirEditarBanner = (b: Banner) => {
    setEditandoBanner(b);
    setFormBanner({ titulo: b.titulo, subtitulo: b.subtitulo, color: b.color });
    setModalBanner(true);
  };

  const guardarBanner = () => {
    if (!formBanner.titulo.trim() || !formBanner.color.trim()) {
      Swal.fire({ title: 'Campos requeridos', text: 'El título y el color son obligatorios.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }

    let nuevos = [...banners];
    if (editandoBanner) {
      nuevos = nuevos.map(b => b.id === editandoBanner.id ? { ...formBanner, id: b.id } : b);
      toast({ title: 'Banner actualizado' });
    } else {
      nuevos.push({ ...formBanner, id: crypto.randomUUID() });
      toast({ title: 'Banner creado' });
    }
    guardarBanners(nuevos);
    refrescarBanners();
    setModalBanner(false);
  };

  const confirmarEliminarBanner = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar banner?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
    });
    if (result.isConfirmed) {
      const nuevos = banners.filter(b => b.id !== id);
      guardarBanners(nuevos);
      refrescarBanners();
      toast({ title: 'Banner eliminado' });
    }
  };

  const guardar = () => {
    guardarConfiguracion(config);
    toast({ title: 'Configuración guardada' });
  };

  const guardarPassword = () => {
    if (!pwdActual || !pwdNueva || !pwdConfirma) {
      Swal.fire({ title: 'Campos incompletos', text: 'Por favor llena todos los campos.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }
    if (!validarPasswordActual(pwdActual)) {
      Swal.fire({ title: 'Contraseña incorrecta', text: 'La contraseña actual no es correcta.', icon: 'error', confirmButtonColor: '#ef4444' });
      return;
    }
    if (pwdNueva !== pwdConfirma) {
      Swal.fire({ title: 'No coinciden', text: 'La nueva contraseña y la confirmación no coinciden.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }
    if (pwdNueva.length < 6) {
      Swal.fire({ title: 'Contraseña corta', text: 'La nueva contraseña debe tener al menos 6 caracteres.', icon: 'warning', confirmButtonColor: '#7c3aed' });
      return;
    }

    cambiarPasswordAdmin(pwdNueva);
    Swal.fire({ title: '¡Éxito!', text: 'Contraseña actualizada correctamente.', icon: 'success', confirmButtonColor: '#10b981' });
    setPwdActual('');
    setPwdNueva('');
    setPwdConfirma('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── COLUMNA IZQUIERDA ── */}
        <div className="space-y-6">
          {/* ── Configuración general ── */}
          <Card>
            <CardHeader>
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la tienda</Label>
                <Input value={config.nombreTienda} onChange={e => setConfig({ ...config, nombreTienda: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={config.telefono} onChange={e => setConfig({ ...config, telefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input value={config.correo} onChange={e => setConfig({ ...config, correo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp URL</Label>
                <Input value={config.whatsapp} onChange={e => setConfig({ ...config, whatsapp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select value={config.moneda || 'MXN'} onValueChange={v => setConfig({ ...config, moneda: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">Pesos Mexicanos (MXN)</SelectItem>
                    <SelectItem value="USD">Dólares (USD)</SelectItem>
                    <SelectItem value="ARS">Pesos Argentinos (ARS)</SelectItem>
                    <SelectItem value="COP">Pesos Colombianos (COP)</SelectItem>
                    <SelectItem value="CLP">Pesos Chilenos (CLP)</SelectItem>
                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                    <SelectItem value="VES">Bolívares (VES)</SelectItem>
                    <SelectItem value="EUR">Euros (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Mensaje de bienvenida</Label>
                <Input value={config.mensajeBienvenida} onChange={e => setConfig({ ...config, mensajeBienvenida: e.target.value })} />
              </div>
            </div>
            <Button onClick={guardar}>Guardar Cambios</Button>
          </CardContent>
        </Card>

        {/* ── Seguridad (Cambiar Contraseña) ── */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Seguridad
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <div className="space-y-2">
                <Label>Contraseña Actual</Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input type="password" value={pwdActual} onChange={e => setPwdActual(e.target.value)} className="pl-9" placeholder="Ingresa tu contraseña actual" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nueva Contraseña</Label>
                  <Input type="password" value={pwdNueva} onChange={e => setPwdNueva(e.target.value)} placeholder="Al menos 6 caracteres" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Contraseña</Label>
                  <Input type="password" value={pwdConfirma} onChange={e => setPwdConfirma(e.target.value)} placeholder="Repite la contraseña" />
                </div>
              </div>
              
              <Button onClick={guardarPassword} variant="default" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700">Actualizar Contraseña</Button>
          </CardContent>
        </Card>
        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div className="space-y-6">
          {/* ── Categorías ── */}
          <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Categorías de Productos
              </CardTitle>
              <Button size="sm" className="gap-1.5 text-xs h-8" onClick={abrirCrear}>
                <Plus className="w-3.5 h-3.5" />
                Nueva
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-1">{categorias.length} categoría{categorias.length !== 1 ? 's' : ''} registrada{categorias.length !== 1 ? 's' : ''}</p>
          </CardHeader>

          <CardContent className="space-y-3">
            {categorias.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No hay categorías aún. ¡Crea una!</p>
              </div>
            ) : (
              <>
                {/* Lista de categorías en la página actual */}
                <div className="space-y-2">
                  {catPagina.map((cat, idx) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black shrink-0">
                          {pagina * POR_PAGINA + idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{cat}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/10"
                          onClick={() => abrirEditar(cat)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => confirmarEliminar(cat)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Pág. {pagina + 1} de {totalPaginas}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={pagina === 0}
                        onClick={() => setPagina(p => p - 1)}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      {Array.from({ length: totalPaginas }, (_, i) => (
                        <Button
                          key={i}
                          variant={pagina === i ? 'default' : 'outline'}
                          size="icon"
                          className="h-7 w-7 text-xs font-bold"
                          onClick={() => setPagina(i)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={pagina === totalPaginas - 1}
                        onClick={() => setPagina(p => p + 1)}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Banners del Home ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Banners del Inicio
              </CardTitle>
              {banners.length < 3 && (
                <Button size="sm" className="gap-1.5 text-xs h-8" onClick={abrirCrearBanner}>
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">{banners.length} de 3 max.</p>
          </CardHeader>

          <CardContent className="space-y-3">
            {banners.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                <p>No hay banners. ¡Crea uno para tu página principal!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {banners.map((b, idx) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group"
                  >
                    <div className="flex flex-col overflow-hidden mr-2">
                      <span className="text-sm font-semibold text-slate-700 truncate">{b.titulo}</span>
                      <span className="text-xs text-muted-foreground truncate">{b.subtitulo || 'Sin subtítulo'}</span>
                      <span className="text-[10px] bg-slate-200 mt-1 px-1 rounded truncate self-start text-slate-500">Color: {b.color}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-primary/10" onClick={() => abrirEditarBanner(b)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => confirmarEliminarBanner(b.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* ── Modal Crear/Editar Categoría ── */}
      <Dialog open={modalCat} onOpenChange={v => { if (!v) setModalCat(false); }}>
        <DialogContent className="sm:max-w-xs p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2 pr-6">
                <Tag className="w-4 h-4 text-primary" />
                {editandoCat ? 'Editar Categoría' : 'Nueva Categoría'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Nombre</Label>
              <Input
                placeholder="Ej: Bebés, Pijamas, Extras..."
                value={inputCat}
                onChange={e => setInputCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guardarCat()}
                autoFocus
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 font-semibold text-slate-600" onClick={() => setModalCat(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 font-bold gap-1.5" onClick={guardarCat}>
                {editandoCat ? <><Pencil className="w-3.5 h-3.5" /> Guardar</> : <><Plus className="w-3.5 h-3.5" /> Crear</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal Crear/Editar Banner ── */}
      <Dialog open={modalBanner} onOpenChange={v => { if (!v) setModalBanner(false); }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-800 flex items-center gap-2 pr-6">
                <ImageIcon className="w-4 h-4 text-primary" />
                {editandoBanner ? 'Editar Banner' : 'Nuevo Banner'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Título</Label>
              <Input
                placeholder="Ej: ¡Gran Promoción de Verano!"
                value={formBanner.titulo}
                onChange={e => setFormBanner({ ...formBanner, titulo: e.target.value })}
                className="font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Subtítulo (opcional)</Label>
              <Input
                placeholder="Ej: Descuentos de hasta el 50%"
                value={formBanner.subtitulo}
                onChange={e => setFormBanner({ ...formBanner, subtitulo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Fondo CSS (Clases de Tailwind)</Label>
              <Select value={formBanner.color} onValueChange={v => setFormBanner({ ...formBanner, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="from-primary/90 to-secondary/80">Morado a Naranja</SelectItem>
                  <SelectItem value="from-secondary/90 to-primary/80">Naranja a Morado</SelectItem>
                  <SelectItem value="from-emerald-500 to-teal-400">Verde Esmeralda</SelectItem>
                  <SelectItem value="from-blue-600 to-cyan-400">Azul Océano</SelectItem>
                  <SelectItem value="from-rose-500 to-pink-400">Rosa Neón</SelectItem>
                  <SelectItem value="bg-slate-800">Gris Oscuro Sólido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Preview Banner */}
            <div className={`mt-2 rounded-lg p-4 bg-gradient-to-r text-white text-center ${formBanner.color}`}>
               <h4 className="font-bold">{formBanner.titulo || 'Título aquí'}</h4>
               <p className="text-xs opacity-90">{formBanner.subtitulo || 'Subtítulo aquí'}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 font-semibold text-slate-600" onClick={() => setModalBanner(false)}>Cancelar</Button>
              <Button className="flex-1 font-bold gap-1.5" onClick={guardarBanner}>
                {editandoBanner ? <><Pencil className="w-3.5 h-3.5" /> Guardar Cambios</> : <><Plus className="w-3.5 h-3.5" /> Crear Banner</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
