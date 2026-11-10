// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Ganti `site` dengan domain final (dipakai untuk sitemap & Open Graph URL).
export default defineConfig({
  site: 'https://deniseaditya.vercel.app',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [vue(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
