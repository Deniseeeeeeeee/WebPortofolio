// @ts-check
import { defineConfig, envField } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Ganti `site` dengan domain final (dipakai untuk sitemap & Open Graph URL).
export default defineConfig({
  site: 'https://deniseaditya.vercel.app',
  // Pages are rendered on demand so content edited in /admin shows up without a rebuild.
  output: 'server',
  adapter: vercel(),
  devToolbar: { enabled: false },
  integrations: [vue(), sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      // Database: leave empty locally to use the SQLite file data/local.db
      TURSO_DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Admin login (required in production; local dev falls back to admin / admin123)
      ADMIN_USERNAME: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
