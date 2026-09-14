---
name: impeccable
description: Apply Impeccable-inspired design critique, anti-pattern detection and bounded visual refinement
argument-hint: "[command] [target]"
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

Aplica una revisión de diseño de alta exigencia inspirada en Impeccable para interfaces frontend.

Comandos conceptuales soportados:
- init: captura PRODUCT.md y DESIGN.md si el usuario lo solicita.
- shape: define UX y UI antes de escribir código.
- critique: analiza jerarquía, claridad, composición y consistencia.
- audit: revisa accesibilidad, responsive, rendimiento y antipatrones.
- polish: realiza un pase final de refinamiento.
- bolder: aumenta carácter cuando la interfaz sea tímida o genérica.
- distill: elimina complejidad y elementos sin función.
- animate: propone movimiento con propósito y reduced motion.
- typeset: mejora tipografía y escala.
- layout: corrige ritmo, espaciado y alineación.

Principios obligatorios:
- El brief y la verdad del producto mandan.
- El resultado debe tener un punto de vista visual reconocible.
- Evita tipografías, paletas, tarjetas y composiciones por defecto salvo que estén justificadas.
- No uses agresividad como excusa para sacrificar claridad, accesibilidad o rendimiento.
- Inspecciona primero el contexto existente.
- Haz una pasada acotada de revisión, corrige por impacto y confirma una vez; no entres en un bucle infinito de microajustes.

Si el comando requiere un ejecutable externo de Impeccable y no está instalado, continúa con esta guía local y declara la limitación.
