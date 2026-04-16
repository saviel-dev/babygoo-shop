import { Mail, Phone } from 'lucide-react';
import { obtenerConfiguracion } from '@/store';

export function BarraSuperior() {
  const config = obtenerConfiguracion();
  return (
    <div className="bg-white text-primary text-xs py-2 font-medium">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> {config.telefono}
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <Mail className="h-3 w-3" /> {config.correo}
          </span>
        </div>
        <span className="hidden md:block">Envíos a todo México 🇲🇽</span>
      </div>
    </div>
  );
}
