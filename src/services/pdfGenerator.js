import { jsPDF } from 'jspdf';
import config from '../data/eventConfig.json';

/**
 * Carga una imagen probando múltiples rutas posibles (.png / .jpg),
 * permite espejarla (flipX / flipY), quita el fondo negro si es un JPG sin transparencia
 * y devuelve su proporción original (ratio) para no deformarla en jsPDF.
 */
const loadImageProcessed = (urls, { flipX = false, flipY = false, removeBlackBg = true } = {}) => {
  const urlList = Array.isArray(urls) ? urls : [urls];

  const tryLoad = (index) =>
    new Promise((resolve) => {
      if (index >= urlList.length) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.save();
        ctx.translate(flipX ? canvas.width : 0, flipY ? canvas.height : 0);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        // Si la imagen tiene fondo negro opaco (como en un .jpg), lo hace transparente
        if (removeBlackBg) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          // Verificamos si el píxel de la esquina (0,0) es negro y opaco
          const isBlackCorner = data[0] < 20 && data[1] < 20 && data[2] < 20 && data[3] === 255;

          if (isBlackCorner) {
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const maxChannel = Math.max(r, g, b);

              if (maxChannel < 18) {
                data[i + 3] = 0; // Transparente total
              } else if (maxChannel < 45) {
                // Suavizado en los bordes para evitar halo oscuro
                data[i + 3] = Math.round(((maxChannel - 18) / 27) * 255);
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }
        }

        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: img.width,
          height: img.height,
          ratio: img.width / img.height
        });
      };

      img.onerror = () => resolve(tryLoad(index + 1));
      img.src = urlList[index];
    });

  return tryLoad(0);
};

export const generateInvitationPdf = async (invitado) => {
  // Tamaño A6 vertical (105mm x 148mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148]
  });

  const { nombre: nombreQuince, fechaVisual } = config.quinceanera;
  const { horarioYLugar, direccion } = config.ubicacion;

  const rutasEsquina = [
    '/flores/MarcoEsquina.png',
    '/flores/MarcoEsquina.jpg',
    '/flores/MarcoEsquina.png',
    '/flores/MarcoEsquina.jpg'
  ];
  const rutasLateral = [
    '/flores/MarcoLateral.png',
    '/flores/MarcoLateral.jpg',
    '/MarcoLateral.png',
    '/MarcoLateral.jpg'
  ];
  const rutasTiana = ['/TIANA.png', '/flores/TIANA.png', '/flores/tiana.png', '/tiana.png'];

  // Cargamos las variantes de esquina, laterales y Tiana en paralelo
  const [
    esquinaTopLeft,
    esquinaTopRight,
    esquinaBottomLeft,
    lateralIzq,
    lateralDer,
    tianaImg
  ] = await Promise.all([
    loadImageProcessed(rutasEsquina),
    loadImageProcessed(rutasEsquina, { flipX: true }),
    loadImageProcessed(rutasEsquina, { flipY: true }),
    loadImageProcessed(rutasLateral),
    loadImageProcessed(rutasLateral, { flipX: true }),
    loadImageProcessed(rutasTiana, { removeBlackBg: false })
  ]);

  // 1. Fondo Crema Marfil (#F8F1E1)
  doc.setFillColor(248, 241, 225);
  doc.rect(0, 0, 105, 148, 'F');

  // 2. Doble línea de marco elegante (Verde Hoja #3F7D4A y Dorado #D4AF37)
  doc.setDrawColor(63, 125, 74);
  doc.setLineWidth(1.1);
  doc.rect(7.5, 7.5, 90, 133);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.rect(9.8, 9.8, 85.4, 128.4);

  // 3. Estampar MarcoLateral en ambos costados respetando su proporción
  if (lateralIzq) {
    const latHeight = 56;
    const latWidth = latHeight * lateralIzq.ratio;
    doc.addImage(lateralIzq.dataUrl, 'PNG', 2, 46, latWidth, latHeight);
  }
  if (lateralDer) {
    const latHeight = 52;
    const latWidth = latHeight * lateralDer.ratio;
    doc.addImage(lateralDer.dataUrl, 'PNG', 105 - 2 - latWidth, 44, latWidth, latHeight);
  }

  // 4. Estampar MarcoEsquina en las 3 esquinas libres respetando su proporción
  const cornerWidth = 34;
  if (esquinaTopLeft) {
    const cornerHeight = cornerWidth / esquinaTopLeft.ratio;
    doc.addImage(esquinaTopLeft.dataUrl, 'PNG', 1.5, 1.5, cornerWidth, cornerHeight);
  }
  if (esquinaTopRight) {
    const cornerHeight = cornerWidth / esquinaTopRight.ratio;
    doc.addImage(esquinaTopRight.dataUrl, 'PNG', 105 - 1.5 - cornerWidth, 1.5, cornerWidth, cornerHeight);
  }
  if (esquinaBottomLeft) {
    const cornerHeight = cornerWidth / esquinaBottomLeft.ratio;
    doc.addImage(esquinaBottomLeft.dataUrl, 'PNG', 1.5, 148 - 1.5 - cornerHeight, cornerWidth, cornerHeight);
  }

  // 5. Encabezado del Evento (Despejado, sin el recuadro de MarcoCompleto1)
  doc.setTextColor(212, 175, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('PASE PERSONAL DE INVITADO', 52.5, 25, { align: 'center' });

  doc.setTextColor(63, 125, 74);
  doc.setFontSize(21);
  doc.text(`XV ${nombreQuince}`, 52.5, 34.5, { align: 'center' });

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(27, 38.5, 78, 38.5);

  // 6. Fecha y Lugar
  doc.setTextColor(107, 79, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    `${fechaVisual.diaSemana} ${fechaVisual.diaNumero} DE ${fechaVisual.mes} ${fechaVisual.anio}`,
    52.5,
    46,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(horarioYLugar, 52.5, 52.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text(direccion, 52.5, 57.5, { align: 'center', maxWidth: 70 });

  // 7. Caja Central con los Datos del Invitado
  doc.setFillColor(255, 253, 247);
  doc.setDrawColor(231, 215, 177);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 64, 75, 50, 3, 3, 'FD');

  // Centramos el texto ligeramente a la izquierda (x = 47) para dejar espacio limpio a Tiana a la derecha
  const textCenterX = 47;

  doc.setTextColor(63, 125, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INVITADO CONFIRMADO:', textCenterX, 72.5, { align: 'center' });

  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(13.5);
  doc.text(`${invitado.nombre} ${invitado.apellido}`, textCenterX, 81.5, {
    align: 'center',
    maxWidth: 56
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Menú: ${invitado.dieta}`, textCenterX, 91, { align: 'center' });

  if (invitado.cancion && invitado.cancion !== 'No aplica') {
    doc.setFontSize(7.5);
    doc.text(`Canción DJ: "${invitado.cancion}"`, textCenterX, 98, {
      align: 'center',
      maxWidth: 54
    });
  }

  doc.setTextColor(91, 166, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`CÓDIGO DE INGRESO: #${invitado.idCorto}`, textCenterX, 108, { align: 'center' });

  // 8. Nota al pie (ubicada arriba del borde inferior para no chocar con las flores)
  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.text('Presentá esta invitación en la recepción del salón.', 46, 123, {
    align: 'center'
  });

  // 9. Princesa Tiana en el costado derecho inferior con su proporción exacta (sin alargar)
  if (tianaImg) {
    const tianaHeight = 42;
    const tianaWidth = tianaHeight * tianaImg.ratio; // Calcula ~34.5mm automáticamente
    doc.addImage(
      tianaImg.dataUrl,
      'PNG',
      105 - tianaWidth - 2.5,
      148 - tianaHeight - 3,
      tianaWidth,
      tianaHeight
    );
  }

  const fileName = `Invitacion_XV_${nombreQuince}_${invitado.nombre}_${invitado.apellido}.pdf`.replace(
    /\s+/g,
    '_'
  );
  doc.save(fileName);
};