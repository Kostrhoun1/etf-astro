const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.etfpruvodce.cz';
const now = new Date().toISOString();

// Staticke stranky s vysokou prioritou
const staticPages = [
  { url: '/', priority: 1, changefreq: 'daily' },
  { url: '/co-jsou-etf', priority: 0.9, changefreq: 'monthly' },
  { url: '/kde-koupit-etf', priority: 0.9, changefreq: 'monthly' },
  { url: '/srovnani-etf', priority: 0.9, changefreq: 'weekly' },
  { url: '/portfolio-strategie', priority: 0.9, changefreq: 'monthly' },
  { url: '/kalkulacky', priority: 0.9, changefreq: 'monthly' },
  { url: '/nejlepsi-etf', priority: 0.9, changefreq: 'weekly' },
  { url: '/srovnani-brokeru', priority: 0.9, changefreq: 'monthly' },
  // Srovnani ETF - popularni stranky
  { url: '/srovnani-etf/vwce-vs-cspx', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/iwda-vs-cspx', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/vwce-vs-iwda', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/cspx-vs-vwra', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/cspx-vs-vuaa', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/swrd-vs-iwda', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/vwce-vs-vwrl', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/iwda-vs-vwra', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/cspx-vs-eunl', priority: 0.85, changefreq: 'weekly' },
  { url: '/srovnani-etf/vwce-vs-eunl', priority: 0.85, changefreq: 'weekly' },
  // Portfolio strategie
  { url: '/portfolio-strategie/akciove-portfolio', priority: 0.8, changefreq: 'monthly' },
  { url: '/portfolio-strategie/dividendove-portfolio', priority: 0.8, changefreq: 'monthly' },
  { url: '/portfolio-strategie/nobel-portfolio', priority: 0.8, changefreq: 'monthly' },
  { url: '/portfolio-strategie/permanentni-portfolio', priority: 0.8, changefreq: 'monthly' },
  { url: '/portfolio-strategie/ray-dalio-all-weather', priority: 0.8, changefreq: 'monthly' },
  // Kalkulacky
  { url: '/kalkulacky/backtest-portfolia', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/investicni-kalkulacka', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/fire-kalkulacka', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/monte-carlo-simulator', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/hypotecni-kalkulacka', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/cisty-plat-2025', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/uverova-kalkulacka', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/nouzova-rezerva', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/kalkulacka-poplatku-etf', priority: 0.8, changefreq: 'monthly' },
  { url: '/kalkulacky/kurzovy-dopad-etf', priority: 0.8, changefreq: 'monthly' },
  // Nejlepsi ETF kategorie
  { url: '/nejlepsi-etf/nejlepsi-etf-2026', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlevnejsi-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/etf-zdarma-degiro', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-celosvetove-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-sp500-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-msci-world-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-nasdaq-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-dax-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-stoxx600-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-ftse100-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-americke-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-evropske-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-asijsko-pacificke-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-japonske-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-cinske-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-emerging-markets-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-dividendove-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-nemovitostni-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-dluhopisove-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-komoditni-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-zlate-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-technologicke-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-healthcare-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-financni-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-energeticke-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-spotrebni-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-ai-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-robotika-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-clean-energy-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-cloud-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-biotechnologie-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-kyberbezpecnost-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-defense-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-value-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-growth-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-small-cap-etf', priority: 0.85, changefreq: 'weekly' },
  { url: '/nejlepsi-etf/nejlepsi-esg-etf', priority: 0.85, changefreq: 'weekly' },
  // Recenze brokeru
  { url: '/degiro-recenze', priority: 0.8, changefreq: 'monthly' },
  { url: '/xtb-recenze', priority: 0.8, changefreq: 'monthly' },
  { url: '/trading212-recenze', priority: 0.8, changefreq: 'monthly' },
  { url: '/portu-recenze', priority: 0.8, changefreq: 'monthly' },
  { url: '/interactive-brokers-recenze', priority: 0.8, changefreq: 'monthly' },
  { url: '/fio-ebroker-recenze', priority: 0.8, changefreq: 'monthly' },
  // Infografiky
  { url: '/infografiky', priority: 0.8, changefreq: 'weekly' },
  { url: '/infografiky/nejlepsi-etf-vykonnost', priority: 0.8, changefreq: 'weekly' },
  { url: '/infografiky/nejlevnejsi-etf-ter', priority: 0.8, changefreq: 'weekly' },
  { url: '/infografiky/trzni-heatmapa', priority: 0.8, changefreq: 'weekly' },
  // O nas
  { url: '/o-nas', priority: 0.7, changefreq: 'monthly' },
];

// Nacist ETF ISINy ze sitemap-etf.xml
const etfSitemapPath = path.join(__dirname, '../public/sitemap-etf.xml');
const etfSitemap = fs.readFileSync(etfSitemapPath, 'utf-8');
const etfUrls = etfSitemap.match(/<loc>([^<]+)<\/loc>/g) || [];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Pridat staticke stranky
for (const page of staticPages) {
  sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
}

// Pridat ETF detailni stranky s nizsi prioritou (0.5)
let etfCount = 0;
for (const urlTag of etfUrls) {
  const url = urlTag.replace('<loc>', '').replace('</loc>', '');
  // Pouze /etf/ detail stranky
  if (url.includes('/etf/') && url.includes('etfpruvodce.cz')) {
    sitemap += `  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    etfCount++;
  }
}

sitemap += '</urlset>';

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log(`Sitemap vygenerovan: ${staticPages.length} statickych + ${etfCount} ETF stranek`);
