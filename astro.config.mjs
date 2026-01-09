// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://etfpruvodce.cz',
  output: 'static',
  trailingSlash: 'never',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      // ✅ GEMINI STRATEGY: Include ALL pages in sitemap
      // ETF pages are now high-value content with Czech context
      filter: (page) => {
        // Only exclude API routes and Astro internal files
        return !page.includes('/api/') && !page.includes('/_');
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
});