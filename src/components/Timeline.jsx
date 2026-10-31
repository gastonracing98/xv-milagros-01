import React from 'react';
import { Sparkles, Crown, Utensils, Music, Disc, Star } from 'lucide-react';
import config from '../data/eventConfig.json';

const iconMap = {
  sparkles: Sparkles,
  crown: Crown,
  utensils: Utensils,
  music: Music,
  disc: Disc,
  star: Star,
};

export default function Timeline() {
  const items = config.cronograma;

  return (
    <section className="py-16 px-6 bg-tiana-dark text-tiana-pearl">
      <div className="max-w-md mx-auto">
        <h2 className="text-center font-serif text-2xl md:text-3xl tracking-[0.2em] uppercase text-tiana-cream mb-12">
          Cronograma
        </h2>

        <div className="relative">
          {/* Línea vertical continua */}
          <div className="absolute left-8 top-4 bottom-4 w-[1.5px] bg-tiana-gold/50 -translate-x-1/2" />

          <div className="space-y-10">
            {items.map((item, index) => {
              const IconComponent = iconMap[item.icono] || Sparkles;
              return (
                <div key={index} className="relative flex items-start gap-6">
                  {/* Círculo del ícono */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-tiana-cream text-tiana-brown flex items-center justify-center shrink-0 shadow-md border-2 border-tiana-gold">
                    <IconComponent className="w-7 h-7 stroke-[1.5]" />
                  </div>

                  {/* Punto dorado intermedio en la línea */}
                  {index < items.length - 1 && (
                    <div className="absolute left-8 -bottom-6 w-2.5 h-2.5 rounded-full bg-tiana-gold -translate-x-1/2 z-10" />
                  )}

                  {/* Texto del evento */}
                  <div className="pt-1">
                    <span className="block text-xs font-bold tracking-[0.15em] text-tiana-gold uppercase">
                      {item.hora}
                    </span>
                    <h3 className="text-lg font-serif font-semibold tracking-[0.1em] text-tiana-pearl uppercase mt-0.5">
                      {item.titulo}
                    </h3>
                    <p className="text-xs md:text-sm text-tiana-cream/80 mt-1 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}