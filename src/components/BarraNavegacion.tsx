import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  totalItems: number;
  onAbrirCarrito: () => void;
}

const enlaces = [
  { label: 'Tienda', ruta: '/' },
  { label: 'Contacto', ruta: '/contacto' },
];

export function BarraNavegacion({ totalItems, onAbrirCarrito }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Baby className="h-7 w-7" />
          <span>BabyGoo</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {enlaces.map(e => (
            <Link
              key={e.ruta}
              to={e.ruta}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === e.ruta ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {e.label}
            </Link>
          ))}
        </div>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" onClick={onAbrirCarrito}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuAbierto && (
        <div className="md:hidden border-t bg-card px-4 py-3 space-y-2">
          {enlaces.map(e => (
            <Link
              key={e.ruta}
              to={e.ruta}
              className="block py-2 text-sm font-medium hover:text-primary"
              onClick={() => setMenuAbierto(false)}
            >
              {e.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
