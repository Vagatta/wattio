// @ts-check
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://wattio.es',
  output: 'server',
  adapter: vercel(),
  integrations: [sitemap()],
});
