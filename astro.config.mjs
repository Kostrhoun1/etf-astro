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
      // SEO STRATEGY (April 2026): Exclude /etf/[isin] detail pages from sitemap
      //
      // Why: 4300+ programmatically-generated ETF detail pages drown out the
      // ~80 editorial pages and trigger Google's thin/templated-content
      // quality filter on a young (9-month-old) domain. Result: Google indexes
      // only the homepage and treats the rest as "Crawled - currently not
      // indexed". Combined with noindex,follow on the ETF detail pages
      // themselves (see src/pages/etf/[isin].astro), this refocuses the crawl
      // budget on the editorial content and lets it accrue authority.
      //
      // Once editorial pages are reliably indexed, individual high-traffic
      // ETF pages can be selectively re-enabled.
      filter: (page) => {
        if (page.includes('/api/')) return false;
        if (page.includes('/_')) return false;
        // Exclude individual ETF detail pages (kept noindex,follow at the page level)
        if (/\/etf\/[^/]+\/?$/.test(page)) return false;
        return true;
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