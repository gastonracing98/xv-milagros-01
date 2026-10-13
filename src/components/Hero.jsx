import React from 'react';
import config from '../data/eventConfig.json';

export default function Hero() {
  const { nombre, frase } = config.quinceanera;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-secondary text-white text-center p-6">
      <h3 className="text-xl md:text-2xl font-light tracking-widest uppercase mb-4 text-primary">
        Mis 15 Años
      </h3>
      <h1 className="text-6xl md:text-8xl font-serif mb-6">
        {nombre}
      </h1>
      <p className="max-w-md text-gray-300 italic text-lg">
        "{frase}"
      </p>
      
      <button className="mt-10 px-8 py-3 bg-primary text-secondary font-bold rounded-full hover:bg-white transition-all">
        Confirmar Asistencia
      </button>
    </section>
  );
}