import React, { useState } from 'react';
import config from '../data/eventConfig.json';

export default function RsvpForm() {
  const [formData, setFormData] = useState({
    asiste: 'si',
    nombre: '',
    apellido: '',
    dieta: '',
    cancion: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Cuando actives Firebase, aquí descomentarás addDoc(collection(db, "invitados"), formData)
    console.log("Datos listos para guardar en DB:", formData);
    setEnviado(true);
  };

  return (
    <section className="py-16 px-6 bg-tiana-cream text-tiana-brown">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-tiana-brown mb-8 tracking-wide">
          Sólo faltas vos, ¿Venís?
        </h2>

        {enviado ? (
          <div className="p-8 bg-tiana-pearl rounded-2xl border border-tiana-gold/40 shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-tiana-dark mb-2">
              ¡Gracias por confirmar!
            </h3>
            <p className="text-sm text-tiana-brown">
              Tus datos fueron registrados correctamente.
            </p>
            <button
              type="button"
              onClick={() => {
                setEnviado(false);
                setFormData({ asiste: 'si', nombre: '', apellido: '', dieta: '', cancion: '' });
              }}
              className="mt-6 text-xs uppercase tracking-widest text-tiana-dark underline font-semibold"
            >
              Cargar otra persona
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Radio Buttons: Sí / No */}
            <div className="flex items-center justify-center gap-12 mb-6">
              <label className="flex items-center gap-3 cursor-pointer text-lg font-medium text-tiana-brown">
                <input
                  type="radio"
                  name="asiste"
                  value="si"
                  checked={formData.asiste === 'si'}
                  onChange={handleChange}
                  className="w-6 h-6 accent-tiana-dark cursor-pointer"
                />
                <span>Sí</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-lg font-medium text-tiana-brown">
                <input
                  type="radio"
                  name="asiste"
                  value="no"
                  checked={formData.asiste === 'no'}
                  onChange={handleChange}
                  className="w-6 h-6 accent-tiana-dark cursor-pointer"
                />
                <span>No</span>
              </label>
            </div>

            {/* Inputs de texto */}
            <input
              type="text"
              name="nombre"
              required
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-4 bg-tiana-pearl border border-tiana-beige rounded-md text-tiana-brown placeholder-tiana-brown/50 focus:outline-none focus:border-tiana-primary"
            />

            <input
              type="text"
              name="apellido"
              required
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full p-4 bg-tiana-pearl border border-tiana-beige rounded-md text-tiana-brown placeholder-tiana-brown/50 focus:outline-none focus:border-tiana-primary"
            />

            <input
              type="text"
              name="dieta"
              placeholder="Vegano / vegetariano / celíaco / nada"
              value={formData.dieta}
              onChange={handleChange}
              className="w-full p-4 bg-tiana-pearl border border-tiana-beige rounded-md text-tiana-brown placeholder-tiana-brown/50 focus:outline-none focus:border-tiana-primary"
            />

            <textarea
              name="cancion"
              rows="3"
              placeholder="Recomendale una canción al DJ 🎶"
              value={formData.cancion}
              onChange={handleChange}
              className="w-full p-4 bg-tiana-pearl border border-tiana-beige rounded-md text-tiana-brown placeholder-tiana-brown/50 focus:outline-none focus:border-tiana-primary resize-none"
            />

            {/* Botón Enviar */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-8 rounded-full bg-tiana-primary hover:bg-tiana-dark text-tiana-pearl font-semibold tracking-[0.2em] uppercase text-base shadow-md transition-colors"
              >
                ENVIAR
              </button>
            </div>

            {/* Nota al pie */}
            <p className="pt-4 text-[11px] md:text-xs tracking-[0.12em] uppercase text-tiana-brown/80 leading-relaxed font-medium">
              {config.rsvp.recordatorio}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}