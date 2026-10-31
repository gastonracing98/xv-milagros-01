import React, { useState, useEffect } from 'react';
import config from '../data/eventConfig.json';

export default function Counter() {
  const targetDateStr = config.quinceanera.fechaEvento;
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
    isOver: false
  });

  useEffect(() => {
    const targetUTC = new Date(targetDateStr).getTime();
    if (isNaN(targetUTC)) return;

    const calculateTime = () => {
      const difference = targetUTC - Date.now();
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

    calculateTime();
    const intervalId = setInterval(calculateTime, 1000);
    return () => clearInterval(intervalId);
  }, [targetDateStr]);

  const timeUnits = [
    { label: 'DÍAS', value: timeLeft.dias },
    { label: 'HORAS', value: timeLeft.horas },
    { label: 'MINUTOS', value: timeLeft.minutos },
    { label: 'SEGUNDOS', value: timeLeft.segundos },
  ];

  return (
    <section className="py-14 px-4 bg-tiana-mint/40 text-tiana-brown flex flex-col items-center justify-center border-y border-tiana-gold/20">
      <div className="text-center mb-8">
        <h2 className="font-serif text-tiana-dark text-xs md:text-sm tracking-[0.3em] uppercase font-semibold mb-2">
          La Cuenta Regresiva
        </h2>
        <h3 className="text-xl md:text-2xl tracking-[0.2em] text-tiana-brown font-semibold uppercase">
          FALTAN SOLO...
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl w-full px-2">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-5 bg-tiana-pearl border border-tiana-gold/40 rounded-2xl shadow-sm"
          >
            <span className="font-serif text-4xl md:text-5xl font-bold text-tiana-dark tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="mt-2 text-[11px] tracking-[0.2em] text-tiana-brown uppercase font-medium">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}