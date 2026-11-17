import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, X } from 'lucide-react';
import config from '../data/eventConfig.json';
import FloralDecor from './FloralDecor';

export default function Hero() {
  const { nombre, subtitulo, frase, fotoHero, fechaVisual } = config.quinceanera;
  const { audioUrl } = config.musica;

  const [isPlaying, setIsPlaying] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [isBubble, setIsBubble] = useState(false);
  
  // Estado para arrastrar la burbuja
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const audioRef = useRef(null);
  const hasAutoStartedRef = useRef(false);
  
  // Referencia para controlar YouTube
  const ytPlayerRef = useRef(null);

  // 1. Reproducción global al primer toque
  useEffect(() => {
    const startAudioOnTap = () => {
      if (hasAutoStartedRef.current || !audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          hasAutoStartedRef.current = true;
          setIsPlaying(true);
          setShowAudioPrompt(false);
          setIsBubble(true);
          removeListeners();
        })
        .catch(() => {});
    };

    const events = ['click', 'keydown', 'touchstart'];
    const removeListeners = () => {
      events.forEach((evt) => window.removeEventListener(evt, startAudioOnTap));
    };

    events.forEach((evt) => window.addEventListener(evt, startAudioOnTap, { passive: true }));
    return () => removeListeners();
  }, []);

  // 2. Inicializar YouTube API para el control cruzado (Música / Video)
  useEffect(() => {
    let player;

    const initPlayer = () => {
      // Usamos el ID del iframe para conectarlo
      player = new window.YT.Player('youtube-player', {
        events: {
          onStateChange: (event) => {
            // Estado 1 = REPRODUCIENDO (PLAYING)
            if (event.data === 1) {
              if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause();
                setIsPlaying(false);
              }
            }
          },
        },
      });
      ytPlayerRef.current = player;
    };

    // Inyectar el script de YouTube si no existe en la página
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, []);

  // Lógica de arrastre (Drag & Drop)
  const handlePointerDown = (e) => {
    if (!isBubble) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - bubblePos.x,
      y: e.clientY - bubblePos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    setBubblePos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

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
      // Pausar YouTube si la música de fondo se vuelve a activar
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
      }
    }
  };

  const handleDismissPrompt = (e) => {
    e.stopPropagation();
    hasAutoStartedRef.current = true;
    setShowAudioPrompt(false);
    setIsBubble(true);
  };

  return (
    <section className="bg-tiana-cream text-tiana-brown overflow-hidden relative">
      
      <style>{`
        @keyframes eq {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .eq-bar {
          transform-origin: bottom;
          animation: eq 1s infinite ease-in-out;
        }
      `}</style>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        loop
        onEnded={() => setIsPlaying(false)}
      />

      {/* NOTIFICACIÓN INICIAL */}
      {showAudioPrompt && !isBubble && (
        <div className="fixed top-4 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-tiana-dark/95 text-tiana-pearl px-4 py-3 rounded-2xl shadow-2xl border border-tiana-gold/60 backdrop-blur-md flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-full bg-tiana-gold/20 border border-tiana-gold flex items-center justify-center shrink-0 text-tiana-gold">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-tiana-pearl">
                  ¡Esta invitación tiene música! 🎶
                </p>
                <p className="text-[11px] text-tiana-mint leading-tight mt-0.5">
                  Tocá cualquier parte de la pantalla para escucharla
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissPrompt}
              className="p-1 text-tiana-pearl/60 hover:text-tiana-pearl transition shrink-0 z-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* BURBUJA FLOTANTE COMPRIMIDA (Dynamic Island) */}
      {isBubble && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `translate(${bubblePos.x}px, ${bubblePos.y}px)`,
            touchAction: 'none'
          }}
          className="fixed bottom-6 right-6 z-[60] cursor-grab active:cursor-grabbing flex justify-end"
        >
          <div 
            onClick={togglePlay}
            className={`h-14 rounded-full bg-tiana-dark border border-tiana-gold/80 shadow-[0_8px_16px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
              isPlaying ? 'w-24 px-4' : 'w-14'
            }`}
          >
            {isPlaying ? (
              <div className="flex items-end justify-center gap-[4px] h-6 w-full pb-1">
                <div className="w-[4px] h-full bg-tiana-mint rounded-full eq-bar" style={{ animationDuration: '0.7s' }}></div>
                <div className="w-[4px] h-full bg-tiana-gold rounded-full eq-bar" style={{ animationDuration: '1.1s' }}></div>
                <div className="w-[4px] h-full bg-tiana-mint rounded-full eq-bar" style={{ animationDuration: '0.8s' }}></div>
                <div className="w-[4px] h-full bg-tiana-gold rounded-full eq-bar" style={{ animationDuration: '1s' }}></div>
                <div className="w-[4px] h-full bg-tiana-mint rounded-full eq-bar" style={{ animationDuration: '1.2s' }}></div>
              </div>
            ) : (
              <Play className="w-6 h-6 fill-tiana-gold text-tiana-gold ml-1 transition-transform" />
            )}
          </div>
        </div>
      )}

      {/* 1. Contenedor EXCLUSIVO de la Foto Superior */}
      <div className="relative h-[68vh] md:h-[78vh] w-full bg-tiana-dark">
        <img
          src={fotoHero}
          alt={nombre}
          className="w-full h-full object-cover object-top"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 flex flex-col items-center justify-end pb-24 sm:pb-28 md:pb-32 px-4 z-20 pointer-events-none">
          <span className="text-tiana-gold tracking-[0.35em] text-xs md:text-sm font-semibold uppercase mb-2 drop-shadow">
            XV AÑOS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-[0.2em] text-tiana-pearl font-normal uppercase drop-shadow-lg">
            {nombre}
          </h1>
        </div>
      </div>

      {/* 2. NUEVO SEPARADOR ESTRUCTURAL */}
      <div className="relative w-full bg-tiana-cream z-30">
        
        <svg 
          className="absolute left-0 w-full h-12 sm:h-16 md:h-24 text-tiana-cream fill-current z-10 pointer-events-none" 
          style={{ bottom: '100%', marginBottom: '-2px' }} 
          viewBox="0 0 1440 100" 
          preserveAspectRatio="none"
        >
          <path d="M0,45 C240,95 480,10 720,55 C960,95 1200,20 1440,65 L1440,100 L0,100 Z" />
        </svg>
        
        <div className="absolute left-0 right-0 flex justify-center z-30 pointer-events-none" style={{ bottom: '100%', transform: 'translateY(55%)' }}>
          <FloralDecor variant="hero-bottom" />
        </div>

        {/* 3. Bloque de Invitación y Fecha */}
        <div className="max-w-lg mx-auto px-6 pt-16 md:pt-20 pb-4 text-center relative z-20">
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-tiana-brown/80 mb-3 font-medium">
            Con la bendición de Dios y de mis padres
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-tiana-dark tracking-[0.15em] uppercase my-6">
            {subtitulo}
          </h2>
          <p className="text-sm md:text-base text-tiana-brown max-w-xs mx-auto mb-8 leading-relaxed font-normal">
            {frase}
          </p>

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
        </div>

        {/* 4. Contenedor del Video de YouTube */}
        <div className="max-w-lg mx-auto px-6 pb-16 text-center relative z-40 pointer-events-auto">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-tiana-dark tracking-[0.1em] uppercase mb-8 mt-4">
            Mi vida en un video
          </h3>
          
          <div className="relative mx-auto w-full max-w-sm rounded-xl p-1.5 bg-gradient-to-br from-tiana-mint/40 to-tiana-gold/20 border-2 border-tiana-gold/50 shadow-[0_10px_25px_rgba(0,0,0,0.15)] pointer-events-auto">
            
            {/* FLOR MODIFICADA: Z-index muy alto [60], tamaño más grande (w-32) y más hacia adentro (-top-5 -left-5) */}
            <img 
              src="../../public/flores/MarcoEsquina.png" 
              alt="Decoración floral" 
              className="absolute -top-8 -left-8 w-32 h-32 z-[60] drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] pointer-events-none"
              onError={(e) => e.target.style.display = 'none'} 
            />

            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black z-50 pointer-events-auto">
              <iframe
                id="youtube-player"
                src="https://www.youtube.com/embed/P3bgCqMzC5E?enablejsapi=1&modestbranding=1&rel=0&iv_load_policy=3"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                className="absolute top-0 left-0 w-full h-full pointer-events-auto"
                title="Mi vida en un video"
              ></iframe>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}