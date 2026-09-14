# Wattio — Design Direction

## Creative direction

Wattio debe sentirse como un detector de sobrecostes convertido en una marca digital rápida, clara y ligeramente desafiante. La interfaz puede ser experimental, pero la acción debe ser obvia: enviar la factura.

La referencia compartida aporta la base correcta: universo oscuro, violeta eléctrico, rayo como símbolo, marca redondeada y comunicación directa. La nueva web no debe ser una copia del flyer; debe convertir esa energía en una experiencia de producto más limpia, confiable y usable.

## Visual thesis

**Tu factura puede estar ocultando dinero. Wattio la pone bajo una luz violeta.**

El hero debe mostrar el problema y la acción en la misma pantalla. No empezar con una explicación corporativa ni con un dashboard ficticio.

## Brand register

- Directo.
- Cercano.
- Tecnológico sin sonar financiero.
- Desafiante, no agresivo con el usuario.
- Optimista y orientado a una acción inmediata.

## Color system

- Ink: `#120B2E` — fondo principal casi negro con matiz violeta.
- Night: `#211044` — superficies y bloques secundarios.
- Electric: `#7C2BFF` — acción principal y energía.
- Ultraviolet: `#C447FF` — brillo, gradientes y estados activos.
- Signal: `#D8FF45` — acentos puntuales para ahorro, validación o éxito.
- Paper: `#F8F5FF` — texto principal.
- Lavender: `#C9B9E9` — texto secundario.

El violeta debe dominar, pero no convertir cada elemento en un gradiente. El verde lima se reserva para señales de ahorro o confirmación.

## Typography

Usar una sans display redondeada y con personalidad para titulares, combinada con una sans neutra y muy legible para textos funcionales. Evitar Inter, Roboto y sistemas tipográficos genéricos como decisión automática.

Reglas:

- Titulares compactos, grandes y con saltos de línea intencionados.
- El titular principal debe tener una frase corta y una palabra de impacto destacada.
- El cuerpo nunca debe depender de texto violeta claro sobre un fondo brillante.
- Los botones deben usar peso fuerte y verbos concretos.

## Composition

- Layout editorial asimétrico en desktop.
- Hero dividido entre mensaje y objeto de acción.
- La zona de subida debe parecer un punto de entrada real, no una tarjeta decorativa.
- Usar blobs, ruido y halos con moderación como atmósfera, no como contenido.
- Combinar bloques densos con áreas de descanso oscuro.
- Evitar una página compuesta únicamente por tarjetas redondeadas.

## Page structure

1. Header mínimo: logo, enlace de cómo funciona y CTA.
2. Hero: problema, promesa, subida de factura y alternativa WhatsApp.
3. Señal de confianza: gratuito o condiciones reales, privacidad y ausencia de llamadas si se puede garantizar.
4. Cómo funciona: tres pasos visuales, sin iconos genéricos sin contexto.
5. Escena de producto: factura entrando y resultado explicado de manera comprensible.
6. Beneficios: claridad, ahorro potencial y cero complicaciones.
7. FAQ: datos, tiempos, qué ocurre después y límites del análisis.
8. CTA final: repetir la acción principal con menos ruido.
9. Footer legal y privacidad.

## Motion

- Aparición escalonada corta en el hero.
- Brillo muy sutil alrededor del rayo o del área activa.
- Feedback claro al arrastrar una factura.
- Nada de animaciones permanentes que compitan con la subida.
- Respetar `prefers-reduced-motion`.

## Anti-patterns

- No usar dashboard falso como hero.
- No prometer un ahorro concreto sin cálculo real.
- No llenar la pantalla de gradientes y glow.
- No usar tres CTAs con la misma importancia.
- No ocultar privacidad o condiciones en letra diminuta.
- No centrar absolutamente todo.
- No convertir cada sección en una card.
- No utilizar iconos emoji como sistema visual final.

## Responsive rules

- En móvil, primero debe verse el problema, la promesa y el CTA.
- La subida de factura debe quedar accesible sin hacer scroll excesivo.
- El mockup o teléfono no debe reducir el titular ni empujar el CTA fuera de la primera pantalla.
- Los bloques asimétricos de desktop deben convertirse en una secuencia vertical clara.
- Los botones principales deben tener tamaño táctil cómodo.
