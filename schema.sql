-- ============================================================
-- BabyGoo - Esquema de base de datos
-- ============================================================

-- Enum de tallas
CREATE TYPE talla_bebe AS ENUM ('RN', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '24M');

-- Enum de categorías
CREATE TYPE categoria_producto AS ENUM ('Niño', 'Niña', 'Unisex', 'Accesorios');

-- Enum de estados de pedido
CREATE TYPE estado_pedido AS ENUM ('Pendiente', 'En proceso', 'Cancelado', 'Entregado');

-- Tabla de productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
  talla talla_bebe NOT NULL,
  categoria categoria_producto NOT NULL,
  imagen TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  disponible BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_cliente TEXT NOT NULL,
  correo TEXT,
  telefono TEXT NOT NULL,
  comprobante_url TEXT,
  total NUMERIC(10,2) NOT NULL,
  estado estado_pedido NOT NULL DEFAULT 'Pendiente',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de detalle de pedidos
CREATE TABLE detalle_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL
);

-- Tabla de configuración
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_tienda TEXT NOT NULL DEFAULT 'BabyGoo',
  telefono TEXT DEFAULT '',
  correo TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  mensaje_bienvenida TEXT DEFAULT ''
);

-- RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura para productos disponibles
CREATE POLICY "Productos disponibles visibles" ON productos
  FOR SELECT USING (disponible = true AND stock > 0);

-- Políticas de inserción pública para pedidos
CREATE POLICY "Clientes pueden crear pedidos" ON pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Clientes pueden crear detalles" ON detalle_pedidos
  FOR INSERT WITH CHECK (true);

-- Bucket de storage para comprobantes
INSERT INTO storage.buckets (id, name, public) VALUES ('comprobantes', 'comprobantes', false);
