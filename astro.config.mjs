// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://wattios.es',
  output: 'static',
  integrations: [sitemap()],
});
