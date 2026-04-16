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

        <footer className="bg-slate-950 pt-16 pb-8">
          <div className="container mx-auto px-6">
            {/* Cabecera y Redes Sociales */}
            <div className="flex flex-col items-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <div className="p-1 border border-slate-700/50 rounded-full bg-white/10 shadow-sm flex items-center justify-center">
                  <img src="/images/babygoo.png" alt="BabyGoo" className="h-14 w-auto object-contain" />
                </div>
              </div>
              <p className="text-slate-400 text-sm max-w-sm text-center">Transformando el vestuario de los más pequeños con ternura, estilo y calidad excepcional.</p>
            </div>

            {/* Columnas de Navegación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-8 max-w-4xl mx-auto text-sm text-center sm:text-left mb-16">
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-slate-200">Navegación</h4>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Inicio</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Tienda</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Categorías</Link>
                <Link to="/contacto" className="text-slate-400 hover:text-white transition-colors">Contacto</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-slate-200">Compañía</h4>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Acerca de</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Blog</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Nuestros Valores</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Alianzas</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-slate-200">Soporte</h4>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Centro de ayuda</Link>
                <Link to="/contacto" className="text-slate-400 hover:text-white transition-colors">Contacto</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Privacidad</Link>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">Términos</Link>
              </div>
            </div>

            {/* Copyright y Políticas */}
            <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
              <p className="mb-4 md:mb-0">© {new Date().getFullYear()} BabyGoo - Servicios. Todos los derechos reservados.</p>
              <div className="flex gap-6">
                <Link to="/" className="hover:text-slate-300 transition-colors">Política de Privacidad</Link>
                <Link to="/" className="hover:text-slate-300 transition-colors">Términos de Servicio</Link>
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
