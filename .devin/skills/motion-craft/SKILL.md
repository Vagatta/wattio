---
name: motion-craft
description: Diseñar microinteracciones Wattio con propósito, teclado y movimiento reducido; skill local, no paquete externo
---

# Motion craft para Wattio

Skill original del proyecto. No es una distribución de Impeccable ni de otra librería.

Antes de animar, define el gesto del usuario, el cambio que debe entender y la alternativa estática. Prioriza una sola interacción memorable ligada a la factura y al rayo, no efectos repetidos en cada sección.

- Mantén Astro y JavaScript nativo; no añadas React, WebGL ni librerías de scroll para efectos sencillos.
- Diseña estados inicial, hover, focus-visible, activo, éxito local y error.
- Usa controles nativos y una alternativa de teclado para cada gesto de arrastre.
- Nunca secuestres el scroll, escondas el cursor ni uses movimiento continuo para atraer atención.
- Anima transform y opacity; respeta prefers-reduced-motion en CSS y JavaScript.
- Limita cualquier entrada automática a un único pase corto. No ocultes contenido si JavaScript falla.
- No representes una factura seleccionada como enviada ni un ejemplo como ahorro calculado.
- Verifica anchuras estrechas, zoom, teclado y movimiento reducido en navegador. Describe qué comprobaste realmente.
