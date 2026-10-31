import React from 'react';
import { MapPin } from 'lucide-react';
import config from '../data/eventConfig.json';

export default function Location() {
  const { horarioYLugar, direccion, mapaUrl, iframeEmbedUrl } = config.ubicacion;

  return (
    <section className="py-16 px-6 bg-tiana-pearl text-center">
      <div className="max-w-lg mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-tiana-mint/50 flex items-center justify-center text-tiana-dark mb-4">
          <MapPin className="w-6 h-6" />
        </div>

        {/* Horario y Nombre del Lugar (Captura 3) */}
        <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-[0.12em] text-tiana-brown uppercase mb-2">
          {horarioYLugar}
        </h2>
        <p className="text-sm text-tiana-brown/80 mb-6">
          {direccion}
        </p>

        {/* Mapa de Google Maps embebido entre el título y el botón */}
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