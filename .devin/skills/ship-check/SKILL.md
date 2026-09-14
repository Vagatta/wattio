---
name: ship-check
description: Run the final quality and release checklist
model: swe
allowed-tools:
  - read
  - grep
  - glob
  - exec
permissions:
  allow:
    - Exec(git)
    - Exec(npm)
    - Exec(pnpm)
    - Exec(yarn)
    - Exec(node)
  deny:
    - Write(**)
triggers:
  - user
---

Ejecuta una revisión de entrega sin modificar archivos.

1. Detecta el package manager y los scripts disponibles.
2. Ejecuta lint, typecheck, tests y build cuando existan.
3. Revisa el estado y diff de git.
4. Comprueba errores de consola o checks de preview disponibles.
5. Revisa accesibilidad básica, responsive y rendimiento evidente.
6. Comprueba que no haya secretos ni cambios accidentales.

Reporta cada paso como PASS, FAIL o NOT RUN, incluye la salida relevante y termina con una decisión: listo o no listo. Si algo falla, explica la corrección recomendada sin editar el proyecto.
