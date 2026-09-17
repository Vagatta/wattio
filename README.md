# Wattios

Landing de Wattios para revisar facturas eléctricas. Astro estático + endpoint PHP (Resend) en Hostinger.

## Desarrollo

```sh
npm install
npm run dev
```

La aplicación funciona como una landing con subida local de archivos. En desarrollo el envío real no funciona (el endpoint es PHP y Astro dev no lo ejecuta); el formulario muestra el error y se puede probar la selección de archivos completa.

## Envío de facturas

El formulario pide el email de la persona y permite adjuntar hasta 10 archivos PDF, JPG o PNG, con un máximo conjunto de 4 MB. Al confirmar:

1. `public/api/submit-invoice.php` valida email, tipo real del archivo (finfo) y tamaño, con honeypot anti-bots y límite de 8 envíos/hora por IP.
2. Resend envía la factura adjunta al email configurado en `WATTIO_OWNER_EMAIL`.
3. La interfaz muestra una confirmación al usuario.

La factura no se envía al seleccionar el archivo; solo al pulsar **Enviar factura a Wattios**. `WATTIO_COPY_EMAILS` añade copias ocultas (BCC), separadas por comas.

## Despliegue en Hostinger (hosting compartido)

1. Compila el sitio estático:

```sh
npm run build
```

2. Sube el **contenido de `dist/`** a `public_html` (incluye `.htaccess`, que reescribe `/api/submit-invoice` al PHP, fuerza HTTPS y cachea los assets).
3. Copia `deploy/wattio-secrets.example.php` como `wattio-secrets.php` **fuera de `public_html`** (un nivel por encima) y rellena:

```php
$RESEND_API_KEY = 're_...';
$RESEND_FROM_EMAIL = 'Wattios <hola@tu-dominio-verificado.com>';
$WATTIO_OWNER_EMAIL = 'destino@tudominio.com';
$WATTIO_COPY_EMAILS = 'opcional1@x.com,opcional2@x.com';
```

`RESEND_FROM_EMAIL` debe usar un dominio verificado en Resend. Nunca subas la API key a Git ni dentro de `public_html`.

4. Si `wattio-secrets.php` no está en la ruta por defecto, el endpoint también acepta las mismas claves como variables de entorno de PHP.

## SEO

- `PUBLIC_SITE_URL` fija el dominio canónico en build: alimenta `<link rel="canonical">`, Open Graph, `sitemap.xml` y `robots.txt`.
- Analítica sin cookies opcional: define `PUBLIC_ANALYTICS_DOMAIN` (Plausible o compatible) antes de compilar. Sin ella no se carga ningún script externo.
- Además puedes usar las estadísticas de hPanel y Google Search Console sin añadir nada a la web.

## Verificación

```sh
npm run test:ui
```

Las pruebas utilizan archivos sintéticos y no envían ningún email real.
