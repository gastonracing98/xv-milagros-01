import { jsPDF } from 'jspdf';
import config from '../data/eventConfig.json';

// Carga cualquier imagen de la carpeta /public y la convierte a Base64 para el PDF
const loadImageAsBase64 = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

export const generateInvitationPdf = async (invitado) => {
  // Tamaño A6 vertical (105mm x 148mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148]
  });

  const { nombre: nombreQuince, fechaVisual } = config.quinceanera;
  const { horarioYLugar, direccion } = config.ubicacion;

  // Cargamos tus imágenes desde public/flores/ en paralelo
  const [marcoCompletoImg, florEsquinaImg, tianaImg] = await Promise.all([
    loadImageAsBase64('/flores/MarcoCompleto1.png'),
    loadImageAsBase64('/flores/MarcoEsquina.png'),
    loadImageAsBase64('/TIANA.png')
  ]);

  // 1. Fondo Crema Marfil (#F8F1E1)
  doc.setFillColor(248, 241, 225);
  doc.rect(0, 0, 105, 148, 'F');

  // 2. Líneas de marco elegantes (Verde Hoja #3F7D4A y Dorado #D4AF37)
  doc.setDrawColor(63, 125, 74);
  doc.setLineWidth(1.2);
  doc.rect(7, 7, 91, 134);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.rect(9.5, 9.5, 86, 129);

  // 3. Si pusiste un marco completo (/flores/marco-pdf.png), lo estampa en toda la tarjeta;
  // si solo pusiste el ramillete (/flores/flores-esquina.png), lo ubica en las esquinas.
  if (marcoCompletoImg) {
    doc.addImage(marcoCompletoImg, 'PNG', 0, 0, 105, 148);
  } else if (florEsquinaImg) {
    doc.addImage(florEsquinaImg, 'PNG', 2, 2, 32, 24);
    doc.addImage(florEsquinaImg, 'PNG', 71, 2, 32, 24);
    doc.addImage(florEsquinaImg, 'PNG', 2, 122, 32, 24);
  }

  // 4. Encabezado del Evento
  doc.setTextColor(212, 175, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('PASE PERSONAL DE INVITADO', 52.5, 23, { align: 'center' });

  doc.setTextColor(63, 125, 74);
  doc.setFontSize(22);
  doc.text(`XV ${nombreQuince}`, 52.5, 33, { align: 'center' });

  doc.setDrawColor(212, 175, 55);
  doc.line(26, 37.5, 79, 37.5);

  // 5. Fecha y Lugar
  doc.setTextColor(107, 79, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    `${fechaVisual.diaSemana} ${fechaVisual.diaNumero} DE ${fechaVisual.mes} ${fechaVisual.anio}`,
    52.5,
    45,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(horarioYLugar, 52.5, 51.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text(direccion, 52.5, 56.5, { align: 'center', maxWidth: 74 });

  // 6. Caja con Datos del Invitado
  doc.setFillColor(255, 253, 247);
  doc.setDrawColor(231, 215, 177);
  doc.roundedRect(14, 63, 75, 50, 3, 3, 'FD');

  doc.setTextColor(63, 125, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INVITADO CONFIRMADO:', 48, 71, { align: 'center' });

  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(13.5);
  doc.text(`${invitado.nombre} ${invitado.apellido}`, 48, 80, {
    align: 'center',
    maxWidth: 62
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Menú: ${invitado.dieta}`, 48, 90, { align: 'center' });

  if (invitado.cancion && invitado.cancion !== 'No aplica') {
    doc.setFontSize(7.5);
    doc.text(`Canción DJ: "${invitado.cancion}"`, 48, 97, {
      align: 'center',
      maxWidth: 60
    });
  }

  doc.setTextColor(91, 166, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`CÓDIGO DE INGRESO: #${invitado.idCorto}`, 48, 107, { align: 'center' });

  // 7. Imagen real de la Princesa Tiana en el costado derecho inferior
  if (tianaImg) {
    doc.addImage(tianaImg, 'PNG', 71, 88, 26, 42);
  }

  // 8. Nota al pie
  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.text('Presentá esta invitación en la recepción del salón.', 52.5, 128, {
    align: 'center'
  });

  const fileName = `Invitacion_XV_${nombreQuince}_${invitado.nombre}_${invitado.apellido}.pdf`.replace(
    /\s+/g,
    '_'
  );
  doc.save(fileName);
};