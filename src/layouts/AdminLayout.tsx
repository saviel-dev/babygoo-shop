import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { estaAutenticadoAdmin, logoutAdmin } from '@/store';
import { Home, Package, ShoppingBag, Settings, LogOut, Baby } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const enlaces = [
  { titulo: 'Inicio', ruta: '/admin/inicio', icono: Home },
  { titulo: 'Inventario', ruta: '/admin/inventario', icono: Package },
  { titulo: 'Pedidos', ruta: '/admin/pedidos', icono: ShoppingBag },
  { titulo: 'Ajustes', ruta: '/admin/ajustes', icono: Settings },
];

function AdminSidebarContent() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const cerrarSesion = () => {
    logoutAdmin();
    window.location.href = '/admin';
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <div className="p-4 flex items-center gap-2 border-b">
        <Baby className="h-6 w-6 text-sidebar-primary" />
        {!collapsed && <span className="font-bold text-sidebar-foreground">BabyGoo</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enlaces.map(e => (
                <SidebarMenuItem key={e.ruta}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={e.ruta}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <e.icono className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{e.titulo}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="p-3 border-t">
        <Button variant="ghost" size={collapsed ? 'icon' : 'default'} className="w-full justify-start gap-2 text-sidebar-foreground" onClick={cerrarSesion}>
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Cerrar sesión'}
        </Button>
      </div>
    </Sidebar>
  );
}

export function AdminLayout() {
  if (!estaAutenticadoAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebarContent />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b px-4 bg-card">
            <SidebarTrigger />
            <span className="ml-3 text-sm font-medium text-muted-foreground">Panel de Administración</span>
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-muted/20">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
