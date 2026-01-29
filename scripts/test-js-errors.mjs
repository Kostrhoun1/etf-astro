#!/usr/bin/env node
/**
 * Automatický test JavaScript chyb na webu
 * Spuštění: npx playwright test scripts/test-js-errors.mjs
 * Nebo: node scripts/test-js-errors.mjs (po instalaci playwright)
 */

import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'https://etfpruvodce.cz';

// Klíčové stránky k otestování
const PAGES_TO_TEST = [
  '/',
  '/nejlepsi-etf',
  '/kde-koupit-etf',
  '/co-jsou-etf',
  '/srovnani-etf',
  '/portfolio-strategie',
  '/kalkulacky',
  '/kalkulacky/fire-kalkulacka',
  '/kalkulacky/investicni-kalkulacka',
  '/kalkulacky/hypotecni-kalkulacka',
  '/kalkulacky/monte-carlo-simulator',
  '/kalkulacky/backtest-portfolia',
  '/etf/IE00B5BMR087', // iShares Core S&P 500
  '/etf/IE00B4L5Y983', // iShares Core MSCI World
  '/nejlepsi-etf/nejlepsi-dividendove-etf',
  '/nejlepsi-etf/nejlepsi-ai-etf',
  '/nejlepsi-etf/nejlepsi-celosvetove-etf',
];

// Interaktivní prvky k otestování (selektor + akce)
const INTERACTIONS_TO_TEST = [
  {
    page: '/etf/IE00B5BMR087',
    name: 'Currency switcher - EUR',
    selector: '[data-currency="EUR"]',
    action: 'click',
  },
  {
    page: '/etf/IE00B5BMR087',
    name: 'Currency switcher - CZK',
    selector: '[data-currency="CZK"]',
    action: 'click',
  },
  {
    page: '/etf/IE00B5BMR087',
    name: 'Currency switcher - USD',
    selector: '[data-currency="USD"]',
    action: 'click',
  },
  {
    page: '/kalkulacky/investicni-kalkulacka',
    name: 'Investment calculator input',
    selector: 'input[type="number"]',
    action: 'fill',
    value: '10000',
  },
];

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const warnings = [];

  // Zachytávání console chyb
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        url: page.url(),
        message: msg.text(),
        type: 'console.error',
      });
    }
  });

  // Zachytávání JS výjimek
  page.on('pageerror', (err) => {
    errors.push({
      url: page.url(),
      message: err.message,
      type: 'pageerror',
    });
  });

  // Zachytávání failed requestů
  page.on('requestfailed', (request) => {
    // Ignorovat některé běžné false positives
    const url = request.url();
    if (url.includes('analytics') || url.includes('gtm') || url.includes('favicon')) {
      return;
    }
    warnings.push({
      url: page.url(),
      message: `Failed request: ${url}`,
      type: 'requestfailed',
    });
  });

  console.log('🧪 Spouštím testy JavaScript chyb...\n');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  // Test 1: Načtení stránek
  console.log('═══════════════════════════════════════');
  console.log('📄 Test 1: Načítání stránek');
  console.log('═══════════════════════════════════════');

  for (const path of PAGES_TO_TEST) {
    const url = `${BASE_URL}${path}`;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response?.status() || 'N/A';

      if (status >= 400) {
        errors.push({ url, message: `HTTP ${status}`, type: 'http_error' });
        console.log(`  ❌ ${path} - HTTP ${status}`);
      } else {
        console.log(`  ✅ ${path}`);
      }

      // Počkat na případné JS chyby po načtení
      await page.waitForTimeout(500);

    } catch (err) {
      errors.push({ url, message: err.message, type: 'navigation_error' });
      console.log(`  ❌ ${path} - ${err.message.substring(0, 50)}...`);
    }
  }

  // Test 2: Interaktivní prvky
  console.log('\n═══════════════════════════════════════');
  console.log('🖱️  Test 2: Interaktivní prvky');
  console.log('═══════════════════════════════════════');

  for (const interaction of INTERACTIONS_TO_TEST) {
    const url = `${BASE_URL}${interaction.page}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const element = await page.$(interaction.selector);
      if (!element) {
        warnings.push({
          url,
          message: `Element not found: ${interaction.selector}`,
          type: 'element_not_found',
        });
        console.log(`  ⚠️  ${interaction.name} - Element nenalezen`);
        continue;
      }

      const errorsBefore = errors.length;

      if (interaction.action === 'click') {
        await element.click();
      } else if (interaction.action === 'fill') {
        await element.fill(interaction.value);
      }

      // Počkat na reakci JS
      await page.waitForTimeout(500);

      if (errors.length > errorsBefore) {
        console.log(`  ❌ ${interaction.name} - JS chyba po interakci`);
      } else {
        console.log(`  ✅ ${interaction.name}`);
      }

    } catch (err) {
      errors.push({
        url,
        message: `Interaction failed: ${err.message}`,
        type: 'interaction_error',
      });
      console.log(`  ❌ ${interaction.name} - ${err.message.substring(0, 40)}...`);
    }
  }

  await browser.close();

  // Výsledky
  console.log('\n═══════════════════════════════════════');
  console.log('📊 VÝSLEDKY');
  console.log('═══════════════════════════════════════');

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ Všechny testy prošly bez chyb!\n');
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(`\n❌ Nalezeno ${errors.length} chyb:\n`);
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.type}] ${err.url}`);
      console.log(`     ${err.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Nalezeno ${warnings.length} varování:\n`);
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. [${warn.type}] ${warn.url}`);
      console.log(`     ${warn.message}\n`);
    });
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
