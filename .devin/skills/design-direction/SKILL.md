---
name: design-direction
description: Define a distinctive visual direction before implementation
argument-hint: "[brand or product context]"
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

Define una dirección visual concreta para este proyecto antes de implementar nuevas secciones.

1. Inspecciona el contexto del producto y los archivos existentes.
2. Resume objetivo, audiencia, acción principal y personalidad de marca.
3. Define una propuesta visual sencilla pero distintiva: tipografía, paleta, composición, espaciado, bordes, imágenes, iconografía y movimiento.
4. Define la estructura de la página y la jerarquía de cada viewport.
5. Especifica qué decisiones evitarán un resultado genérico.
6. Define reglas que los agentes de implementación y QA deberán respetar.

No generes código en esta skill salvo que sea necesario para documentar tokens o ejemplos. Entrega un brief accionable, con decisiones y trade-offs explícitos.
