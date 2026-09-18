# Wattios

## Producto y diseño

Landing Astro estática en español desplegada en Hostinger compartido; el único backend es `public/api/submit-invoice.php` (Resend vía REST). Mantener el nombre Wattios y el rayo reconocible. La referencia del menú es estética, no una fuente de números de teléfono, enlaces ni promesas comerciales.

La selección de archivos permite hasta 10 PDF/JPG/PNG con un máximo conjunto de 4 MB (límite prudente para adjuntos de email). No presentar documentos como enviados antes de confirmar el formulario, ni ejemplos como análisis reales. El formulario exige aceptar la política de privacidad: checkbox `privacy` obligatorio en cliente y verificación `$_POST['privacy']` en el PHP. Las copias de email se configuran mediante WATTIO_COPY_EMAILS como BCC (lista separada por comas). Cada envío válido se guarda además en `wattio-submissions/` (fuera del webroot, junto a wattio-secrets.php): una carpeta por envío con fecha + teléfono/email en el nombre, los archivos y un `datos.txt`, más un `registro.csv` acumulativo. No inventar ahorros, gratuidad, testimonios o tiempos de respuesta. WhatsApp autorizado por el usuario: +34688608806. Usar enlaces wa.me con mensaje fijo; la factura seleccionada localmente no se adjunta automáticamente. No cambiar el número sin confirmación.

## Skills

`.devin/skills/frontend-design/` contiene la skill externa de Anthropic con licencia y procedencia en source.json. `motion-craft` y `browser-quality` son skills originales del proyecto. La skill llamada `impeccable` es una adaptación local anterior, NO el paquete oficial ni sus detectores.

## Implementación y verificación

- Astro Components y JavaScript nativo; no React ni librerías de animación para interacciones sencillas.
- Iconos compartidos: src/components/Icon.astro. Sistema visual: src/styles/wattios.css.
- Fuente Manrope alojada localmente mediante @fontsource-variable/manrope.
- Build: `npm.cmd run build` en PowerShell, `npm run build` en otros shells.
- Pruebas Chromium: `npm.cmd run test:ui`. Compila y verifica la aplicación server-side mediante un dev server aislado en 127.0.0.1:4322, sin interferir con el dev server principal. Configuración: .devin/playwright.config.ts.
- Preparar navegador de pruebas si falta: `npx.cmd playwright install chromium`.
- Capturas y resultados en .devin/test-results/, excluidos de Git.
- En esta sesión de Windows el proceso puede conservar un PATH antiguo. Node está en C:\Program Files\nodejs. Añadir esa ruta solo al PATH del proceso si es necesario; usar npm.cmd sin cambiar las políticas de PowerShell.
- Astro 7 impide iniciar dos dev servers para el mismo proyecto. Reutilizar el activo o usar preview de build en otro puerto para aislar pruebas.
- Comprobar anclas bajo el sticky, teclado, menú móvil, 320–1440 px, reduced motion y archivos sintéticos antes de entregar. Un build no sustituye la inspección visual.
