import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, Music, X } from 'lucide-react';
import config from '../data/eventConfig.json';
import FloralDecor from './FloralDecor';

export default function Hero() {
  const { nombre, subtitulo, frase, fotoHero, fechaVisual } = config.quinceanera;
  const { titulo, artista, audioUrl, duracionTexto } = config.musica;

  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [liked, setLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalDuration, setTotalDuration] = useState(duracionTexto || '0:00');
  const [progress, setProgress] = useState(0);

  const audioRef = useRef(null);
  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    const startAudioOnTap = () => {
      if (hasAutoStartedRef.current || !audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          hasAutoStartedRef.current = true;
          setIsPlaying(true);
          setShowAudioPrompt(false);
          removeListeners();
        })
        .catch(() => {
          // Si el navegador aún bloquea el audio, mantiene el aviso visible hasta el primer click/tap real
        });
    };

    // 'click' cubre tanto el tap corto en celulares como el clic en escritorio
    const events = ['click', 'keydown'];

    const removeListeners = () => {
      events.forEach((evt) => window.removeEventListener(evt, startAudioOnTap));
    };

    events.forEach((evt) => window.addEventListener(evt, startAudioOnTap, { passive: true }));

    return () => removeListeners();
  }, []);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;

    hasAutoStartedRef.current = true;
    setShowAudioPrompt(false);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDismissPrompt = (e) => {
    e.stopPropagation(); // Evita que al cerrar con la X se dispare el play global
    hasAutoStartedRef.current = true;
    setShowAudioPrompt(false);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const duration = audioRef.current.duration;
    if (isFinite(duration)) {
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      setTotalDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
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
    <section className="bg-tiana-cream text-tiana-brown overflow-hidden relative">
      {showAudioPrompt && !isPlaying && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div
            onClick={togglePlay}
            role="button"
            tabIndex={0}
            className="pointer-events-auto w-full max-w-sm bg-tiana-dark/95 text-tiana-pearl px-4 py-3 rounded-2xl shadow-2xl border border-tiana-gold/60 backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer animate-bounce"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-full bg-tiana-gold/20 border border-tiana-gold flex items-center justify-center shrink-0 text-tiana-gold">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-tiana-pearl">
                  ¡Esta invitación tiene música! 🎶
                </p>
                <p className="text-[11px] text-tiana-mint leading-tight mt-0.5">
                  Tocá la pantalla para escuchar la canción
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismissPrompt}
              aria-label="Cerrar aviso de música"
              className="p-1 text-tiana-pearl/60 hover:text-tiana-pearl transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Contenedor de la Foto Superior */}
      <div className="relative h-[68vh] md:h-[78vh] w-full">
        <img
          src={fotoHero}
          alt={nombre}
          onError={(e) => {
            e.target.src = './foto15.jpg';
          }}
          className="w-full h-full object-cover object-top"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 flex flex-col items-center justify-end pb-28 sm:pb-32 md:pb-36 px-4 z-20">
          <span className="text-tiana-gold tracking-[0.35em] text-xs md:text-sm font-semibold uppercase mb-2 drop-shadow">
            XV AÑOS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-[0.2em] text-tiana-pearl font-normal uppercase drop-shadow-lg">
            {nombre}
          </h1>
        </div>

        <svg
          className="absolute -bottom-1 left-0 w-full h-10 sm:h-12 md:h-16 text-tiana-cream fill-current z-10"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path d="M0,45 C240,95 480,10 720,55 C960,95 1200,20 1440,65 L1440,100 L0,100 Z" />
        </svg>

        <div className="absolute bottom-16 left-0 right-0 translate-y-3/4 z-30 md:bottom-[-20px] md:translate-y-0">
          <FloralDecor variant="hero-bottom" />
        </div>
      </div>

      {/* 2. Bloque de Invitación, Fecha y Canción */}
      <div className="max-w-lg mx-auto px-6 pt-16 md:pt-20 pb-7 text-center relative z-10">
        <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-tiana-brown/80 mb-3 font-medium">
          Con la bendición de Dios y de mis padres
        </p>

        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-tiana-dark tracking-[0.15em] uppercase my-6">
          {subtitulo}
        </h2>

        <p className="text-sm md:text-base text-tiana-brown max-w-xs mx-auto mb-8 leading-relaxed font-normal">
          {frase}
        </p>

        {/* Fecha con líneas horizontales */}
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

        {/* Reproductor de Música */}
        <div className="mt-10 bg-tiana-dark/95 backdrop-blur-md text-tiana-pearl rounded-3xl p-6 shadow-xl border border-tiana-gold/30 max-w-sm mx-auto">
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="auto"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          />

          <h3 className="text-lg font-semibold tracking-wide text-tiana-pearl">{titulo}</h3>
          <p className="text-xs text-tiana-mint tracking-wider mt-0.5 mb-5">{artista}</p>

          <div className="w-full bg-tiana-pearl/20 h-1 rounded-full overflow-hidden relative">
            <div
              className="bg-tiana-gold h-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-tiana-beige mt-1.5 font-mono">
            <span>{currentTime}</span>
            <span>{totalDuration}</span>
          </div>

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