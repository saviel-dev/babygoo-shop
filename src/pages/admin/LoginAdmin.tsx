import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Baby, Lock } from 'lucide-react';
import { loginAdmin } from '@/store';
import { useToast } from '@/hooks/use-toast';

export default function PaginaLoginAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(usuario, clave)) {
      navigate('/admin/inicio');
    } else {
      toast({ title: 'Error', description: 'Credenciales incorrectas', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10 w-fit">
            <Baby className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>BabyGoo Admin</CardTitle>
          <CardDescription>Ingresa tus credenciales</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={entrar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input id="usuario" value={usuario} onChange={e => setUsuario(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clave">Contraseña</Label>
              <Input id="clave" type="password" value={clave} onChange={e => setClave(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Lock className="h-4 w-4" /> Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
