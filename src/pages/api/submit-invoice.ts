import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const OWNER_EMAIL = 'diego.sanmiguel.delpozo1314@gmail.com';
const MAX_TOTAL_SIZE = 4 * 1024 * 1024;
const MAX_FILES = 10;
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
  const files = form.getAll('invoice').filter((value): value is File => value instanceof File);

  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: 'Introduce un email válido para poder contactarte.' }, 422);
  }
  if (!files.length) {
    return json({ error: 'Selecciona al menos una factura en PDF, JPG o PNG.' }, 422);
  }
  if (files.length > MAX_FILES) {
    return json({ error: `Puedes enviar hasta ${MAX_FILES} archivos.` }, 422);
  }
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return json({ error: 'El tamaño total de las facturas no puede superar los 4 MB.' }, 422);
  }
  const invalidFile = files.find(file => file.size === 0 || !ALLOWED_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.test(file.name));
  if (invalidFile) {
    return json({ error: `«${invalidFile.name}» no es un PDF, JPG o PNG válido o está vacío.` }, 422);
  }

  const attachments = await Promise.all(files.map(async file => ({
    filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120),
    content: Buffer.from(await file.arrayBuffer()).toString('base64'),
  })));
  const resend = new Resend(apiKey);

  const requestId = crypto.randomUUID();

  try {
    const { error } = await resend.emails.send({
      from,
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `Nueva factura Wattio — ${email}`,
      text: `El usuario ${email} ha enviado ${files.length} factura${files.length === 1 ? '' : 's'} para revisión. Se adjuntan a este email.`,
      html: `<p>El usuario <strong>${email.replace(/[&<>"']/g, '')}</strong> ha enviado ${files.length} factura${files.length === 1 ? '' : 's'} para revisión.</p><p>Se adjuntan todos los archivos a este email.</p>`,
      attachments,
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
