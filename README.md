# Wattio

Landing de Wattio para revisar facturas eléctricas. Astro + Vercel + Resend.

## Desarrollo

```sh
npm install
npm run dev
```

La aplicación funciona como una landing con subida local de archivos. Para enviar una factura realmente por email hacen falta las variables de Resend descritas en `.env.example`.

## Envío de facturas

El formulario pide el email de la persona y permite adjuntar hasta 10 archivos PDF, JPG o PNG, con un máximo conjunto de 4 MB para respetar el límite de las funciones de Vercel. Al confirmar:

1. El endpoint server-side valida email, tipo y tamaño.
2. Resend envía la factura adjunta a `diego.sanmiguel.delpozo1314@gmail.com`.
3. La interfaz muestra una confirmación al usuario.

La factura no se envía al seleccionar el archivo; solo al pulsar **Enviar factura a Wattio**. No se manda una copia automática al usuario todavía.

Configura en Vercel:

```text
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Wattio <hola@tu-dominio-verificado.com>
```

`RESEND_FROM_EMAIL` debe usar un dominio verificado en Resend. No guardes la API key en Git ni en el navegador.

## Despliegue

El proyecto usa el adaptador oficial de Astro para Vercel y renderizado server-side para la API:

```sh
npm run build
npm run preview
```

## Verificación

```sh
npm run test:ui
```

Las pruebas utilizan archivos sintéticos y no envían ningún email real.
