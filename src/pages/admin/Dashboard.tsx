import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { obtenerProductos, obtenerPedidos, obtenerActividad } from '@/store';

export default function PaginaDashboard() {
  const navigate = useNavigate();
  const productos = obtenerProductos();
  const pedidos = obtenerPedidos();
  const actividad = obtenerActividad().slice(0, 8);

  const stats = [
    { label: 'Total Productos', valor: productos.length, icono: Package, color: 'text-primary' },
    { label: 'Pedidos Pendientes', valor: pedidos.filter(p => p.estado === 'Pendiente').length, icono: ShoppingBag, color: 'text-accent' },
    { label: 'Pedidos Entregados', valor: pedidos.filter(p => p.estado === 'Entregado').length, icono: TrendingUp, color: 'text-secondary' },
    { label: 'Sin Stock', valor: productos.filter(p => p.stock === 0).length, icono: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-2 rounded-lg bg-muted">
                <s.icono className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.valor}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
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
              <div className="space-y-3">
                {actividad.map(a => (
                  <div key={a.id} className="flex justify-between items-start text-sm">
                    <span>{a.mensaje}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(a.fecha).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
