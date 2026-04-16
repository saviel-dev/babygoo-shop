// ============================================================
// BabyGoo - Store con localStorage
// ============================================================
import { Producto, Pedido, ItemCarrito, ConfiguracionTienda, ActividadReciente } from '@/types';
import { productosMock } from './datos-mock';

const KEYS = {
  PRODUCTOS: 'babygoo_productos',
  PEDIDOS: 'babygoo_pedidos',
  CARRITO: 'babygoo_carrito',
  CONFIG: 'babygoo_config',
  ACTIVIDAD: 'babygoo_actividad',
  ADMIN_AUTH: 'babygoo_admin_auth',
  CATEGORIAS: 'babygoo_categorias',
  BANNERS: 'babygoo_banners',
  ADMIN_CREDS: 'babygoo_admin_creds',
} as const;

const CATEGORIAS_DEFAULT = ['Niño', 'Niña', 'Unisex', 'Accesorios'];

const BANNERS_DEFAULT: import('@/types').Banner[] = [
  {
    id: '1',
    titulo: '¡Nueva Colección Primavera!',
    subtitulo: 'Hasta 30% de descuento en mamelucos y conjuntos',
    color: 'from-primary/90 to-secondary/80',
  },
  {
    id: '2',
    titulo: 'Recién Nacidos',
    subtitulo: 'La ropa más suave para los más pequeños',
    color: 'from-secondary/90 to-primary/80',
  },
  {
    id: '3',
    titulo: 'Envío Gratis',
    subtitulo: 'En compras mayores a $999 MXN',
    color: 'from-accent/90 to-primary/80',
  },
];

const configInicial: ConfiguracionTienda = {
  nombreTienda: 'BabyGoo',
  telefono: '+52 55 1234 5678',
  correo: 'contacto@babygoo.mx',
  whatsapp: 'https://wa.me/5841228655550',
  mensajeBienvenida: '¡Bienvenidos a BabyGoo! Ropa de bebé con amor.',
  moneda: 'MXN',
};

// ---- Categorías ----
export function obtenerCategorias(): string[] {
  const cats = leer<string[]>(KEYS.CATEGORIAS, []);
  if (cats.length === 0) {
    guardar(KEYS.CATEGORIAS, CATEGORIAS_DEFAULT);
    return [...CATEGORIAS_DEFAULT];
  }
  return cats;
}

export function guardarCategorias(categorias: string[]) {
  guardar(KEYS.CATEGORIAS, categorias);
}

export function agregarCategoria(nombre: string): boolean {
  const cats = obtenerCategorias();
  const normalizado = nombre.trim();
  if (!normalizado || cats.some(c => c.toLowerCase() === normalizado.toLowerCase())) return false;
  guardar(KEYS.CATEGORIAS, [...cats, normalizado]);
  return true;
}

export function editarCategoria(original: string, nuevo: string): boolean {
  const cats = obtenerCategorias();
  const normalizado = nuevo.trim();
  if (!normalizado) return false;
  if (cats.some(c => c.toLowerCase() === normalizado.toLowerCase() && c !== original)) return false;
  guardar(KEYS.CATEGORIAS, cats.map(c => c === original ? normalizado : c));
  return true;
}

export function eliminarCategoria(nombre: string) {
  guardar(KEYS.CATEGORIAS, obtenerCategorias().filter(c => c !== nombre));
}

// ---- Banners ----
export function obtenerBanners() {
  const banners = leer<import('@/types').Banner[]>(KEYS.BANNERS, []);
  if (banners.length === 0) {
    guardar(KEYS.BANNERS, BANNERS_DEFAULT);
    return [...BANNERS_DEFAULT];
  }
  return banners;
}

export function guardarBanners(banners: import('@/types').Banner[]) {
  guardar(KEYS.BANNERS, banners);
}

// ---- Helpers ----
function leer<T>(key: string, fallback: T): T {
  try {
    const dato = localStorage.getItem(key);
    return dato ? JSON.parse(dato) : fallback;
  } catch {
    return fallback;
  }
}

function guardar<T>(key: string, valor: T) {
  localStorage.setItem(key, JSON.stringify(valor));
}

// ---- Productos ----
export function obtenerProductos(): Producto[] {
  const prods = leer<Producto[]>(KEYS.PRODUCTOS, []);
  if (prods.length === 0) {
    guardar(KEYS.PRODUCTOS, productosMock);
    return productosMock;
  }
  return prods;
}

export function obtenerProductosDisponibles(): Producto[] {
  return obtenerProductos().filter(p => p.disponible && p.stock > 0);
}

export function obtenerProductoPorId(id: string): Producto | undefined {
  return obtenerProductos().find(p => p.id === id);
}

export function guardarProducto(producto: Producto) {
  const productos = obtenerProductos();
  const idx = productos.findIndex(p => p.id === producto.id);
  if (idx >= 0) {
    productos[idx] = producto;
  } else {
    productos.push(producto);
  }
  guardar(KEYS.PRODUCTOS, productos);
  agregarActividad('producto', idx >= 0 ? `Producto actualizado: ${producto.nombre}` : `Producto creado: ${producto.nombre}`);
}

export function eliminarProducto(id: string) {
  const productos = obtenerProductos().filter(p => p.id !== id);
  guardar(KEYS.PRODUCTOS, productos);
  agregarActividad('producto', 'Producto eliminado');
}

// ---- Carrito ----
export function obtenerCarrito(): ItemCarrito[] {
  return leer<ItemCarrito[]>(KEYS.CARRITO, []);
}

export function guardarCarrito(carrito: ItemCarrito[]) {
  guardar(KEYS.CARRITO, carrito);
}

export function agregarAlCarrito(productoId: string, cantidad = 1) {
  const carrito = obtenerCarrito();
  const existente = carrito.find(i => i.productoId === productoId);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ productoId, cantidad });
  }
  guardarCarrito(carrito);
}

export function eliminarDelCarrito(productoId: string) {
  guardarCarrito(obtenerCarrito().filter(i => i.productoId !== productoId));
}

export function actualizarCantidadCarrito(productoId: string, cantidad: number) {
  const carrito = obtenerCarrito();
  const item = carrito.find(i => i.productoId === productoId);
  if (item) {
    item.cantidad = Math.max(1, cantidad);
    guardarCarrito(carrito);
  }
}

export function vaciarCarrito() {
  guardar(KEYS.CARRITO, []);
}

// ---- Pedidos ----
export function obtenerPedidos(): Pedido[] {
  return leer<Pedido[]>(KEYS.PEDIDOS, []);
}

export function guardarPedido(pedido: Pedido) {
  const pedidos = obtenerPedidos();
  const idx = pedidos.findIndex(p => p.id === pedido.id);
  if (idx >= 0) {
    pedidos[idx] = pedido;
  } else {
    pedidos.push(pedido);
  }
  guardar(KEYS.PEDIDOS, pedidos);
  agregarActividad('pedido', idx >= 0 ? `Pedido ${pedido.id.slice(0,8)} actualizado a: ${pedido.estado}` : `Nuevo pedido de ${pedido.nombreCliente}`);
}

// ---- Config ----
export function obtenerConfiguracion(): ConfiguracionTienda {
  return leer<ConfiguracionTienda>(KEYS.CONFIG, configInicial);
}

export function guardarConfiguracion(config: ConfiguracionTienda) {
  guardar(KEYS.CONFIG, config);
  agregarActividad('config', 'Configuración actualizada');
}

export function formatearMoneda(valor: number): string {
  const config = obtenerConfiguracion();
  const moneda = config.moneda || 'MXN';
  return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`;
}

// ---- Actividad ----
export function obtenerActividad(): ActividadReciente[] {
  return leer<ActividadReciente[]>(KEYS.ACTIVIDAD, []);
}

function agregarActividad(tipo: ActividadReciente['tipo'], mensaje: string) {
  const actividad = obtenerActividad();
  actividad.unshift({
    id: crypto.randomUUID(),
    tipo,
    mensaje,
    fecha: new Date().toISOString(),
  });
  guardar(KEYS.ACTIVIDAD, actividad.slice(0, 50));
}

// ---- Auth admin ----
const ADMIN_CREDS_DEFAULT = { usuario: 'juliojh26', clave: '1bdb0c1a' };

export function obtenerCredencialesAdmin() {
  return leer<{usuario: string, clave: string}>(KEYS.ADMIN_CREDS, ADMIN_CREDS_DEFAULT);
}

export function cambiarPasswordAdmin(nuevaClave: string) {
  const creds = obtenerCredencialesAdmin();
  guardar(KEYS.ADMIN_CREDS, { ...creds, clave: nuevaClave });
}

export function validarPasswordActual(clave: string) {
  const creds = obtenerCredencialesAdmin();
  return creds.clave === clave;
}

export function loginAdmin(usuario: string, clave: string): boolean {
  const creds = obtenerCredencialesAdmin();
  if (usuario === creds.usuario && clave === creds.clave) {
    guardar(KEYS.ADMIN_AUTH, true);
    return true;
  }
  return false;
}

export function estaAutenticadoAdmin(): boolean {
  return leer<boolean>(KEYS.ADMIN_AUTH, false);
}

export function logoutAdmin() {
  localStorage.removeItem(KEYS.ADMIN_AUTH);
}
