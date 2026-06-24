// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.csorro.co.uk',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
