import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Baby, Eye, EyeOff } from 'lucide-react';
import { loginAdmin } from '@/store';
import Swal from 'sweetalert2';

export default function PaginaLoginAdmin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(usuario, clave)) {
      navigate('/admin/inicio');
    } else {
      Swal.fire({ title: 'Error', text: 'Credenciales incorrectas', icon: 'error', confirmButtonColor: '#7c3aed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-[850px] overflow-hidden min-h-[550px]">

        {/* Left Form Section */}
        <div className="w-full md:w-1/2 p-10 sm:p-14 flex flex-col justify-center relative">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src="/images/babygoo.png" alt="BabyGoo" className="h-12 w-auto object-contain mb-4" />
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Iniciar Sesión</h1>
            <p className="text-xs text-slate-400 font-medium">Ingresa con tus credenciales de administrador</p>
          </div>

          <form onSubmit={entrar} className="space-y-4 max-w-xs mx-auto w-full">
            <div className="relative">
              <input
                id="usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                required
                placeholder="Usuario administador"
                className="w-full px-5 py-3.5 bg-slate-100/80 hover:bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-slate-700"
              />
            </div>
            <div className="relative">
              <input
                id="clave"
                type={mostrarClave ? "text" : "password"}
                value={clave}
                onChange={e => setClave(e.target.value)}
                required
                placeholder="Contraseña"
                className="w-full pl-5 pr-12 py-3.5 bg-slate-100/80 hover:bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-slate-700"
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={mostrarClave ? "Ocultar Contraseña" : "Mostrar Contraseña"}
              >
                {mostrarClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="text-center pt-2">
              <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors mb-4 inline-block">¿Olvidaste tu contraseña?</a>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-full text-xs tracking-[0.2em] shadow-md hover:shadow-lg transition-all active:scale-95 uppercase">
                Iniciar Sesión
              </Button>
            </div>
          </form>
        </div>

        {/* Right Brand Section */}
        <div className="w-full md:w-1/2 bg-primary p-12 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <h2 className="text-4xl font-bold mb-4 z-10">BabyGoo Panel</h2>
          <p className="text-white/80 mb-10 text-sm font-medium max-w-[250px] leading-relaxed z-10">
            Administra tus productos, atiende pedidos y gestiona el inventario de la tienda.
          </p>

          <Button asChild variant="outline" className="z-10 border-2 border-white text-white hover:bg-white hover:text-primary bg-transparent font-bold py-6 px-12 rounded-full text-xs tracking-[0.15em] transition-all active:scale-95 uppercase mt-4">
            <Link to="/">Volver a Tienda</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
