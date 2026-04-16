import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { estaAutenticadoAdmin, logoutAdmin } from '@/store';
import { Home, Package, ShoppingBag, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const enlaces = [
  { titulo: 'Inicio',       ruta: '/admin/inicio',     icono: Home },
  { titulo: 'Productos',    ruta: '/admin/inventario',  icono: Package },
  { titulo: 'Pedidos',      ruta: '/admin/pedidos',     icono: ShoppingBag },
  { titulo: 'Punto de Venta', ruta: '/admin/pos',       icono: ShoppingCart },
  { titulo: 'Configuración',ruta: '/admin/ajustes',    icono: Settings },
];

/** Sidebar fijo con el diseño de la imagen */
function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  const cerrarSesion = () => {
    logoutAdmin();
    window.location.href = '/admin';
  };

  return (
    <aside
      style={{ background: '#12102A' }}
      className="flex flex-col h-full w-56 min-w-[14rem] select-none"
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/images/babygoo.png" 
              alt="BabyGoo Logo" 
              className="h-10 w-auto object-contain" 
            />
            <div className="flex flex-col">
              <span 
                style={{ color: '#FF6B2C' }} 
                className="font-black text-sm tracking-tighter leading-none whitespace-nowrap"
              >
                BabyGoo!
              </span>
              <span 
                style={{ color: '#9E9BB8', fontSize: '0.55rem', letterSpacing: '0.15em' }} 
                className="font-black mt-0.5"
              >
                PANEL ADMIN
              </span>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#2D2950', marginBottom: '0.5rem' }} />

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {enlaces.map(e => {
          const activo = location.pathname.startsWith(e.ruta);
          return (
            <Link
              key={e.ruta}
              to={e.ruta}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 8,
                fontWeight: activo ? 700 : 400,
                fontSize: '0.92rem',
                transition: 'background 0.15s, color 0.15s',
                background: activo ? '#6C40F7' : 'transparent',
                color: activo ? '#FFFFFF' : '#C4C0DC',
                textDecoration: 'none',
              }}
              onMouseEnter={e2 => {
                if (!activo) (e2.currentTarget as HTMLElement).style.background = '#1E1A3A';
              }}
              onMouseLeave={e2 => {
                if (!activo) (e2.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <e.icono
                style={{
                  width: 18,
                  height: 18,
                  color: activo ? '#FFFFFF' : '#9E9BB8',
                  flexShrink: 0,
                }}
              />
              <span>{e.titulo}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — Salir */}
      <div style={{ padding: '1rem 0.75rem 1.5rem' }}>
        <div style={{ height: 1, background: '#2D2950', marginBottom: '1rem' }} />
        <button
          onClick={cerrarSesion}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.55rem 0.85rem',
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#FF4D4D',
            fontSize: '0.92rem',
            fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#2D1A1A')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!estaAutenticadoAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex flex-col" style={{ minHeight: '100vh' }}>
        <AdminSidebar />
      </div>

      {/* Overlay + Sidebar móvil */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 flex flex-col h-full">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Área de contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center px-4 gap-3 shrink-0 h-12"
          style={{ background: '#12102A' }}
        >
          {/* Botón hamburguesa móvil */}
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-white/90 tracking-wide">
            Panel de Administración
          </span>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
