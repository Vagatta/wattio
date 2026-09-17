---
name: browser-quality
description: Verificar la interfaz Wattios en navegador real con capturas, navegación sticky, teclado y estados de archivos; skill local
---

# Calidad de interfaz en navegador

Skill original de Wattios. Referencia de revisión externa: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

Lee los archivos afectados y consulta la referencia cuando esté disponible. Usa la terminología y el idioma español de Wattios aunque una guía externa recomiende convenciones inglesas.

1. Ejecuta build y las pruebas de navegador disponibles. Una compilación correcta no prueba el diseño ni la interacción.
2. Comprueba escritorio, tablet y móvil de 320 px en adelante. Compara scrollWidth con clientWidth y busca contenido recortado.
3. Pulsa cada CTA principal: el destino debe existir y permanecer visible por debajo del header sticky.
4. Prueba enlaces, navegación móvil, Escape, focus-visible y acceso por teclado a todos los controles.
5. Selecciona archivos sintéticos válidos, vacíos, demasiado grandes y no admitidos. No uses facturas reales. Verifica nombre largo, cambio de archivo y eliminación.
6. Verifica que no se suban datos ni se prometan resultados mientras la app sea estática.
7. Comprueba prefers-reduced-motion y capturas desktop/móvil. Revisa consola y errores de página.
8. Haz una ronda de corrección agrupada y otra de confirmación. Reporta verificaciones pendientes, no las presentes como realizadas.
