import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { obtenerConfiguracion, guardarConfiguracion } from '@/store';
import { useToast } from '@/hooks/use-toast';

export default function PaginaAjustes() {
  const { toast } = useToast();
  const [config, setConfig] = useState(obtenerConfiguracion());

  const guardar = () => {
    guardarConfiguracion(config);
    toast({ title: 'Configuración guardada' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la tienda</Label>
              <Input value={config.nombreTienda} onChange={e => setConfig({ ...config, nombreTienda: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={config.telefono} onChange={e => setConfig({ ...config, telefono: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input value={config.correo} onChange={e => setConfig({ ...config, correo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp URL</Label>
              <Input value={config.whatsapp} onChange={e => setConfig({ ...config, whatsapp: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Mensaje de bienvenida</Label>
              <Input value={config.mensajeBienvenida} onChange={e => setConfig({ ...config, mensajeBienvenida: e.target.value })} />
            </div>
          </div>
          <Button onClick={guardar}>Guardar Cambios</Button>
        </CardContent>
      </Card>
    </div>
  );
}
