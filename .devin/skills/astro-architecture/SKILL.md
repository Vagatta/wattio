---
name: astro-architecture
description: Establish and review a fast Astro architecture with minimal client JavaScript
argument-hint: "[feature or route]"
model: opus
allowed-tools:
  - read
  - edit
  - grep
  - glob
  - exec
triggers:
  - user
  - model
---

Revisa o diseña la arquitectura Astro para la funcionalidad indicada.

1. Inspecciona el stack y la estructura actual.
2. Decide si la ruta debe ser static, server o hybrid y justifica la decisión.
3. Mantén la mayor parte del contenido en Astro Components.
4. Añade islas únicamente para interacción real y elige la directiva client adecuada.
5. Separa componentes, datos, servicios, tipos y estilos de forma coherente.
6. Revisa SEO, accesibilidad, rendimiento, responsive y carga de fuentes e imágenes.
7. Si aparece Supabase, mantén el acceso sensible en servidor y documenta las variables necesarias sin exponer secretos.

Si se solicita implementación, aplica el cambio mínimo y ejecuta las verificaciones existentes. No añadas un framework de UI o una dependencia sin una razón concreta.
