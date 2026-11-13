import { jsPDF } from 'jspdf';
import config from '../data/eventConfig.json';

/**
 * Carga la imagen, la redimensiona a una resolución óptima (300 DPI para A6)
 * para evitar PDFs pesados, permite espejarla y quita el fondo negro si existe.
 */
const loadImageProcessed = (
  urls,
  { flipX = false, flipY = false, removeBlackBg = true, maxDim = 500 } = {}
) => {
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
        // Redimensionamos manteniendo la proporción exacta para no superar maxDim
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth > maxDim || targetHeight > maxDim) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
            targetHeight = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // Suavizado de alta calidad al escalar
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.save();
        ctx.translate(flipX ? canvas.width : 0, flipY ? canvas.height : 0);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        ctx.restore();

        // Si la imagen tiene fondo negro opaco, lo hace transparente
        if (removeBlackBg) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const isBlackCorner =
            data[0] < 20 && data[1] < 20 && data[2] < 20 && data[3] === 255;

          if (isBlackCorner) {
            for (let i = 0; i < data.length; i += 4) {
              const maxChannel = Math.max(data[i], data[i + 1], data[i + 2]);
              if (maxChannel < 18) {
                data[i + 3] = 0;
              } else if (maxChannel < 45) {
                data[i + 3] = Math.round(((maxChannel - 18) / 27) * 255);
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }
        }

        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: targetWidth,
          height: targetHeight,
          ratio: img.width / img.height
        });
      };

      img.onerror = () => resolve(tryLoad(index + 1));
      img.src = urlList[index];
    });

  return tryLoad(0);
};

export const generateInvitationPdf = async (invitado) => {
  // Tamaño A6 vertical (105mm x 148mm) con compresión interna activada
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148],
    compress: true
  });

  const { nombre: nombreQuince, fechaVisual } = config.quinceanera;
  const { horarioYLugar, direccion } = config.ubicacion;

  const rutasEsquina = [
    '/flores/MarcoEsquina.png',
    '/flores/MarcoEsquina.jpg',
    '/MarcoEsquina.png',
    '/MarcoEsquina.jpg'
  ];
  const rutasLateral = [
    '/flores/MarcoLateral.png',
    '/flores/MarcoLateral.jpg',
    '/MarcoLateral.png',
    '/MarcoLateral.jpg'
  ];
  const rutasTiana = ['/TIANA.png', '/flores/TIANA.png', '/flores/tiana.png', '/tiana.png'];

  // Cargamos las imágenes optimizadas en paralelo
  const [
    esquinaTopLeft,
    esquinaTopRight,
    esquinaBottomLeft,
    lateralIzq,
    lateralDer,
    tianaImg
  ] = await Promise.all([
    loadImageProcessed(rutasEsquina, { maxDim: 450 }),
    loadImageProcessed(rutasEsquina, { flipX: true, maxDim: 450 }),
    loadImageProcessed(rutasEsquina, { flipY: true, maxDim: 450 }),
    loadImageProcessed(rutasLateral, { maxDim: 500 }),
    loadImageProcessed(rutasLateral, { flipX: true, maxDim: 500 }),
    loadImageProcessed(rutasTiana, { removeBlackBg: false, maxDim: 600 })
  ]);

  const CENTER_X = 52.5; // Centro exacto de la tarjeta de 105mm

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

  // 3. Estampar MarcoLateral con compresión 'FAST'
  if (lateralIzq) {
    const latHeight = 56;
    const latWidth = latHeight * lateralIzq.ratio;
    doc.addImage(lateralIzq.dataUrl, 'PNG', 2, 46, latWidth, latHeight, 'lat_izq', 'FAST');
  }
  if (lateralDer) {
    const latHeight = 52;
    const latWidth = latHeight * lateralDer.ratio;
    doc.addImage(
      lateralDer.dataUrl,
      'PNG',
      105 - 2 - latWidth,
      44,
      latWidth,
      latHeight,
      'lat_der',
      'FAST'
    );
  }

  // 4. Estampar MarcoEsquina en las 3 esquinas con compresión 'FAST'
  const cornerWidth = 34;
  if (esquinaTopLeft) {
    const cornerHeight = cornerWidth / esquinaTopLeft.ratio;
    doc.addImage(
      esquinaTopLeft.dataUrl,
      'PNG',
      1.5,
      1.5,
      cornerWidth,
      cornerHeight,
      'esq_tl',
      'FAST'
    );
  }
  if (esquinaTopRight) {
    const cornerHeight = cornerWidth / esquinaTopRight.ratio;
    doc.addImage(
      esquinaTopRight.dataUrl,
      'PNG',
      105 - 1.5 - cornerWidth,
      1.5,
      cornerWidth,
      cornerHeight,
      'esq_tr',
      'FAST'
    );
  }
  if (esquinaBottomLeft) {
    const cornerHeight = cornerWidth / esquinaBottomLeft.ratio;
    doc.addImage(
      esquinaBottomLeft.dataUrl,
      'PNG',
      1.5,
      148 - 1.5 - cornerHeight,
      cornerWidth,
      cornerHeight,
      'esq_bl',
      'FAST'
    );
  }

  // 5. Encabezado del Evento
  doc.setTextColor(212, 175, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('PASE PERSONAL DE INVITADO', CENTER_X, 25, { align: 'center' });

  doc.setTextColor(63, 125, 74);
  doc.setFontSize(21);
  doc.text(`XV ${nombreQuince}`, CENTER_X, 34.5, { align: 'center' });

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(27, 38.5, 78, 38.5);

  // 6. Fecha y Lugar
  doc.setTextColor(107, 79, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(
    `${fechaVisual.diaSemana} ${fechaVisual.diaNumero} DE ${fechaVisual.mes} ${fechaVisual.anio}`,
    CENTER_X,
    46,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(horarioYLugar, CENTER_X, 52.5, { align: 'center', maxWidth: 72 });
  if (direccion) {
    doc.setFontSize(7.5);
    doc.text(direccion, CENTER_X, 57.5, { align: 'center', maxWidth: 70 });
  }

  // 7. Caja Central con los Datos del Invitado (100% centrada en x = 52.5)
  doc.setFillColor(255, 253, 247);
  doc.setDrawColor(231, 215, 177);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 62, 75, 50, 3, 3, 'FD');

  doc.setTextColor(63, 125, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INVITADO CONFIRMADO:', CENTER_X, 70.5, { align: 'center' });

  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(13.5);
  doc.text(`${invitado.nombre} ${invitado.apellido}`, CENTER_X, 79.5, {
    align: 'center',
    maxWidth: 68
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Menú: ${invitado.dieta}`, CENTER_X, 89, { align: 'center' });

  if (invitado.cancion && invitado.cancion !== 'No aplica') {
    doc.setFontSize(7.5);
    doc.text(`Canción DJ: "${invitado.cancion}"`, CENTER_X, 96, {
      align: 'center',
      maxWidth: 64
    });
  }

  doc.setTextColor(91, 166, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`CÓDIGO DE INGRESO: #${invitado.idCorto}`, CENTER_X, 106, { align: 'center' });

  // 8. Nota al pie centrada
  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('Presentá esta invitación en la recepción del salón.', CENTER_X, 119, {
    align: 'center'
  });

  // 9. Princesa Tiana en la esquina inferior derecha con compresión 'FAST'
  if (tianaImg) {
    const tianaHeight = 40;
    const tianaWidth = tianaHeight * tianaImg.ratio;
    doc.addImage(
      tianaImg.dataUrl,
      'PNG',
      105 - tianaWidth - 2,
      148 - tianaHeight - 2.5,
      tianaWidth,
      tianaHeight,
      'tiana_img',
      'FAST'
    );
  }

  const fileName = `Invitacion_XV_${nombreQuince}_${invitado.nombre}_${invitado.apellido}.pdf`.replace(
    /\s+/g,
    '_'
  );
  doc.save(fileName);
};