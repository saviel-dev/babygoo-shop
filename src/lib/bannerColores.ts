// Mapa de claves de color → estilos CSS reales (inline).
// Necesario porque Tailwind no puede generar clases dinámicas desde strings en base de datos.
// primary  = hsl(263 70% 58%) = #7c3aed aprox (morado)
// secondary = hsl(217 91% 60%) = #3b82f6 aprox (azul)
// accent    = hsl(25 95% 53%)  = #f97316 aprox (naranja)

export interface ColorInfo {
  label: string;
  style: React.CSSProperties;
}

export const BANNER_COLORES: Record<string, ColorInfo> = {
  'from-primary/90 to-secondary/80': {
    label: 'Morado a Azul',
    style: { background: 'linear-gradient(to right, #6d28d9e6, #3b82f6cc)' },
  },
  'from-secondary/90 to-primary/80': {
    label: 'Azul a Morado',
    style: { background: 'linear-gradient(to right, #3b82f6e6, #6d28d9cc)' },
  },
  'from-accent/90 to-primary/80': {
    label: 'Naranja a Morado',
    style: { background: 'linear-gradient(to right, #f97316e6, #6d28d9cc)' },
  },
  'from-primary/90 to-accent/80': {
    label: 'Morado a Naranja',
    style: { background: 'linear-gradient(to right, #6d28d9e6, #f97316cc)' },
  },
  'from-emerald-500 to-teal-400': {
    label: 'Verde Esmeralda',
    style: { background: 'linear-gradient(to right, #10b981, #2dd4bf)' },
  },
  'from-blue-600 to-cyan-400': {
    label: 'Azul Océano',
    style: { background: 'linear-gradient(to right, #2563eb, #22d3ee)' },
  },
  'from-rose-500 to-pink-400': {
    label: 'Rosa Neón',
    style: { background: 'linear-gradient(to right, #f43f5e, #f472b6)' },
  },
  'bg-slate-800': {
    label: 'Gris Oscuro Sólido',
    style: { background: '#1e293b' },
  },
};

// Fallback para colores no reconocidos
export const getFondoBanner = (colorKey: string): React.CSSProperties =>
  BANNER_COLORES[colorKey]?.style ?? { background: 'linear-gradient(to right, #6d28d9, #3b82f6)' };
