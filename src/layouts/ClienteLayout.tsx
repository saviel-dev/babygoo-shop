import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
    <div className="min-h-screen flex flex-col">
      <BarraSuperior />
      <BarraNavegacion totalItems={carrito.totalItems} onAbrirCarrito={() => setCarritoAbierto(true)} />
      <main className="flex-1">
        <Outlet context={carrito} />
      </main>
      <footer className="bg-primary text-primary-foreground py-8 px-4 text-center text-sm mt-8">
        <p className="font-bold text-lg mb-1">BabyGoo 🍼</p>
        <p className="opacity-80">Ropa de bebé con amor · México</p>
        <p className="opacity-60 mt-2">© {new Date().getFullYear()} BabyGoo. Todos los derechos reservados.</p>
      </footer>
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
