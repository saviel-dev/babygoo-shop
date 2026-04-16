import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '@/hooks/useProductos';
import { usePedidos } from '@/hooks/usePedidos';
import { useActividad } from '@/hooks/useActividad';
import { Loader2 } from 'lucide-react';

export default function PaginaDashboard() {
  const navigate = useNavigate();
  const { productos, cargando: c1 } = useProductos();
  const { pedidos, cargando: c2 } = usePedidos();
  const { actividad, cargando: c3 } = useActividad();

  if (c1 || c2 || c3) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }


  const stats = [
    { label: 'Total Productos', valor: productos.length, icono: Package, color: 'bg-primary' },
    { label: 'Pedidos Pendientes', valor: pedidos.filter(p => p.estado === 'Pendiente').length, icono: ShoppingBag, color: 'bg-accent' },
    { label: 'Pedidos Entregados', valor: pedidos.filter(p => p.estado === 'Entregado').length, icono: TrendingUp, color: 'bg-secondary' },
    { label: 'Sin Stock', valor: productos.filter(p => p.stock === 0).length, icono: AlertTriangle, color: 'bg-destructive' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className={`${s.color} border-none shadow-md overflow-hidden text-white`}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-sm flex items-center justify-center">
                <s.icono className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold">{s.valor}</span>
                <span className="text-xs font-medium text-white/80 uppercase tracking-wider">{s.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accesos rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/admin/inventario')}>Gestionar Inventario</Button>
            <Button variant="outline" onClick={() => navigate('/admin/pedidos')}>Ver Pedidos</Button>
            <Button variant="outline" onClick={() => navigate('/admin/ajustes')}>Configuración</Button>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {actividad.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
            ) : (
              <ul className="space-y-3 list-disc pl-5 marker:text-slate-400">
                {actividad.map(a => (
                  <li key={a.id} className="text-sm pl-1">
                    <div className="flex justify-between items-start">
                      <span>{a.mensaje}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(a.fecha).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
