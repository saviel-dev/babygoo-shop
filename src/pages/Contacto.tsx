import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { obtenerConfiguracion } from '@/store';
import { useToast } from '@/hooks/use-toast';

export default function PaginaContacto() {
  const config = obtenerConfiguracion();
  const { toast } = useToast();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: '¡Mensaje enviado!', description: 'Te responderemos pronto.' });
    setNombre(''); setCorreo(''); setMensaje('');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Contacto</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Envíanos un mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-nombre">Nombre</Label>
                <Input id="c-nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-correo">Correo</Label>
                <Input id="c-correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-mensaje">Mensaje</Label>
                <Textarea id="c-mensaje" value={mensaje} onChange={e => setMensaje(e.target.value)} rows={4} required />
              </div>
              <Button type="submit" className="w-full">Enviar</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">{config.telefono}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Correo</p>
                <p className="text-sm text-muted-foreground">{config.correo}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">Ciudad de México, México</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
