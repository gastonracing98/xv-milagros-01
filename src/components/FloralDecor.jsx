import React from 'react';
import config from '../data/eventConfig.json';

const DEFAULT_IMAGES = {
  heroBottom: '/flores/FloresPie4.png',
  sideVine: '/flores/DetallesPetalos2.png',
  formArch: '/TianaSentada.png',
  corner: '/flores/FloresPie3.png'
};

export default function FloralDecor({ variant = 'corner', className = '' }) {
  const floralImages = {
    ...DEFAULT_IMAGES,
    ...(config.imagenesFlorales || {})
  };

  const handleImageError = (e) => {
    e.currentTarget.style.display = 'none';
  };

  if (variant === 'hero-bottom') {
    return (
      <div className={`w-full flex justify-center pointer-events-none select-none ${className}`}>
        <img
          src={floralImages.heroBottom}
          alt=""
          aria-hidden="true"
          onError={handleImageError}
          className="w-[380px] sm:w-[420px] md:w-[500px] max-h-36 sm:max-h-40 md:max-h-48 object-contain drop-shadow-md"
        />
      </div>
    );
  }

  if (variant === 'side-vines') {
    return (
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <img
          src={floralImages.sideVine}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="absolute top-8 -left-10 w-32 md:w-44 object-contain opacity-95"
        />
        <img
          src={floralImages.sideVine}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="absolute top-1/2 -left-12 w-36 md:w-48 -translate-y-1/2 object-contain opacity-90"
        />
        <img
          src={floralImages.sideVine}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="absolute bottom-8 -left-10 w-32 md:w-44 object-contain opacity-95"
        />

        <img
          src={floralImages.sideVine}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="absolute top-20 -right-10 w-32 md:w-44 -scale-x-100 object-contain opacity-95"
        />
        <img
          src={floralImages.sideVine}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="absolute top-2/3 -right-12 w-36 md:w-48 -scale-x-100 object-contain opacity-90"
        />
        <img
          src={floralImages.sideVine}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="absolute bottom-6 -right-10 w-32 md:w-44 -scale-x-100 object-contain opacity-95"
        />
      </div>
    );
  }

  if (variant === 'form-arch') {
    return (
      <div className={`relative w-full flex justify-center pointer-events-none select-none ${className}`}>
        <img
          src={floralImages.formArch}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="w-full max-w-md object-contain -mt-8 mb-2 drop-shadow-sm"
        />
      </div>
    );
  }

  // 4. Flor divisoria flotante sobre la línea entre secciones (Más grande y sin empujar)
  if (variant === 'divider') {
    return (
      <div
        className={`pointer-events-none select-none flex items-center justify-center ${className}`}
      >
        <img
          src={floralImages.corner}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={handleImageError}
          className="w-44 sm:w-52 md:w-60 object-contain drop-shadow-sm"
        />
      </div>
    );
  }

  // 5. Ramillete esquinero por defecto
  return (
    <div className={`flex items-center justify-center pointer-events-none select-none ${className}`}>
      <img
        src={floralImages.corner}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={handleImageError}
        className="w-36 md:w-44 object-contain"
      />
    </div>
  );
}