// ============================================================
// BabyGoo - Tipos principales
// ============================================================

export type Talla = 'RN' | '0-3M' | '3-6M' | '6-9M' | '9-12M' | '12-18M' | '18-24M' | '24M';

export type Categoria = string;

export type EstadoPedido = 'Pendiente' | 'En proceso' | 'Cancelado' | 'Entregado';

export type VistaProducto = 'grid' | 'lista';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  talla: Talla;
  categoria: Categoria;
  imagen: string;
  stock: number;
  disponible: boolean;
  creadoEn: string;
}

export interface ItemCarrito {
  productoId: string;
  cantidad: number;
}

export interface DetallePedido {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: string;
  nombreCliente: string;
  correo?: string;
  telefono: string;
  comprobante?: string; // base64
  detalles: DetallePedido[];
  total: number;
  estado: EstadoPedido;
  creadoEn: string;
}

export interface ConfiguracionTienda {
  nombreTienda: string;
  telefono: string;
  correo: string;
  whatsapp: string;
  mensajeBienvenida: string;
  moneda: string;
}

export interface Banner {
  id: string;
  titulo: string;
  subtitulo: string;
  color: string;
}

export interface ActividadReciente {
  id: string;
  tipo: 'pedido' | 'producto' | 'config' | 'venta' | 'limpieza';
  mensaje: string;
  fecha: string;
}
