# Wattio

## Producto y diseño

Landing Astro estática en español, sin Supabase ni backend. Mantener el nombre Wattio y el rayo reconocible. La referencia del menú es estética, no una fuente de números de teléfono, enlaces ni promesas comerciales.

La selección de archivos es local: no presentar documentos como enviados, ni ejemplos como análisis reales. No inventar ahorros, gratuidad, testimonios o tiempos de respuesta. WhatsApp autorizado por el usuario: +34646583077. Usar enlaces wa.me con mensaje fijo; la factura seleccionada localmente no se adjunta automáticamente. No cambiar el número sin confirmación.

## Skills

`.devin/skills/frontend-design/` contiene la skill externa de Anthropic con licencia y procedencia en source.json. `motion-craft` y `browser-quality` son skills originales del proyecto. La skill llamada `impeccable` es una adaptación local anterior, NO el paquete oficial ni sus detectores.

## Implementación y verificación

- Astro Components y JavaScript nativo; no React ni librerías de animación para interacciones sencillas.
- Iconos compartidos: src/components/Icon.astro. Sistema visual: src/styles/wattio.css.
- Fuente Manrope alojada localmente mediante @fontsource-variable/manrope.
- Build: `npm.cmd run build` en PowerShell, `npm run build` en otros shells.
- Pruebas Chromium: `npm.cmd run test:ui`. Compila y verifica la versión de producción mediante preview en 127.0.0.1:4322, sin interferir con el dev server. Configuración: .devin/playwright.config.ts.
- Preparar navegador de pruebas si falta: `npx.cmd playwright install chromium`.
- Capturas y resultados en .devin/test-results/, excluidos de Git.
- En esta sesión de Windows el proceso puede conservar un PATH antiguo. Node está en C:\Program Files\nodejs. Añadir esa ruta solo al PATH del proceso si es necesario; usar npm.cmd sin cambiar las políticas de PowerShell.
- Astro 7 impide iniciar dos dev servers para el mismo proyecto. Reutilizar el activo o usar preview de build en otro puerto para aislar pruebas.
- Comprobar anclas bajo el sticky, teclado, menú móvil, 320–1440 px, reduced motion y archivos sintéticos antes de entregar. Un build no sustituye la inspección visual.
