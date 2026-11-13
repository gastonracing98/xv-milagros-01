import React, { useState, useEffect } from 'react';
import config from '../data/eventConfig.json';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../services/firebase';
import InlineError from './InlineError';
import FloralDecor from './FloralDecor';
import { trackPageVisit, trackSubmitClick, trackConversion } from '../services/analytics';
import { notifyNewRsvp } from '../services/notifications';
import { generateInvitationPdf } from '../services/pdfGenerator';
import { Download, CheckCircle2, Sparkles } from 'lucide-react';

const OPCIONES_DIETA = [
  { value: 'Ninguno (Menú general)', label: 'Ninguno (Menú general)' },
  { value: 'Vegetariano', label: 'Vegetariano' },
  { value: 'Vegano', label: 'Vegano' },
  { value: 'Celíaco (Sin TACC)', label: 'Celíaco (Sin TACC)' },
  { value: 'Sin lactosa', label: 'Intolerante a la lactosa' }
];

const sanitizeText = (str = '') =>
  str
    .replace(/<[^>]*>?/gm, '')
    .replace(/[<>/{}[\]\\^~`]/g, '')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeName = (str = '') =>
  sanitizeText(str)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());

export default function RsvpForm() {
  const [formData, setFormData] = useState({
    asiste: 'si',
    nombre: '',
    apellido: '',
    dieta: OPCIONES_DIETA[0].value,
    cancion: '',
    mensaje: '',
    website_hp: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [guestRegistered, setGuestRegistered] = useState(null);

  const nombreQuinceanera = config?.quinceanera?.nombre || 'la quinceañera';
  const asisteAlEvento = formData.asiste === 'si';

  useEffect(() => {
    trackPageVisit();
  }, []);

  const validateField = (name, value) => {
    const cleanValue = value.trim().replace(/\s+/g, ' ');
    const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\s']+$/;
    const regexCaracteresPeligrosos = /[<>/{}[\]\\^~`]/;

    switch (name) {
      case 'nombre':
        if (!cleanValue) return 'El nombre es obligatorio.';
        if (cleanValue.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
        if (cleanValue.length > 50) return 'El nombre no puede superar los 50 caracteres.';
        if (!regexLetras.test(cleanValue)) return 'El nombre solo puede contener letras y espacios.';
        return '';

      case 'apellido':
        if (!cleanValue) return 'El apellido es obligatorio.';
        if (cleanValue.length < 2) return 'El apellido debe tener al menos 2 caracteres.';
        if (cleanValue.length > 50) return 'El apellido no puede superar los 50 caracteres.';
        if (!regexLetras.test(cleanValue)) return 'El apellido solo puede contener letras y espacios.';
        return '';

      case 'dieta':
        if (!asisteAlEvento) return '';
        if (!OPCIONES_DIETA.some((op) => op.value === value)) {
          return 'Seleccioná una opción válida del menú.';
        }
        return '';

      case 'cancion':
        if (!asisteAlEvento || !cleanValue) return '';
        if (cleanValue.length < 2) return 'El nombre de la canción es demasiado corto.';
        if (cleanValue.length > 120) return 'Máximo 120 caracteres para la recomendación.';
        if (regexCaracteresPeligrosos.test(cleanValue)) return 'El texto contiene caracteres no permitidos.';
        return '';

      case 'mensaje':
        if (!cleanValue) return '';
        if (cleanValue.length < 3) return 'El mensaje es demasiado corto.';
        if (cleanValue.length > 300) return 'El mensaje no puede superar los 300 caracteres.';
        if (regexCaracteresPeligrosos.test(cleanValue)) return 'El mensaje contiene símbolos no permitidos.';
        return '';

      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = asisteAlEvento
      ? ['nombre', 'apellido', 'dieta', 'cancion', 'mensaje']
      : ['nombre', 'apellido', 'mensaje'];

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'asiste' && value === 'no') {
      setErrors((prev) => ({ ...prev, dieta: '', cancion: '', general: '' }));
    } else if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    if (errorMsg) setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.website_hp) return;

    trackSubmitClick(formData.asiste, formData.nombre);

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    const nombreNormalizado = normalizeName(formData.nombre);
    const apellidoNormalizado = normalizeName(formData.apellido);
    const cancionSanitizada = sanitizeText(formData.cancion);
    const mensajeSanitizado = sanitizeText(formData.mensaje);

    try {
      // 1. Verificar duplicados
      const q = query(
        collection(db, 'invitados'),
        where('nombre', '==', nombreNormalizado),
        where('apellido', '==', apellidoNormalizado)
      );

      const resultado = await getDocs(q);

      if (!resultado.empty) {
        setErrors({
          general: `Ya existe una confirmación registrada para ${nombreNormalizado} ${apellidoNormalizado}.`
        });
        setLoading(false);
        return;
      }

      const counterRef = doc(db, 'metricas', 'embudo_rsvp');
      const nuevoInvitadoRef = doc(collection(db, 'invitados'));

      const sufijoSeguridad = nuevoInvitadoRef.id.slice(0, 3).toUpperCase();

      const datosRegistrados = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const ultimoNro = counterDoc.exists() ? (counterDoc.data().ultimoNroInvitado || 0) : 0;
        const nuevoNro = ultimoNro + 1;

        const nroFormateado = String(nuevoNro).padStart(4, '0');
        const codigoUnico = `XV-MILU-${nroFormateado}-${sufijoSeguridad}`;

        const payloadInvitado = {
          nroRegistro: nuevoNro,
          codigoInvitacion: codigoUnico,
          asiste: formData.asiste,
          nombre: nombreNormalizado,
          apellido: apellidoNormalizado,
          dieta: asisteAlEvento ? formData.dieta : 'No aplica (No asiste)',
          cancion: asisteAlEvento ? (cancionSanitizada || 'Sin especificar') : 'No aplica',
          mensaje: mensajeSanitizado || 'Sin mensaje',
          createdAt: new Date()
        };

        
        transaction.set(counterRef, { ultimoNroInvitado: nuevoNro }, { merge: true });
        transaction.set(nuevoInvitadoRef, payloadInvitado);

        return {
          ...payloadInvitado,
          idCorto: codigoUnico
        };
      });

      trackConversion('confirmacionesExitosas', {
        invitado: `${nombreNormalizado} ${apellidoNormalizado}`,
        codigoInvitacion: datosRegistrados.codigoInvitacion,
        asiste: formData.asiste
      });
      notifyNewRsvp(datosRegistrados);

      setGuestRegistered(datosRegistrados);
      setEnviado(true);
    } catch (err) {
      console.error('Error al guardar en Firebase:', err);
      setErrors({
        general: 'No pudimos guardar tu confirmación en este momento. Revisá tu conexión e intentá nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!guestRegistered) return;
    await generateInvitationPdf(guestRegistered);
    trackConversion('descargasPdf', {
      invitado: `${guestRegistered.nombre} ${guestRegistered.apellido}`,
      codigoInvitacion: guestRegistered.codigoInvitacion
    });
  };

  const getInputClass = (fieldName) => {
    const base =
      'w-full p-4 bg-tiana-pearl border rounded-md text-tiana-brown placeholder-tiana-brown/50 focus:outline-none transition-colors';
    return errors[fieldName]
      ? `${base} border-red-500 bg-red-50/30 focus:border-red-600`
      : `${base} border-tiana-beige focus:border-tiana-primary`;
  };

  return (
    <section className="relative py-16 px-6 bg-tiana-cream text-tiana-brown overflow-hidden">
      <div className="max-w-md mx-auto text-center relative z-10">
        <FloralDecor variant="form-arch" />

        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-tiana-brown mb-8 tracking-wide">
          Faltas vos, ¿Venís?
        </h2>

        <InlineError message={errors.general} variant="banner" />

        {enviado ? (
          <div className="p-8 bg-tiana-pearl rounded-2xl border border-tiana-gold/40 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-tiana-mint/50 text-tiana-dark flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-serif font-semibold text-tiana-dark">
              ¡Gracias por responder, {guestRegistered?.nombre}!
            </h3>

            {guestRegistered?.asiste === 'si' && (
              <div className="py-2 px-4 bg-tiana-mint/30 rounded-lg border border-tiana-gold/30 inline-block">
                <span className="block text-[10px] uppercase tracking-widest text-tiana-brown/80">
                  Tu código de invitación
                </span>
                <span className="font-mono text-sm font-bold text-tiana-dark tracking-wider">
                  {guestRegistered.codigoInvitacion}
                </span>
              </div>
            )}

            <p className="text-sm text-tiana-brown leading-relaxed">
              {guestRegistered?.asiste === 'si'
                ? 'Tus datos fueron registrados. Descargá tu tarjeta personal con tu código único para el ingreso al salón.'
                : 'Registramos que no podrás asistir. ¡Muchas gracias por avisarnos y por tus palabras!'}
            </p>

            {guestRegistered?.asiste === 'si' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full py-3.5 px-6 rounded-full bg-tiana-dark hover:bg-tiana-primary text-tiana-pearl font-semibold tracking-[0.15em] uppercase text-xs md:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar Invitación Personal (PDF)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setEnviado(false);
                setGuestRegistered(null);
                setErrors({});
                setFormData({
                  asiste: 'si',
                  nombre: '',
                  apellido: '',
                  dieta: OPCIONES_DIETA[0].value,
                  cancion: '',
                  mensaje: '',
                  website_hp: ''
                });
              }}
              className="block w-full pt-4 text-xs uppercase tracking-widest text-tiana-brown/80 hover:text-tiana-dark underline font-semibold"
            >
              Cargar otra persona
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
            <input
              type="text"
              name="website_hp"
              value={formData.website_hp}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

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

            {/* Campo: Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-tiana-brown mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                maxLength={50}
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('nombre')}
              />
              <InlineError message={errors.nombre} />
            </div>

            {/* Campo: Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-tiana-brown mb-1">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                id="apellido"
                type="text"
                name="apellido"
                maxLength={50}
                placeholder="Gutierrez"
                value={formData.apellido}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('apellido')}
              />
              <InlineError message={errors.apellido} />
            </div>

            {/* Campos exclusivos para quienes ASISTEN */}
            {asisteAlEvento && (
              <div className="space-y-4 transition-all duration-300">
                <div>
                  <label htmlFor="dieta" className="block text-sm font-medium text-tiana-brown mb-1">
                    Menú especial
                  </label>
                  <select
                    id="dieta"
                    name="dieta"
                    value={formData.dieta}
                    onChange={handleChange}
                    className={`${getInputClass('dieta')} cursor-pointer`}
                  >
                    {OPCIONES_DIETA.map((opcion) => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                  <InlineError message={errors.dieta} />
                </div>

                <div>
                  <label htmlFor="cancion" className="block text-sm font-medium text-tiana-brown mb-1">
                    Recomendación al DJ
                  </label>
                  <input
                    id="cancion"
                    type="text"
                    name="cancion"
                    maxLength={120}
                    placeholder="Recomendale una canción al DJ 🎶"
                    value={formData.cancion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClass('cancion')}
                  />
                  <InlineError message={errors.cancion} />
                </div>
              </div>
            )}

            {/* Apartado de Mensaje para la 15añera */}
            <div className="pt-2">
              <div className="p-4 rounded-xl bg-tiana-mint/25 border border-tiana-gold/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="mensaje" className="text-sm font-semibold text-tiana-dark flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-tiana-gold" />
                    Dejale un mensaje a Milu ♥
                  </label>
                  <span className="text-[11px] text-tiana-brown/60 font-mono">
                    {formData.mensaje.length}/300
                  </span>
                </div>

                <p className="text-xs text-tiana-brown/80 leading-relaxed">
                  Escribile unas palabras o buenos deseos para su noche especial. <strong>¡Ella lo va a leer personalmente!</strong>
                </p>

                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="3"
                  maxLength={300}
                  placeholder={`Ej: ¡Felices 15, ${nombreQuinceanera}! Te deseo lo mejor...`}
                  value={formData.mensaje}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getInputClass('mensaje')} resize-none mt-1`}
                />
                <InlineError message={errors.mensaje} />
              </div>
            </div>

            {/* Botón Enviar */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-8 rounded-full bg-tiana-primary hover:bg-tiana-dark disabled:opacity-50 text-tiana-pearl font-semibold tracking-[0.2em] uppercase text-base shadow-md transition-colors"
              >
                {loading ? 'ENVIANDO...' : 'ENVIAR'}
              </button>
            </div>

            <p className="pt-4 text-center text-[11px] md:text-xs tracking-[0.12em] uppercase text-tiana-brown/80 leading-relaxed font-medium">
              {config.rsvp.recordatorio}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}