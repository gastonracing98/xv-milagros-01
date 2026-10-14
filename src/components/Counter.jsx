import cofing from '../data/eventConfig.json'
import React, { useState, useEffect } from 'react';
import config from '../data/eventConfig.json';

export default function Counter() {
  const targetDateStr = config.quinceanera.fechaEvento;

  // Estado para guardar el tiempo que falta
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
    isOver: false
  });

  useEffect(() => {
    // Convertimos la fecha del JSON (con 'Z' de UTC) a milisegundos absolute epoch
    const targetUTC = new Date(targetDateStr).getTime();

    // Si la fecha en el JSON no es válida, no romper la app
    if (isNaN(targetUTC)) {
      console.error("Error: La fecha de evento no tiene un formato válido. Usá UTC ej: YYYY-MM-DDTHH:mm:ssZ");
      return;
    }

    const calculateTime = () => {
      // Date.now() en JS siempre obtiene la estampa de tiempo UTC universal
      const nowUTC = Date.now();
      const difference = targetUTC - nowUTC;

      if (difference <= 0) {
        setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0, isOver: true });
        return;
      }

      setTimeLeft({
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
        isOver: false
      });
    };

    // Calculamos inmediatamente al montar el componente
    calculateTime();

    // Actualizamos cada 1 segundo
    const intervalId = setInterval(calculateTime, 1000);

    // Limpieza al desmontar
    return () => clearInterval(intervalId);
  }, [targetDateStr]);

  if (timeLeft.isOver) {
    return (
      <div className="text-center py-12 text-primary font-serif text-2xl animate-pulse">
        ¡Llegó el gran día! 🎉
      </div>
    );
  }

  // Estructura de tarjetas del contador (para no repetir código de Tailwind)
  const timeUnits = [
    { label: 'DÍAS', value: timeLeft.dias },
    { label: 'HORAS', value: timeLeft.horas },
    { label: 'MINUTOS', value: timeLeft.minutos },
    { label: 'SEGUNDOS', value: timeLeft.segundos },
  ];

  return (
    <section className="relative py-16 px-4 bg-[#0c0c0d] text-white overflow-hidden flex flex-col items-center justify-center">
      {/* Luces bokeh de fondo (Efecto de fiesta sutil) */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Título de sección */}
      <div className="text-center mb-8 z-10">
        <h2 className="font-serif text-[#d4af37] text-sm md:text-base tracking-[0.3em] uppercase mb-2">
          La Cuenta Regresiva
        </h2>
        <h3 className="font-light text-2xl md:text-3xl tracking-widest text-gray-300 font-sans">
          FALTAN SOLO...
        </h3>
      </div>

      {/* Grid del Contador */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full px-4 z-10">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-6 bg-white/5 border border-[#d4af37]/20 rounded-2xl backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:border-[#d4af37]/50"
          >
            {/* Número */}
            <span className="font-serif text-4xl md:text-5xl font-semibold text-[#d4af37] drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)] tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
            {/* Etiqueta */}
            <span className="mt-2 text-[10px] md:text-xs tracking-[0.2em] text-gray-400 uppercase font-light">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      {/* Detalle decorativo al pie */}
      <div className="mt-8 text-center text-gray-500 text-xs tracking-wider z-10 font-serif italic">
        Para una noche mágica
      </div>
    </section>
  );
}