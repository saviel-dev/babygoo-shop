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
} as const;

const configInicial: ConfiguracionTienda = {
  nombreTienda: 'BabyGoo',
  telefono: '+52 55 1234 5678',
  correo: 'contacto@babygoo.mx',
  whatsapp: 'https://wa.me/5841228655550',
  mensajeBienvenida: '¡Bienvenidos a BabyGoo! Ropa de bebé con amor.',
};

// Helpers
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
const ADMIN_CREDS = { usuario: 'admin', clave: 'babygoo2024' };

export function loginAdmin(usuario: string, clave: string): boolean {
  if (usuario === ADMIN_CREDS.usuario && clave === ADMIN_CREDS.clave) {
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
