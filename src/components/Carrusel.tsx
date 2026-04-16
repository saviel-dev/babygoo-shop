import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { obtenerBanners } from '@/store';
import { Banner } from '@/types';

export function Carrusel() {
  const [actual, setActual] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    setBanners(obtenerBanners());
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const intervalo = setInterval(() => setActual(prev => (prev + 1) % banners.length), 5000);
    return () => clearInterval(intervalo);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl mx-4 my-6">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${actual * 100}%)` }}
      >
        {banners.map(banner => (
          <div
            key={banner.id}
            className={`w-full shrink-0 bg-gradient-to-r ${banner.color} text-white py-16 sm:py-24 px-8 sm:px-16 flex flex-col items-center justify-center text-center`}
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-2">{banner.titulo}</h2>
            <p className="text-sm sm:text-lg opacity-90">{banner.subtitulo}</p>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white"
        onClick={() => setActual(prev => (prev - 1 + banners.length) % banners.length)}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white"
        onClick={() => setActual(prev => (prev + 1) % banners.length)}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`h-2 rounded-full transition-all ${i === actual ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
            onClick={() => setActual(i)}
          />
        ))}
      </div>
    </div>
  );
}
