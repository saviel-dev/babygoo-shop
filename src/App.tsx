import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ClienteLayout } from "@/layouts/ClienteLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import PaginaTienda from "@/pages/Tienda";
import PaginaContacto from "@/pages/Contacto";
import PaginaLoginAdmin from "@/pages/admin/LoginAdmin";
import PaginaDashboard from "@/pages/admin/Dashboard";
import PaginaInventario from "@/pages/admin/Inventario";
import PaginaPedidos from "@/pages/admin/Pedidos";
import PaginaAjustes from "@/pages/admin/Ajustes";
import PaginaPOS from "@/pages/admin/POS";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<ClienteLayout />}>
            <Route path="/" element={<PaginaTienda />} />
            <Route path="/contacto" element={<PaginaContacto />} />
          </Route>

          {/* Login admin */}
          <Route path="/admin" element={<PaginaLoginAdmin />} />

          {/* Panel admin protegido */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/inicio" element={<PaginaDashboard />} />
            <Route path="/admin/inventario" element={<PaginaInventario />} />
            <Route path="/admin/pedidos" element={<PaginaPedidos />} />
            <Route path="/admin/pos" element={<PaginaPOS />} />
            <Route path="/admin/ajustes" element={<PaginaAjustes />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
