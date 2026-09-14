# Wattio

## Product

Wattio ayuda a las personas a detectar si están pagando de más por su factura de electricidad. El usuario envía una foto o PDF de su factura y Wattio analiza la información para orientarle hacia una opción potencialmente más económica.

La primera experiencia debe poder comenzar desde una landing y llevar al usuario a una acción sencilla: subir la factura o iniciar una conversación por WhatsApp.

## Primary audience

Personas particulares en España que reciben una factura eléctrica, sospechan que pagan demasiado y no quieren enfrentarse a llamadas comerciales, formularios largos o lenguaje técnico.

## Primary goal

Convertir visitas en solicitudes de análisis de factura.

## Primary CTA

Enviar mi factura

## Secondary CTA

Hablar por WhatsApp

## Product promise

Entender si puedes ahorrar en tu factura sin complicarte.

La promesa debe presentarse como una estimación o revisión, no como un ahorro garantizado. No se deben inventar cifras, tarifas, partners ni resultados sin datos reales.

## Trust principles

- Explicar el proceso en pocos pasos.
- Ser transparente sobre qué datos se necesitan y para qué.
- Evitar la sensación de llamada comercial agresiva.
- Mostrar protección de datos y consentimiento de forma clara.
- Usar lenguaje cotidiano, directo y en español.
- Mantener el flujo corto: factura, contacto y resultado o siguiente paso.

## Initial scope

- Landing pública en Astro desplegable en Vercel.
- Hero orientado a subir una factura.
- Explicación visual del proceso.
- Formulario con email de contacto y factura adjunta.
- Endpoint server-side que envía la factura a Wattio mediante Resend.
- Confirmación inmediata en pantalla después de un envío correcto.
- CTA de WhatsApp con número verificado y mensaje preparado.
- Bloque de confianza, privacidad y preguntas frecuentes.

## Out of scope for now

- Supabase.
- Autenticación.
- Panel privado.
- Cálculo real de tarifas.
- Email automático de confirmación al usuario.
- Promesas de ahorro cuantificadas sin datos validados.
