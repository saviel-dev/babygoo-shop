import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BarraSuperior } from '@/components/BarraSuperior';
import { BarraNavegacion } from '@/components/BarraNavegacion';
import { BotonWhatsApp } from '@/components/BotonWhatsApp';
import { CarritoSidebar } from '@/components/CarritoSidebar';
import { CheckoutModal } from '@/components/CheckoutModal';
import { useCarrito } from '@/hooks/useCarrito';


export function ClienteLayout() {
  const carrito = useCarrito();
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  const abrirCheckout = () => {
    setCarritoAbierto(false);
    setCheckoutAbierto(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <BarraSuperior />
      <BarraNavegacion totalItems={carrito.totalItems} onAbrirCarrito={() => setCarritoAbierto(true)} />
      <main className="flex-1">
        <Outlet context={carrito} />
      </main>
      
      <div className="w-full relative mt-24">
        {/* Curva decorativa tipo ola */}
        <svg 
          className="absolute bottom-full w-full h-[50px] md:h-[80px] text-slate-950 pointer-events-none" 
          preserveAspectRatio="none" 
          viewBox="0 0 1440 100" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,50 C300,120 400,-20 720,30 C1040,80 1140,-10 1440,40 L1440,100 L0,100 Z" opacity="0.5" />
          <path d="M0,60 C320,100 420,-10 720,40 C1020,90 1120,-30 1440,50 L1440,100 L0,100 Z" />
        </svg>

        <footer className="bg-slate-950 pt-10 pb-6">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-1 border border-slate-700/50 rounded-full bg-white/10 flex items-center justify-center">
                  <img src="/images/babygoo.png" alt="BabyGoo" className="h-10 w-auto object-contain" />
                </div>
                <p className="text-slate-400 text-sm max-w-xs text-center sm:text-left">
                  Transformando el vestuario de los más pequeños con ternura y estilo.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Inicio</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Tienda</Link>
                <Link to="/contacto" className="text-slate-400 hover:text-white transition-colors font-medium">Contacto</Link>
              </div>
            </div>

            {/* Copyright y Políticas */}
            <div className="pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
              <p className="mb-3 md:mb-0 text-center">© {new Date().getFullYear()} BabyGoo - Servicios. Todos los derechos reservados.</p>
              <div className="flex gap-4 sm:gap-6">
                <Link to="/" className="hover:text-slate-400 transition-colors">Política de Privacidad</Link>
                <Link to="/" className="hover:text-slate-400 transition-colors">Términos de Servicio</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <CarritoSidebar
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        items={carrito.items}
        totalPrecio={carrito.totalPrecio}
        onActualizar={carrito.actualizar}
        onEliminar={carrito.eliminar}
        onCheckout={abrirCheckout}
      />
      <CheckoutModal
        abierto={checkoutAbierto}
        onCerrar={() => setCheckoutAbierto(false)}
        items={carrito.items}
        totalPrecio={carrito.totalPrecio}
        onPedidoCreado={carrito.vaciar}
      />
      <BotonWhatsApp />
    </div>
  );
}
