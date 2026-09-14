---
name: responsive-audit
description: Audit responsive behavior across mobile, tablet and desktop
argument-hint: "[route or component]"
model: swe
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
---

Audita el comportamiento responsive de la ruta o componente indicado.

Comprueba al menos:
- Viewport móvil estrecho y ancho.
- Tablet y tamaños intermedios.
- Escritorio y pantallas grandes.
- Overflow horizontal, wrapping y truncado.
- Jerarquía, legibilidad y targets táctiles.
- Imágenes, grids, navegación y formularios.
- Estados hover, focus y reduced motion cuando correspondan.

Inspecciona el código y ejecuta las verificaciones disponibles. Devuelve una tabla de hallazgos con severidad, evidencia, archivo afectado y solución propuesta. No cambies código salvo que el usuario lo pida.
