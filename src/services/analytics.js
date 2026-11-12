import { doc, setDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const METRICS_DOC = doc(db, 'metricas', 'embudo_rsvp');

// 1. Registra la visita una única vez por sesión del navegador
export const trackPageVisit = async () => {
  try {
    if (sessionStorage.getItem('visit_tracked')) return;
    sessionStorage.setItem('visit_tracked', 'true');

    await setDoc(
      METRICS_DOC,
      {
        visitasUnicas: increment(1),
        ultimaVisita: new Date()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error registrando visita:', error);
  }
};

// 2. Registra cada vez que alguien presiona el botón "ENVIAR"
export const trackSubmitClick = async (asiste) => {
  try {
    await setDoc(
      METRICS_DOC,
      {
        clicsEnviarTotales: increment(1),
        [`clicsAsiste_${asiste}`]: increment(1),
        ultimoIntento: new Date()
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error registrando clic en enviar:', error);
  }
};

// 3. Registra cuando la confirmación se guarda con éxito o se descarga el PDF
export const trackConversion = async (tipoEvento, detalles = {}) => {
  try {
    await setDoc(
      METRICS_DOC,
      {
        [tipoEvento]: increment(1)
      },
      { merge: true }
    );

    // Log detallado de eventos para auditoría
    await addDoc(collection(db, 'logs_actividad'), {
      evento: tipoEvento,
      ...detalles,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error registrando conversión:', error);
  }
};