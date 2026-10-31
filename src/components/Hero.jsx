import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart } from 'lucide-react';
import config from '../data/eventConfig.json';

export default function Hero() {
  const { nombre, subtitulo, frase, fotoHero, fechaVisual } = config.quinceanera;
  const { titulo, artista, audioUrl, duracionTexto } = config.musica;

  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration || 1;
    setProgress((current / duration) * 100);

    const mins = Math.floor(current / 60);
    const secs = Math.floor(current % 60);
    setCurrentTime(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
  };

  return (
    <section className="bg-tiana-cream text-tiana-brown overflow-hidden">
      {/* 1. Foto Superior con Nombre Superpuesto */}
      <div className="relative h-[65vh] md:h-[75vh] w-full">
        <img
          src={fotoHero}
          alt={nombre}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";
          }}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 flex flex-col items-center justify-end pb-16 px-4">
          <span className="text-tiana-gold tracking-[0.35em] text-xs md:text-sm font-semibold uppercase mb-2">
            XV AÑOS
          </span>
          <h1 className="text-4xl md:text-6xl font-serif tracking-[0.2em] text-tiana-pearl font-normal uppercase drop-shadow-md">
            {nombre}
          </h1>
        </div>

        {/* Divisor de papel rasgado / onda suave en la base de la foto */}
        <svg
          className="absolute -bottom-1 left-0 w-full text-tiana-cream fill-current"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path d="M0,45 C240,95 480,10 720,55 C960,95 1200,20 1440,65 L1440,100 L0,100 Z" />
        </svg>
      </div>

      {/* 2. Bloque de Invitación y Fecha (Sin cursivas) */}
      <div className="max-w-lg mx-auto px-6 pt-8 pb-12 text-center relative">
        <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-tiana-brown/80 mb-3 font-medium">
          Con la bendición de Dios y de mis padres
        </p>

        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-tiana-dark tracking-[0.15em] uppercase my-6">
          {subtitulo}
        </h2>

        <p className="text-sm md:text-base text-tiana-brown max-w-xs mx-auto mb-8 leading-relaxed font-normal">
          {frase}
        </p>

        {/* Diseño de Fecha igual a la captura 4 */}
        <div className="flex items-center justify-center gap-4 my-6">
          <div className="flex-1 max-w-[110px] border-y border-tiana-brown/60 py-1.5">
            <span className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-tiana-brown">
              {fechaVisual.diaSemana}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-5xl md:text-6xl font-serif font-bold text-tiana-dark leading-none">
              {fechaVisual.diaNumero}
            </span>
            <span className="text-xs tracking-[0.25em] text-tiana-brown mt-1 font-semibold">
              {fechaVisual.anio}
            </span>
          </div>

          <div className="flex-1 max-w-[110px] border-y border-tiana-brown/60 py-1.5">
            <span className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-tiana-brown">
              {fechaVisual.mes}
            </span>
          </div>
        </div>

        {/* 3. Reproductor de Música (Captura 6) justo debajo de la fecha */}
        <div className="mt-10 bg-tiana-dark/90 backdrop-blur-md text-tiana-pearl rounded-3xl p-6 shadow-xl border border-tiana-gold/30 max-w-sm mx-auto">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          <h3 className="text-lg font-semibold tracking-wide text-tiana-pearl">
            {titulo}
          </h3>
          <p className="text-xs text-tiana-mint tracking-wider mt-0.5 mb-5">
            {artista}
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-tiana-pearl/20 h-1 rounded-full overflow-hidden relative">
            <div
              className="bg-tiana-gold h-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-tiana-beige mt-1.5 font-mono">
            <span>{currentTime}</span>
            <span>{duracionTexto}</span>
          </div>

          {/* Controles del reproductor */}
          <div className="flex items-center justify-between mt-4 px-2">
            <button type="button" className="text-tiana-pearl/70 hover:text-tiana-gold transition">
              <Shuffle className="w-4 h-4" />
            </button>
            <button type="button" className="text-tiana-pearl hover:text-tiana-gold transition">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-tiana-pearl text-tiana-dark flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>
            <button type="button" className="text-tiana-pearl hover:text-tiana-gold transition">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button type="button" className="text-tiana-pearl/70 hover:text-tiana-gold transition">
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corazón decorativo inferior */}
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          className="mt-4 inline-flex items-center justify-center text-tiana-brown/70 hover:text-tiana-gold transition"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-tiana-gold text-tiana-gold' : ''}`} />
        </button>
      </div>
    </section>
  );
}