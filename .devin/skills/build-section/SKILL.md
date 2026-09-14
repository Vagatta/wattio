---
name: build-section
description: Build a frontend section while preserving the project visual system
argument-hint: "<section>"
model: swe
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

Implementa la sección solicitada siguiendo la dirección visual aprobada.

1. Inspecciona el stack, scripts, componentes, estilos y assets existentes.
2. Localiza tokens o patrones reutilizables antes de crear estilos nuevos.
3. Implementa la sección con HTML semántico, responsive real y estados interactivos.
4. Mantén un único foco visual y evita añadir elementos decorativos sin función.
5. Comprueba móvil, tablet y escritorio, además de overflow y contenido largo.
6. Ejecuta las verificaciones disponibles y corrige los errores introducidos.

Al finalizar, resume los archivos modificados, las decisiones visuales y las verificaciones ejecutadas.
