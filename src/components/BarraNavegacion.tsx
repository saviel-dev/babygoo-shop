import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
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
  const [animating, setAnimating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (totalItems > 0) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/images/babygoo.png" alt="BabyGoo" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {enlaces.map(e => (
            <Link
              key={e.ruta}
              to={e.ruta}
              className={cn(
                'text-sm font-semibold transition-colors hover:text-white',
                location.pathname === e.ruta ? 'text-white underline underline-offset-4' : 'text-white/80'
              )}
            >
              {e.label}
            </Link>
          ))}
        </div>

        {/* Cart + Mobile toggle */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="group hover:bg-white hover:text-primary rounded-full flex items-center gap-2.5 px-3 sm:px-5 transition-colors text-white" 
            onClick={onAbrirCarrito}
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className={cn("h-5 w-5 transition-all duration-300 group-hover:text-primary", animating ? "scale-125 text-white" : "text-white")} />
              {totalItems > 0 && (
                <span className={cn(
                  "absolute -top-2.5 -right-3 text-[10px] font-bold text-white rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.1)] border-2 border-primary",
                  animating ? "bg-accent scale-125" : "bg-accent scale-100"
                )}>
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-semibold text-sm">Carrito</span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuAbierto && (
        <div className="md:hidden bg-primary/95 px-4 py-3 space-y-2 border-t border-white/10">
          {enlaces.map(e => (
            <Link
              key={e.ruta}
              to={e.ruta}
              className="block py-2 text-sm font-semibold text-white/90 hover:text-white"
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
