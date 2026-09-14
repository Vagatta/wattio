---
name: visual-review
description: Review visual quality and produce prioritized UI corrections
argument-hint: "[route or area]"
model: opus
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
---

Realiza una revisión visual rigurosa de la ruta o área indicada.

1. Inspecciona implementación, estilos, assets y comandos de preview.
2. Revisa jerarquía, contraste, tipografía, alineación, espaciado, ritmo y densidad.
3. Comprueba que el diseño comunica su propuesta en los primeros segundos.
4. Detecta patrones genéricos, incoherencias y elementos que compiten con el CTA.
5. Evalúa responsive e interacciones a partir del código y de cualquier evidencia de preview disponible.
6. Devuelve hallazgos priorizados por impacto y una corrección concreta para cada uno.

No cambies código durante la revisión. Separa problemas confirmados de recomendaciones opcionales.
