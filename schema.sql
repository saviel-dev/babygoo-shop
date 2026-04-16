-- ============================================================
-- BabyGoo Shop — Esquema completo para Supabase
-- Actualizado para coincidir con la estructura actual de la app
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. EXTENSIONES
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────
-- 2. ENUMS
-- ─────────────────────────────────────────────
CREATE TYPE estado_pedido AS ENUM (
  'Pendiente',
  'En proceso',
  'Cancelado',
  'Entregado'
);

CREATE TYPE talla_producto AS ENUM (
  'RN', '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '24M'
);

CREATE TYPE tipo_actividad AS ENUM (
  'pedido',
  'producto',
  'config'
);


-- ─────────────────────────────────────────────
-- 3. TABLA: categorias
--    Gestión dinámica desde Ajustes del panel admin
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre  TEXT NOT NULL UNIQUE,
  orden   INT  NOT NULL DEFAULT 0
);

-- Categorías por defecto
INSERT INTO categorias (nombre, orden) VALUES
  ('Niño',       1),
  ('Niña',       2),
  ('Unisex',     3),
  ('Accesorios', 4)
ON CONFLICT (nombre) DO NOTHING;


-- ─────────────────────────────────────────────
-- 3b. TABLA: banners
--     Carrusel de la página principal. Máximo 3 activos.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id        UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo    TEXT  NOT NULL,
  subtitulo TEXT  NOT NULL DEFAULT '',
  color     TEXT  NOT NULL DEFAULT 'from-primary/90 to-secondary/80',
  orden     INT   NOT NULL DEFAULT 0
);

-- Trigger: impedir más de 3 banners
CREATE OR REPLACE FUNCTION check_max_banners()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM banners) >= 3 THEN
    RAISE EXCEPTION 'Solo se permiten hasta 3 banners activos.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_max_banners ON banners;
CREATE TRIGGER trg_max_banners
  BEFORE INSERT ON banners
  FOR EACH ROW EXECUTE FUNCTION check_max_banners();

-- Banners por defecto
INSERT INTO banners (titulo, subtitulo, color, orden) VALUES
  ('¡Nueva Colección Primavera!', 'Hasta 30% de descuento en mamelucos y conjuntos', 'from-primary/90 to-secondary/80', 1),
  ('Recién Nacidos',              'La ropa más suave para los más pequeños',           'from-secondary/90 to-primary/80', 2),
  ('Envío Gratis',                'En compras mayores a $999 MXN',                      'from-accent/90 to-primary/80',    3)
ON CONFLICT DO NOTHING;



-- ─────────────────────────────────────────────
-- 4. TABLA: productos
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT            NOT NULL,
  descripcion TEXT            NOT NULL DEFAULT '',
  precio      NUMERIC(10,2)   NOT NULL CHECK (precio >= 0),
  talla       talla_producto  NOT NULL,
  categoria   TEXT            NOT NULL REFERENCES categorias(nombre) ON UPDATE CASCADE ON DELETE RESTRICT,
  imagen      TEXT            NOT NULL DEFAULT '',
  stock       INT             NOT NULL DEFAULT 0 CHECK (stock >= 0),
  disponible  BOOLEAN         NOT NULL DEFAULT TRUE,
  creado_en   TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria  ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_disponible ON productos(disponible);
CREATE INDEX IF NOT EXISTS idx_productos_creado_en  ON productos(creado_en DESC);


-- ─────────────────────────────────────────────
-- 5. TABLA: pedidos
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_cliente  TEXT            NOT NULL,
  correo          TEXT,
  telefono        TEXT            NOT NULL DEFAULT '',
  comprobante     TEXT,           -- base64 o URL del comprobante de pago
  total           NUMERIC(10,2)   NOT NULL CHECK (total >= 0),
  estado          estado_pedido   NOT NULL DEFAULT 'Pendiente',
  creado_en       TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado    ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_creado_en ON pedidos(creado_en DESC);


-- ─────────────────────────────────────────────
-- 6. TABLA: detalle_pedidos
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id        UUID          NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id      UUID          REFERENCES productos(id) ON DELETE SET NULL,
  nombre_producto  TEXT          NOT NULL,    -- snapshot del nombre al momento de la venta
  cantidad         INT           NOT NULL CHECK (cantidad > 0),
  precio_unitario  NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0)
);

CREATE INDEX IF NOT EXISTS idx_detalle_pedido_id ON detalle_pedidos(pedido_id);


-- ─────────────────────────────────────────────
-- 7. TABLA: configuracion_tienda  (singleton — solo 1 fila)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS configuracion_tienda (
  id                 INT  PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre_tienda      TEXT NOT NULL DEFAULT 'BabyGoo',
  telefono           TEXT NOT NULL DEFAULT '',
  correo             TEXT NOT NULL DEFAULT '',
  whatsapp           TEXT NOT NULL DEFAULT '',
  mensaje_bienvenida TEXT NOT NULL DEFAULT '',
  moneda             TEXT NOT NULL DEFAULT 'MXN'
);

-- Fila inicial
INSERT INTO configuracion_tienda
  (id, nombre_tienda, telefono, correo, whatsapp, mensaje_bienvenida, moneda)
VALUES (
  1,
  'BabyGoo',
  '+52 55 1234 5678',
  'contacto@babygoo.mx',
  'https://wa.me/5841228655550',
  '¡Bienvenidos a BabyGoo! Ropa de bebé con amor.',
  'MXN'
)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- 7b. TABLA: admin_credenciales  (singleton — solo 1 fila)
--     Almacena usuario y contraseña del panel admin.
--     IMPORTANTE: en producción usar hash bcrypt, no texto plano.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_credenciales (
  id       INT  PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  usuario  TEXT NOT NULL DEFAULT 'juliojh26',
  clave    TEXT NOT NULL DEFAULT '1bdb0c1a'
);

-- Fila inicial
INSERT INTO admin_credenciales (id, usuario, clave)
VALUES (1, 'juliojh26', '1bdb0c1a')
ON CONFLICT (id) DO NOTHING;



-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actividad_reciente (
  id      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo    tipo_actividad  NOT NULL,
  mensaje TEXT            NOT NULL,
  fecha   TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON actividad_reciente(fecha DESC);

-- Trigger: mantiene solo las últimas 50 entradas
CREATE OR REPLACE FUNCTION limpiar_actividad()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM actividad_reciente
  WHERE id NOT IN (
    SELECT id FROM actividad_reciente
    ORDER BY fecha DESC
    LIMIT 50
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_limpiar_actividad ON actividad_reciente;
CREATE TRIGGER trg_limpiar_actividad
AFTER INSERT ON actividad_reciente
FOR EACH STATEMENT EXECUTE FUNCTION limpiar_actividad();


-- ─────────────────────────────────────────────
-- 9. STORAGE BUCKET: comprobantes de pago
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- 10. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE categorias           ENABLE ROW LEVEL SECURITY;
 ALTER TABLE banners              ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_credenciales   ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_reciente   ENABLE ROW LEVEL SECURITY;

-- Categorías: público
DROP POLICY IF EXISTS "categorias_select_public" ON categorias;
DROP POLICY IF EXISTS "categorias_all_auth" ON categorias;
CREATE POLICY "categorias_all_public"
  ON categorias FOR ALL USING (true) WITH CHECK (true);

-- Banners: público
DROP POLICY IF EXISTS "banners_select_public" ON banners;
DROP POLICY IF EXISTS "banners_all_auth" ON banners;
CREATE POLICY "banners_all_public"
  ON banners FOR ALL USING (true) WITH CHECK (true);

-- Productos: público
DROP POLICY IF EXISTS "productos_select_public" ON productos;
DROP POLICY IF EXISTS "productos_all_auth" ON productos;
CREATE POLICY "productos_all_public"
  ON productos FOR ALL USING (true) WITH CHECK (true);

-- Pedidos: público
DROP POLICY IF EXISTS "pedidos_insert_public" ON pedidos;
DROP POLICY IF EXISTS "pedidos_all_auth" ON pedidos;
CREATE POLICY "pedidos_all_public"
  ON pedidos FOR ALL USING (true) WITH CHECK (true);

-- Detalle pedidos: público
DROP POLICY IF EXISTS "detalle_insert_public" ON detalle_pedidos;
DROP POLICY IF EXISTS "detalle_all_auth" ON detalle_pedidos;
CREATE POLICY "detalle_all_public"
  ON detalle_pedidos FOR ALL USING (true) WITH CHECK (true);

-- Configuración: público
DROP POLICY IF EXISTS "config_all_auth" ON configuracion_tienda;
CREATE POLICY "config_all_public"
  ON configuracion_tienda FOR ALL USING (true) WITH CHECK (true);

-- Admin credenciales: público
DROP POLICY IF EXISTS "admin_creds_all_auth" ON admin_credenciales;
CREATE POLICY "admin_creds_all_public"
  ON admin_credenciales FOR ALL USING (true) WITH CHECK (true);

-- Actividad: público
DROP POLICY IF EXISTS "actividad_all_auth" ON actividad_reciente;
CREATE POLICY "actividad_all_public"
  ON actividad_reciente FOR ALL USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────
-- 11. VISTA: pedidos con detalles en JSON
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_pedidos_completos AS
SELECT
  p.id,
  p.nombre_cliente,
  p.correo,
  p.telefono,
  p.comprobante,
  p.total,
  p.estado,
  p.creado_en,
  COALESCE(
    json_agg(
      json_build_object(
        'productoId',     d.producto_id,
        'nombreProducto', d.nombre_producto,
        'cantidad',       d.cantidad,
        'precioUnitario', d.precio_unitario
      )
    ) FILTER (WHERE d.id IS NOT NULL),
    '[]'
  ) AS detalles
FROM pedidos p
LEFT JOIN detalle_pedidos d ON d.pedido_id = p.id
GROUP BY p.id;


-- ─────────────────────────────────────────────
-- 12. FUNCIÓN RPC: registrar pedido completo
--     Crea pedido + ítems + descuenta stock en una sola llamada
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION registrar_pedido(
  p_cliente     TEXT,
  p_correo      TEXT,
  p_telefono    TEXT,
  p_comprobante TEXT,
  p_total       NUMERIC,
  p_estado      estado_pedido,
  p_detalles    JSONB          -- [{ "productoId", "nombreProducto", "cantidad", "precioUnitario" }]
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pedido_id UUID;
  detalle     JSONB;
BEGIN
  -- Insertar pedido
  INSERT INTO pedidos (nombre_cliente, correo, telefono, comprobante, total, estado)
  VALUES (p_cliente, p_correo, p_telefono, p_comprobante, p_total, p_estado)
  RETURNING id INTO v_pedido_id;

  -- Insertar ítems y descontar stock
  FOR detalle IN SELECT * FROM jsonb_array_elements(p_detalles)
  LOOP
    INSERT INTO detalle_pedidos
      (pedido_id, producto_id, nombre_producto, cantidad, precio_unitario)
    VALUES (
      v_pedido_id,
      (detalle->>'productoId')::UUID,
       detalle->>'nombreProducto',
      (detalle->>'cantidad')::INT,
      (detalle->>'precioUnitario')::NUMERIC
    );

    -- Descontar stock
    UPDATE productos
    SET stock = GREATEST(0, stock - (detalle->>'cantidad')::INT)
    WHERE id = (detalle->>'productoId')::UUID;
  END LOOP;

  -- Registrar actividad
  INSERT INTO actividad_reciente (tipo, mensaje)
  VALUES ('pedido', 'Nuevo pedido de ' || p_cliente);

  RETURN v_pedido_id;
END;
$$;


-- ─────────────────────────────────────────────
-- 13. FUNCIÓN RPC: descontar_stock
--     Descuenta stock de un producto individualmente
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION descontar_stock(p_producto_id UUID, p_cantidad INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE productos
  SET stock = GREATEST(0, stock - p_cantidad)
  WHERE id = p_producto_id;
END;
$$;

