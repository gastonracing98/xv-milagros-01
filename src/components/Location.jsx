import React from 'react';
import { MapPin } from 'lucide-react';
import config from '../data/eventConfig.json';
import FloralDecor from './FloralDecor';

export default function Location() {
  const { horarioYLugar, direccion, mapaUrl, iframeEmbedUrl } = config.ubicacion;

  return (
    <section className="relative py-16 px-6 bg-tiana-pearl text-center">
      {/* Flor posicionada exactamente sobre la línea divisoria superior (NO empuja al contenido) */}
      {/* Si la querés por encima de todo dejá z-20; si la querés por detrás del ícono poné z-0 */}
      <FloralDecor
        variant="divider"
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      />

      <div className="max-w-lg mx-auto flex flex-col items-center relative z-10 pt-4">
        <div className="w-12 h-12 rounded-full bg-tiana-mint/50 flex items-center justify-center text-tiana-dark mb-4 shadow-sm">
          <MapPin className="w-6 h-6" />
        </div>

        {/* Horario y Nombre del Lugar */}
        <h2 className="text-1xl md:text-2xl font-serif font-semibold tracking-[0.05em] text-tiana-brown mb-2">
          {horarioYLugar}
        </h2>
        <p className="text-sm text-tiana-brown/80 mb-6">
          {direccion}
        </p>

        {/* Mapa de Google Maps embebido */}
        <div className="w-full h-64 md:h-72 rounded-2xl overflow-hidden shadow-md border border-tiana-beige mb-8">
          <iframe
            title="Ubicación del Evento"
            src={iframeEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Botón CÓMO LLEGAR */}
        <a
          href={mapaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full max-w-xs py-3.5 px-8 rounded-full bg-tiana-primary hover:bg-tiana-dark text-tiana-pearl font-semibold tracking-[0.2em] uppercase text-sm shadow-md transition-colors"
        >
          CÓMO LLEGAR
        </a>
      </div>
    </section>
  );
}