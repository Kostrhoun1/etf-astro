const fs = require('fs');
const path = require('path');

const categories = [
  { slug: 'nejlepsi-nasdaq-etf', emoji: '💻', color: 'purple', infoTitle: 'NASDAQ', stats: [
    { value: '100', label: 'Tech společností' },
    { value: '~12%', label: 'Historický výnos' },
    { value: '50%', label: 'Technologický sektor' }
  ]},
  { slug: 'nejlepsi-dividendove-etf', emoji: '💰', color: 'green', infoTitle: 'Dividendy', stats: [
    { value: '3-5%', label: 'Roční dividendy' },
    { value: 'Čtvrtletně', label: 'Výplata' },
    { value: 'Stabilní', label: 'Příjem' }
  ]},
  { slug: 'nejlepsi-technologicke-etf', emoji: '🖥️', color: 'blue', infoTitle: 'Technologie', stats: [
    { value: 'FAANG+', label: 'Top společnosti' },
    { value: '~15%', label: 'Historický růst' },
    { value: 'Inovace', label: 'Zaměření' }
  ]},
  { slug: 'nejlepsi-celosvetove-etf', emoji: '🌍', color: 'teal', infoTitle: 'Globální', stats: [
    { value: '3000+', label: 'Společností' },
    { value: '50+', label: 'Zemí' },
    { value: '~8%', label: 'Historický výnos' }
  ]},
  { slug: 'nejlepsi-americke-etf', emoji: '🇺🇸', color: 'blue', infoTitle: 'USA', stats: [
    { value: '1000+', label: 'US společností' },
    { value: '~10%', label: 'Historický výnos' },
    { value: '#1', label: 'Ekonomika světa' }
  ]},
  { slug: 'nejlepsi-evropske-etf', emoji: '🇪🇺', color: 'blue', infoTitle: 'Evropa', stats: [
    { value: '600+', label: 'EU společností' },
    { value: '~7%', label: 'Historický výnos' },
    { value: 'Diverzifikace', label: 'Od USA' }
  ]},
  { slug: 'nejlepsi-emerging-markets-etf', emoji: '🌏', color: 'orange', infoTitle: 'EM', stats: [
    { value: '1400+', label: 'Společností' },
    { value: '26', label: 'Rozvíjejících se zemí' },
    { value: 'Vysoký', label: 'Růstový potenciál' }
  ]},
  { slug: 'nejlepsi-dluhopisove-etf', emoji: '📈', color: 'gray', infoTitle: 'Dluhopisy', stats: [
    { value: '3-5%', label: 'Průměrný výnos' },
    { value: 'Nízké', label: 'Riziko' },
    { value: 'Stabilita', label: 'Portfolia' }
  ]},
  { slug: 'nejlepsi-zlate-etf', emoji: '🥇', color: 'yellow', infoTitle: 'Zlato', stats: [
    { value: 'Fyzické', label: 'Zlato v trezoru' },
    { value: 'Ochrana', label: 'Proti inflaci' },
    { value: 'Safe', label: 'Haven aktiva' }
  ]},
  { slug: 'nejlepsi-komoditni-etf', emoji: '🛢️', color: 'orange', infoTitle: 'Komodity', stats: [
    { value: 'Ropa', label: 'Plyn, Kovy' },
    { value: 'Diverzifikace', label: 'Od akcií' },
    { value: 'Inflační', label: 'Zajištění' }
  ]},
  { slug: 'nejlepsi-ai-etf', emoji: '🤖', color: 'purple', infoTitle: 'AI', stats: [
    { value: 'NVIDIA', label: 'Microsoft, Google' },
    { value: 'Exponenciální', label: 'Růst' },
    { value: 'Budoucnost', label: 'Technologií' }
  ]},
  { slug: 'nejlepsi-esg-etf', emoji: '🌱', color: 'green', infoTitle: 'ESG', stats: [
    { value: 'Udržitelné', label: 'Investování' },
    { value: 'ESG', label: 'Kritéria' },
    { value: 'Odpovědné', label: 'Společnosti' }
  ]},
  { slug: 'nejlepsi-value-etf', emoji: '💎', color: 'indigo', infoTitle: 'Value', stats: [
    { value: 'Podhodnocené', label: 'Akcie' },
    { value: 'Warren', label: 'Buffett styl' },
    { value: 'Nízké P/E', label: 'Poměry' }
  ]},
  { slug: 'nejlepsi-growth-etf', emoji: '🚀', color: 'pink', infoTitle: 'Growth', stats: [
    { value: 'Růstové', label: 'Společnosti' },
    { value: 'Tech', label: 'Orientace' },
    { value: 'Vyšší', label: 'Volatilita' }
  ]},
  { slug: 'nejlepsi-small-cap-etf', emoji: '🏢', color: 'cyan', infoTitle: 'Small Cap', stats: [
    { value: 'Malé', label: 'Společnosti' },
    { value: 'Vyšší', label: 'Růstový potenciál' },
    { value: 'Russell 2000', label: 'Index' }
  ]},
  { slug: 'nejlepsi-healthcare-etf', emoji: '🏥', color: 'red', infoTitle: 'Healthcare', stats: [
    { value: 'Farma', label: 'Biotech, Med-tech' },
    { value: 'Defenzivní', label: 'Sektor' },
    { value: 'Stárnutí', label: 'Populace trend' }
  ]},
  { slug: 'nejlepsi-financni-etf', emoji: '🏦', color: 'blue', infoTitle: 'Finance', stats: [
    { value: 'Banky', label: 'Pojišťovny' },
    { value: 'Dividendy', label: 'Výplata' },
    { value: 'Cyklický', label: 'Sektor' }
  ]},
  { slug: 'nejlepsi-energeticke-etf', emoji: '⚡', color: 'yellow', infoTitle: 'Energie', stats: [
    { value: 'Ropa', label: 'Plyn, Uhlí' },
    { value: 'Vysoké', label: 'Dividendy' },
    { value: 'Volatilní', label: 'Ceny' }
  ]},
  { slug: 'nejlepsi-nemovitostni-etf', emoji: '🏠', color: 'amber', infoTitle: 'REIT', stats: [
    { value: 'Nemovitosti', label: 'REITs' },
    { value: '4-6%', label: 'Dividendový výnos' },
    { value: 'Inflační', label: 'Ochrana' }
  ]},
  { slug: 'nejlepsi-japonske-etf', emoji: '🇯🇵', color: 'red', infoTitle: 'Japonsko', stats: [
    { value: 'Nikkei', label: 'TOPIX' },
    { value: '3.', label: 'Ekonomika světa' },
    { value: 'Toyota', label: 'Sony, Honda' }
  ]},
  { slug: 'nejlepsi-cinske-etf', emoji: '🇨🇳', color: 'red', infoTitle: 'Čína', stats: [
    { value: 'Alibaba', label: 'Tencent' },
    { value: '2.', label: 'Ekonomika světa' },
    { value: 'Vysoký', label: 'Růst' }
  ]},
  { slug: 'nejlepsi-stoxx600-etf', emoji: '🇪🇺', color: 'blue', infoTitle: 'STOXX 600', stats: [
    { value: '600', label: 'EU společností' },
    { value: '17', label: 'Evropských zemí' },
    { value: '~7%', label: 'Historický výnos' }
  ]},
  { slug: 'nejlepsi-ftse100-etf', emoji: '🇬🇧', color: 'blue', infoTitle: 'FTSE 100', stats: [
    { value: '100', label: 'UK společností' },
    { value: '~7%', label: 'Historický výnos' },
    { value: 'Dividendy', label: 'Orientace' }
  ]},
  { slug: 'nejlepsi-dax-etf', emoji: '🇩🇪', color: 'yellow', infoTitle: 'DAX', stats: [
    { value: '40', label: 'Německých firem' },
    { value: 'SAP', label: 'Siemens, VW' },
    { value: '~9%', label: 'Historický výnos' }
  ]},
  { slug: 'nejlepsi-clean-energy-etf', emoji: '☀️', color: 'green', infoTitle: 'Clean Energy', stats: [
    { value: 'Solar', label: 'Vítr, Hydro' },
    { value: 'ESG', label: 'Trend' },
    { value: 'Budoucnost', label: 'Energetiky' }
  ]},
  { slug: 'nejlepsi-biotechnologie-etf', emoji: '🧬', color: 'purple', infoTitle: 'Biotech', stats: [
    { value: 'Léky', label: 'Terapie, Geny' },
    { value: 'Vysoké', label: 'Riziko/Výnos' },
    { value: 'Inovace', label: 'V medicíně' }
  ]},
  { slug: 'nejlepsi-robotika-etf', emoji: '🦾', color: 'gray', infoTitle: 'Robotika', stats: [
    { value: 'Automatizace', label: 'AI, Robotika' },
    { value: 'Industry', label: '4.0' },
    { value: 'Budoucnost', label: 'Výroby' }
  ]},
  { slug: 'nejlepsi-cloud-etf', emoji: '☁️', color: 'sky', infoTitle: 'Cloud', stats: [
    { value: 'AWS', label: 'Azure, GCP' },
    { value: 'SaaS', label: 'Společnosti' },
    { value: '~20%', label: 'Roční růst' }
  ]},
  { slug: 'nejlepsi-kyberbezpecnost-etf', emoji: '🔐', color: 'indigo', infoTitle: 'Cyber', stats: [
    { value: 'Bezpečnost', label: 'IT' },
    { value: 'Rostoucí', label: 'Hrozby' },
    { value: 'Nutnost', label: 'Pro firmy' }
  ]},
  { slug: 'nejlepsi-defense-etf', emoji: '🛡️', color: 'gray', infoTitle: 'Defense', stats: [
    { value: 'Obrana', label: 'Aerospace' },
    { value: 'Lockheed', label: 'Raytheon' },
    { value: 'Stabilní', label: 'Vládní zakázky' }
  ]},
  { slug: 'nejlepsi-spotrebni-etf', emoji: '🛒', color: 'pink', infoTitle: 'Consumer', stats: [
    { value: 'Retail', label: 'Luxus, FMCG' },
    { value: 'Amazon', label: 'Nike, LVMH' },
    { value: 'Spotřeba', label: 'Trend' }
  ]},
  { slug: 'nejlepsi-asijsko-pacificke-etf', emoji: '🌏', color: 'teal', infoTitle: 'APAC', stats: [
    { value: 'Asie', label: 'Pacifik' },
    { value: 'Japonsko', label: 'Korea, Austrálie' },
    { value: 'Diverzifikace', label: 'Regionální' }
  ]},
  { slug: 'nejlevnejsi-etf', emoji: '💸', color: 'emerald', infoTitle: 'Nejlevnější', stats: [
    { value: '0.03%', label: 'Nejnižší TER' },
    { value: 'Vanguard', label: 'iShares, SPDR' },
    { value: 'Úspora', label: 'Poplatků' }
  ]},
  { slug: 'nejlepsi-etf-2025', emoji: '🏆', color: 'yellow', infoTitle: 'TOP 2025', stats: [
    { value: 'Nejlepší', label: 'Hodnocení' },
    { value: '5★', label: 'Rating' },
    { value: 'Doporučeno', label: 'Pro rok 2025' }
  ]},
  { slug: 'etf-zdarma-degiro', emoji: '🆓', color: 'orange', infoTitle: 'DEGIRO Free', stats: [
    { value: '0€', label: 'Transakční poplatek' },
    { value: 'Core', label: 'Selection' },
    { value: '200+', label: 'ETF zdarma' }
  ]},
];

const template = (cat) => `---
import Layout from '../../layouts/Layout.astro';
import ETFTable from '../../components/ETFTable.astro';
import InternalLinking from '../../components/InternalLinking.astro';
import { getTopETFsForCategory, categoryConfigs } from '../../lib/etf-data';

const config = categoryConfigs['${cat.slug}'];
const etfs = await getTopETFsForCategory(config);
const currentYear = new Date().getFullYear();

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": config.title + ' ' + currentYear,
  "description": config.metaDescription,
  "author": { "@type": "Organization", "name": "ETF Průvodce" }
};

const relatedLinks = [
  { title: "Nejlepší ETF", href: "/nejlepsi-etf", description: "Všechny kategorie ETF", icon: "📊" },
  { title: "S&P 500 ETF", href: "/nejlepsi-etf/nejlepsi-sp500-etf", description: "Americké ETF", icon: "🇺🇸" },
  { title: "Kde koupit ETF", href: "/kde-koupit-etf", description: "Srovnání brokerů", icon: "🏦" }
];
---

<Layout
  title={config.title + ' ' + currentYear}
  description={config.metaDescription}
  canonical={'/nejlepsi-etf/' + config.slug}
>
  <script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />

  <section class="py-16 bg-gradient-to-br from-${cat.color}-50 to-${cat.color}-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <div class="inline-flex items-center bg-${cat.color}-100 text-${cat.color}-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          ${cat.emoji} Aktualizováno {new Date().toLocaleDateString('cs-CZ')}
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {config.title} <span class="text-${cat.color}-600">{currentYear}</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          {config.description}. Srovnání {etfs.length} ETF fondů.
        </p>
      </div>
    </div>
  </section>

  <section class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid md:grid-cols-4 gap-6 mb-12">
        <div class="bg-gradient-to-br from-${cat.color}-50 to-${cat.color}-100 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-${cat.color}-600">${cat.stats[0].value}</div>
          <div class="text-sm text-gray-600">${cat.stats[0].label}</div>
        </div>
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-gray-600">${cat.stats[1].value}</div>
          <div class="text-sm text-gray-600">${cat.stats[1].label}</div>
        </div>
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-gray-600">${cat.stats[2].value}</div>
          <div class="text-sm text-gray-600">${cat.stats[2].label}</div>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-blue-600">{etfs.length}</div>
          <div class="text-sm text-gray-600">ETF k dispozici</div>
        </div>
      </div>
    </div>
  </section>

  <section class="py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ETFTable etfs={etfs} title={'TOP ' + config.title} />
    </div>
  </section>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <InternalLinking links={relatedLinks} title="Související články" />
  </div>
</Layout>
`;

const pagesDir = path.join(__dirname, 'src/pages/nejlepsi-etf');

categories.forEach(cat => {
  const filePath = path.join(pagesDir, cat.slug + '.astro');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(cat));
    console.log('Created:', cat.slug + '.astro');
  } else {
    console.log('Exists:', cat.slug + '.astro');
  }
});

console.log('Done!');
