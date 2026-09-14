import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const OWNER_EMAIL = 'diego.sanmiguel.delpozo1314@gmail.com';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png)$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return json({ error: 'El servicio de envío aún no está configurado.' }, 503);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return json({ error: 'La solicitud debe incluir un formulario multipart.' }, 415);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'No se pudo leer la factura.' }, 400);
  }

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const file = form.get('invoice');

  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: 'Introduce un email válido para poder contactarte.' }, 422);
  }
  if (!(file instanceof File)) {
    return json({ error: 'Selecciona una factura en PDF, JPG o PNG.' }, 422);
  }
  if (file.size === 0) {
    return json({ error: 'El archivo está vacío. Elige otra factura.' }, 422);
  }
  if (file.size > MAX_FILE_SIZE) {
    return json({ error: 'La factura no puede superar los 10 MB.' }, 422);
  }
  if (!ALLOWED_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.test(file.name)) {
    return json({ error: 'Solo aceptamos facturas en PDF, JPG o PNG.' }, 422);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const attachment = Buffer.from(await file.arrayBuffer()).toString('base64');
  const resend = new Resend(apiKey);

  const requestId = crypto.randomUUID();

  try {
    const { error } = await resend.emails.send({
      from,
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `Nueva factura Wattio — ${email}`,
      text: `El usuario ${email} ha enviado una factura para revisión. La factura se adjunta a este email.`,
      html: `<p>El usuario <strong>${email.replace(/[&<>"']/g, '')}</strong> ha enviado una factura para revisión.</p><p>La factura se encuentra adjunta a este email.</p>`,
      attachments: [{ filename: safeName, content: attachment }],
    });

    if (error) {
      console.error('Wattio Resend rejection', {
        requestId,
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
      });
      return json({ error: 'Resend no aceptó el envío. Revisa la configuración del remitente en Vercel.', requestId }, 502);
    }
  } catch (error) {
    console.error('Wattio email transport failure', {
      requestId,
      message: error instanceof Error ? error.message : 'Unknown email transport error',
    });
    return json({ error: 'No se pudo conectar con el servicio de email.', requestId }, 502);
  }

  return json({ ok: true });
};
