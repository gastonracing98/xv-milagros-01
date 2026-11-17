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

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.save();
        ctx.translate(flipX ? canvas.width : 0, flipY ? canvas.height : 0);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        ctx.restore();

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

// 1. Extraemos la carga de assets para usarla en ambos formatos (PDF y JPG)
const loadInvitationAssets = async () => {
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
  
  return { esquinaTopLeft, esquinaTopRight, esquinaBottomLeft, lateralIzq, lateralDer, tianaImg };
};

// Función auxiliar para dibujar dataUrl en Canvas (Usada por el JPG)
const loadImgElement = (dataUrl) => {
  return new Promise((resolve) => {
    if (!dataUrl) resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });
};
// ==========================================
// EXPORT 1: Generar JPG (Súper ligero para WhatsApp)
// ==========================================
export const generateInvitationJPG = async (invitado) => {
  const assets = await loadInvitationAssets();
  const { nombre: nombreQuince, fechaVisual } = config.quinceanera;
  const { horarioYLugar, direccion } = config.ubicacion;

  const s = 12; // Escala: 12 píxeles por milímetro
  const width = 105 * s;
  const height = 148 * s;
  const CENTER_X = 52.5 * s;
  const pt = 0.3527 * s;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Fondo
  ctx.fillStyle = '#F8F1E1';
  ctx.fillRect(0, 0, width, height);

  // 2. Marcos exteriores
  ctx.strokeStyle = '#3F7D4A';
  ctx.lineWidth = 1.1 * s;
  ctx.strokeRect(7.5 * s, 7.5 * s, 90 * s, 133 * s);

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 0.4 * s;
  ctx.strokeRect(9.8 * s, 9.8 * s, 85.4 * s, 128.4 * s);

  // Helper para imágenes
  const drawImg = async (asset, x, y, baseWidth, baseHeight) => {
    if (!asset) return;
    const img = await loadImgElement(asset.dataUrl);
    const finalWidth = baseWidth ? (baseWidth * s) : (baseHeight * asset.ratio * s);
    const finalHeight = baseHeight ? (baseHeight * s) : (baseWidth / asset.ratio * s);
    ctx.drawImage(img, x * s, y * s, finalWidth, finalHeight);
  };

  // 3. Dibujar assets florales
  await drawImg(assets.lateralIzq, 2, 46, null, 56);
  await drawImg(assets.lateralDer, 105 - 2 - (52 * assets.lateralDer.ratio), 44, null, 52);
  await drawImg(assets.esquinaTopLeft, 1.5, 1.5, 34, null);
  await drawImg(assets.esquinaTopRight, 105 - 1.5 - 34, 1.5, 34, null);
  await drawImg(assets.esquinaBottomLeft, 1.5, 148 - 1.5 - (34 / assets.esquinaBottomLeft?.ratio || 1), 34, null);

  // Helper para textos
  const drawText = (text, y, font, sizePt, color, isBold, maxWidth = null) => {
    ctx.fillStyle = color;
    ctx.font = `${isBold ? 'bold ' : ''}${sizePt * pt}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (maxWidth) {
      ctx.fillText(text, CENTER_X, y * s, maxWidth * s);
    } else {
      ctx.fillText(text, CENTER_X, y * s);
    }
  };

  // 4. Textos Header
  drawText('PASE PERSONAL DE INVITADO', 25, '"Times New Roman", serif', 9, '#D4AF37', true);
  drawText(`XV ${nombreQuince}`, 34.5, 'Arial, sans-serif', 21, '#3F7D4A', false);
  
  ctx.beginPath();
  ctx.moveTo(27 * s, 38.5 * s);
  ctx.lineTo(78 * s, 38.5 * s);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 0.5 * s;
  ctx.stroke();

  // 5. Fecha y Lugar
  drawText(`${fechaVisual.diaSemana} ${fechaVisual.diaNumero} DE ${fechaVisual.mes} ${fechaVisual.anio}`, 46, 'Arial, sans-serif', 9.5, '#6B4F3A', true);
  drawText(horarioYLugar, 52.5, 'Arial, sans-serif', 8.5, '#6B4F3A', false, 72);
  if (direccion) drawText(direccion, 57.5, 'Arial, sans-serif', 7.5, '#6B4F3A', false, 70);

  // 6. Caja Central
  ctx.fillStyle = '#FFFCF5';
  ctx.strokeStyle = '#E7D7B1';
  ctx.lineWidth = 0.5 * s;
  const rx = 15 * s, ry = 62 * s, rw = 75 * s, rh = 50 * s, rad = 3 * s;
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, rad);
  ctx.fill();
  ctx.stroke();

  // 7. Textos del Invitado
  drawText('INVITADO CONFIRMADO:', 70.5, 'Arial, sans-serif', 8, '#3F7D4A', true);
  drawText(`${invitado.nombre} ${invitado.apellido}`, 79.5, '"Times New Roman", serif', 13.5, '#6B4F3A', true, 68);
  drawText(`Menú: ${invitado.dieta}`, 89, 'Arial, sans-serif', 8.5, '#6B4F3A', false);
  if (invitado.cancion && invitado.cancion !== 'No aplica') {
    drawText(`Canción DJ: "${invitado.cancion}"`, 96, 'Arial, sans-serif', 7.5, '#6B4F3A', false, 64);
  }
  drawText(`CÓDIGO DE INGRESO: #${invitado.idCorto}`, 106, 'Arial, sans-serif', 7.5, '#5BA66B', true);

  // 8. Nota al pie
  ctx.fillStyle = '#6B4F3A';
  ctx.font = `italic ${8 * pt}px "Times New Roman", serif`;
  ctx.fillText('Presentá esta invitación en la recepción del salón.', CENTER_X, 119 * s);

  // 9. DIBUJAR A TIANA AL FINAL (Para que cubra la esquina de la caja central)
  if (assets.tianaImg) {
    const tw = 40 * assets.tianaImg.ratio;
    await drawImg(assets.tianaImg, 105 - tw - 2, 148 - 40 - 2.5, tw, 40);
  }

  // 10. Descargar el JPG
  const link = document.createElement('a');
  link.download = `Invitacion_XV_${nombreQuince}_${invitado.nombre}_${invitado.apellido}.jpg`.replace(/\s+/g, '_');
  link.href = canvas.toDataURL('image/jpeg', 0.8); 
  link.click();
};


// ==========================================
// EXPORT 2: Generar PDF (El formato original)
// ==========================================
export const generateInvitationPdf = async (invitado) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [105, 148],
    compress: true
  });

  const { nombre: nombreQuince, fechaVisual } = config.quinceanera;
  const { horarioYLugar, direccion } = config.ubicacion;

  // Reutilizamos la misma función de carga de imágenes para el PDF
  const assets = await loadInvitationAssets();
  const { esquinaTopLeft, esquinaTopRight, esquinaBottomLeft, lateralIzq, lateralDer, tianaImg } = assets;

  const CENTER_X = 52.5;

  // 1. Fondo
  doc.setFillColor(248, 241, 225);
  doc.rect(0, 0, 105, 148, 'F');

  // 2. Marcos
  doc.setDrawColor(63, 125, 74);
  doc.setLineWidth(1.1);
  doc.rect(7.5, 7.5, 90, 133);

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.rect(9.8, 9.8, 85.4, 128.4);

  // 3. Estampar MarcoLateral
  if (lateralIzq) {
    const latHeight = 56;
    const latWidth = latHeight * lateralIzq.ratio;
    doc.addImage(lateralIzq.dataUrl, 'PNG', 2, 46, latWidth, latHeight, 'lat_izq', 'FAST');
  }
  if (lateralDer) {
    const latHeight = 52;
    const latWidth = latHeight * lateralDer.ratio;
    doc.addImage(lateralDer.dataUrl, 'PNG', 105 - 2 - latWidth, 44, latWidth, latHeight, 'lat_der', 'FAST');
  }

  // 4. Estampar MarcoEsquina
  const cornerWidth = 34;
  if (esquinaTopLeft) {
    const cornerHeight = cornerWidth / esquinaTopLeft.ratio;
    doc.addImage(esquinaTopLeft.dataUrl, 'PNG', 1.5, 1.5, cornerWidth, cornerHeight, 'esq_tl', 'FAST');
  }
  if (esquinaTopRight) {
    const cornerHeight = cornerWidth / esquinaTopRight.ratio;
    doc.addImage(esquinaTopRight.dataUrl, 'PNG', 105 - 1.5 - cornerWidth, 1.5, cornerWidth, cornerHeight, 'esq_tr', 'FAST');
  }
  if (esquinaBottomLeft) {
    const cornerHeight = cornerWidth / esquinaBottomLeft.ratio;
    doc.addImage(esquinaBottomLeft.dataUrl, 'PNG', 1.5, 148 - 1.5 - cornerHeight, cornerWidth, cornerHeight, 'esq_bl', 'FAST');
  }

  // 5. Encabezado
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
  doc.text(`${fechaVisual.diaSemana} ${fechaVisual.diaNumero} DE ${fechaVisual.mes} ${fechaVisual.anio}`, CENTER_X, 46, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(horarioYLugar, CENTER_X, 52.5, { align: 'center', maxWidth: 72 });
  if (direccion) {
    doc.setFontSize(7.5);
    doc.text(direccion, CENTER_X, 57.5, { align: 'center', maxWidth: 70 });
  }

  // 7. Caja Central
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
  doc.text(`${invitado.nombre} ${invitado.apellido}`, CENTER_X, 79.5, { align: 'center', maxWidth: 68 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Menú: ${invitado.dieta}`, CENTER_X, 89, { align: 'center' });

  if (invitado.cancion && invitado.cancion !== 'No aplica') {
    doc.setFontSize(7.5);
    doc.text(`Canción DJ: "${invitado.cancion}"`, CENTER_X, 96, { align: 'center', maxWidth: 64 });
  }

  doc.setTextColor(91, 166, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`CÓDIGO DE INGRESO: #${invitado.idCorto}`, CENTER_X, 106, { align: 'center' });

  // 8. Nota
  doc.setTextColor(107, 79, 58);
  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.text('Presentá esta invitación en la recepción del salón.', CENTER_X, 119, { align: 'center' });

  // 9. Tiana
  if (tianaImg) {
    const tianaHeight = 40;
    const tianaWidth = tianaHeight * tianaImg.ratio;
    doc.addImage(tianaImg.dataUrl, 'PNG', 105 - tianaWidth - 2, 148 - tianaHeight - 2.5, tianaWidth, tianaHeight, 'tiana_img', 'FAST');
  }

  const fileName = `Invitacion_XV_${nombreQuince}_${invitado.nombre}_${invitado.apellido}.pdf`.replace(/\s+/g, '_');
  doc.save(fileName);
};