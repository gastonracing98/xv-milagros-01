// Configurá estas variables en tu archivo .env local y en el panel de Vercel
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY; // Gratis en web3forms.com
const WHATSAPP_PHONE = import.meta.env.VITE_ADMIN_WHATSAPP;      // Ej: 5491122334455
const CALLMEBOT_KEY = import.meta.env.VITE_CALLMEBOT_API_KEY;    // Gratis en callmebot.com

export const notifyNewRsvp = async (invitado) => {
  const estadoTexto = invitado.asiste === 'si' ? '✅ ASISTIRÁ' : '❌ NO ASISTIRÁ';
const mensajeResumen = [
    `🎉 *Nueva confirmación XV Milagros*`,
    `👤 *Invitado:* ${invitado.nombre} ${invitado.apellido}`,
    `📌 *Estado:* ${estadoTexto}`,
    `🍽️ *Menú:* ${invitado.dieta}`,
    `🎵 *Canción DJ:* ${invitado.cancion || 'Sin especificar'}`,
    `💌 *Mensaje para la 15añera:* ${invitado.mensaje || 'Sin mensaje'}`
  ].join('\n');

  const promesas = [];

  if (WEB3FORMS_KEY) {
    const emailPromise = fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[XV Milagros] ${estadoTexto}: ${invitado.nombre} ${invitado.apellido}`,
        from_name: 'Sistema de Invitaciones XV',
        name: `${invitado.nombre} ${invitado.apellido}`,
        asistencia: estadoTexto,
        menu_especial: invitado.dieta,
        cancion_sugerida: invitado.cancion || 'Ninguna'
      })
    }).catch((err) => console.error('Error enviando email:', err));

    promesas.push(emailPromise);
  }

  if (WHATSAPP_PHONE && CALLMEBOT_KEY) {
    const encodedMsg = encodeURIComponent(mensajeResumen);
    const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE}&text=${encodedMsg}&apikey=${CALLMEBOT_KEY}`;

    const waPromise = fetch(waUrl, { mode: 'no-cors' }).catch((err) =>
      console.error('Error enviando alerta de WhatsApp:', err)
    );

    promesas.push(waPromise);
  }

  await Promise.allSettled(promesas);
};