import { jsPDF } from 'jspdf';
import config from '../data/eventConfig.json';

export const generateInvitationPdf = (invitado) => {
  // Formato tarjeta vertical (105mm x 148mm - Tamaño A6)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148]
  });

  const { nombre: nombreQuince, fechaVisual } = config.quinceanera;
  const { horarioYLugar, direccion } = config.ubicacion;

  // 1. Fondo Crema Marfil (#F8F1E1)
  doc.setFillColor(248, 241, 225);
  doc.rect(0, 0, 105, 148, 'F');

  // 2. Marco exterior Verde Hoja Oscuro (#3F7D4A) y borde interno Dorado Lirio (#D4AF37)
  doc.setDrawColor(63, 125, 74);
  doc.setLineWidth(1.2);
  doc.rect(6, 6, 93, 136);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 89, 132);

  // 3. Encabezado del Evento
  doc.setTextColor(212, 175, 55); // Dorado
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('PASE PERSONAL DE INVITADO', 52.5, 20, { align: 'center' });

  doc.setTextColor(63, 125, 74); // Verde oscuro
  doc.setFontSize(22);
  doc.text(`XV ${nombreQuince}`, 52.5, 31, { align: 'center' });

  // Línea divisoria dorada
  doc.setDrawColor(212, 175, 55);
  doc.line(25, 36, 80, 36);

  // 4. Fecha y Lugar del Evento
  doc.setTextColor(107, 79, 58); // Marrón elegante (#6B4F3A)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    `${fechaVisual.diaSemana} ${fechaVisual.diaNumero} DE ${fechaVisual.mes} ${fechaVisual.anio}`,
    52.5,
    45,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(horarioYLugar, 52.5, 52, { align: 'center' });
  doc.setFontSize(8);
  doc.text(direccion, 52.5, 57, { align: 'center', maxWidth: 80 });

  // 5. Caja de Datos del Invitado Registrado
  doc.setFillColor(255, 253, 247); // Blanco perla (#FFFDF7)
  doc.setDrawColor(231, 215, 177); // Beige cálido (#E7D7B1)
  doc.roundedRect(14, 66, 77, 48, 3, 3, 'FD');

  doc.setTextColor(63, 125, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INVITADO CONFIRMADO:', 52.5, 74, { align: 'center' });

  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text(`${invitado.nombre} ${invitado.apellido}`, 52.5, 83, {
    align: 'center',
    maxWidth: 70
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Menú asignado: ${invitado.dieta}`, 52.5, 93, { align: 'center' });

  if (invitado.cancion) {
    doc.setFontSize(7.5);
    doc.text(`Tema sugerido: "${invitado.cancion}"`, 52.5, 100, {
      align: 'center',
      maxWidth: 68
    });
  }

  doc.setTextColor(91, 166, 107); // Verde Tiana (#5BA66B)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`ID DE REGISTRO: #${invitado.idCorto}`, 52.5, 109, { align: 'center' });

  // 6. Pie de tarjeta
  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.text('Presentá esta invitación en la recepción del salón.', 52.5, 127, {
    align: 'center'
  });

  // Descargar archivo
  const fileName = `Invitacion_XV_${nombreQuince}_${invitado.nombre}_${invitado.apellido}.pdf`
    .replace(/\s+/g, '_');
  doc.save(fileName);
};