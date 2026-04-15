

# BabyGoo - Plan Refinado

## Refinamientos aplicados

1. **Contacto** → Ruta real `/contacto` en el router, no sección dentro de la página principal.

2. **Estados de pedido** → Se unifican a los del documento: **Pendiente, En proceso, Cancelado, Entregado**. Se ignora "Completado/Rechazado" del App.tsx de referencia.

3. **Supabase realtime** → Solo se dejan interfaces/tipos preparados en `src/api/`. No se implementa ni se importa en el prototipo. Es capa opcional futura.

4. **Comprobante de pago** → Se guarda como **string base64** en localStorage (con el pedido). Límite visual de 5MB en el input file. Al migrar a Supabase se subirá a Storage y se guardará la URL.

5. **Disponible = false** → **Oculto total** en la tienda. No aparece en búsqueda ni en filtros. Solo visible en el panel admin.

## Alcance de implementación

### Archivos raíz
- `env.example` — variables Supabase (URL, ANON_KEY)
- `schema.sql` — tablas: productos, pedidos, detalle_pedidos, configuracion

### Estructura src/
```text
src/
├── api/            # Interfaces y templates Supabase (sin lógica activa)
├── components/     # TopBar, Navbar, WhatsAppButton, ProductCard, CartSidebar, etc.
├── hooks/          # useCarrito, useProductos, usePedidos, useConfiguracion
├── layouts/        # ClienteLayout, AdminLayout
├── modules/
│   ├── auth/       # LoginAdmin (localStorage)
│   ├── productos/  # Lógica y componentes de productos
│   ├── carrito/    # Carrito + CheckoutModal
│   ├── pedidos/    # Gestión pedidos admin
│   └── admin/      # Dashboard, Inventario, Ajustes
├── pages/          # Tienda, Contacto, Carrito, Admin/*, NotFound
├── store/          # Estado global con localStorage
└── types/          # Producto, Pedido, DetallePedido, Configuracion
```

### Rutas
| Ruta | Página |
|------|--------|
| `/` | Tienda (principal) |
| `/contacto` | Contacto |
| `/carrito` | Carrito (también accesible como sidebar) |
| `/admin` | Login admin |
| `/admin/inicio` | Dashboard |
| `/admin/inventario` | Gestión productos |
| `/admin/pedidos` | Gestión pedidos |
| `/admin/ajustes` | Configuración |

### Paleta CSS (variables HSL)
- Primary: morado (#7C3AED)
- Secondary: azul (#3B82F6)
- Accent: naranja (#F97316)
- Fondos claros, admin más sobrio

### Productos mock
- 8-10 productos de ropa bebé con tallas (RN a 24M), categorías (Niño, Niña, Unisex, Accesorios)
- 3 banners carrusel

### Cliente
- TopBar + Navbar + Carrusel + Búsqueda + Filtros + Toggle grid/lista
- Cards: imagen, título, descripción, precio MXN
- Carrito sidebar + CheckoutModal (nombre, correo opcional, teléfono +52, comprobante base64, resumen)
- WhatsApp flotante → `https://wa.me/5841228655550`

### Admin
- Login simple (credenciales en localStorage)
- Dashboard: cards estadísticas + actividad reciente + accesos rápidos
- Inventario: tabla + modal crear/editar (campos 2x2), búsqueda, filtros categoría/talla
- Pedidos: tabla + acciones cambio estado (Pendiente → En proceso → Entregado / Cancelado)
- Ajustes: nombre tienda, teléfono, correo

### Responsive
- Desktop: grid 4 cols, sidebar admin visible
- Tablet: 2-3 cols, sidebar colapsable
- Móvil: 1 col, menú hamburguesa

## Detalle técnico
- Todo en TypeScript, código en español
- localStorage como almacenamiento (preparado para Supabase)
- Validación precio ≥ 0, stock ≥ 0
- Producto con `disponible: false` → oculto total en tienda

