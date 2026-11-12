import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function InlineError({ message, variant = 'field' }) {
  if (!message) return null;

  // Banner general (para errores de Firebase o registros duplicados)
  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className="mb-6 p-4 rounded-lg bg-red-50 border border-red-300 text-red-800 text-sm flex items-start gap-3 text-left shadow-sm animate-fadeIn"
      >
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <span className="font-medium leading-relaxed">{message}</span>
      </div>
    );
  }

  // Error específico debajo de cada input
  return (
    <p
      role="alert"
      className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1.5 text-left"
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}