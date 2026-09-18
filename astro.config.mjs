// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Última modificación real del contenido de cada página (para lastmod del sitemap).
const lastmod = {
  '/': '2026-09-18',
  '/aviso-legal/': '2026-09-17',
  '/guias/': '2026-09-17',
  '/guias/como-leer-tu-factura-de-gas/': '2026-09-17',
  '/guias/como-leer-tu-factura-de-luz/': '2026-09-17',
  '/privacidad/': '2026-09-18',
};

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://wattios.es',
  output: 'static',
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = lastmod[new URL(item.url).pathname] ?? '2026-09-18';
        return item;
      },
    }),
  ],
});
