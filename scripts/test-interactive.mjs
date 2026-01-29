#!/usr/bin/env node
/**
 * Kompletní test interaktivních prvků na webu
 * Testuje kalkulačky, formuláře, tlačítka, přepínače
 */

import { chromium } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'https://etfpruvodce.cz';

const errors = [];
const successes = [];

async function testPage(page, pagePath, tests) {
  const url = `${BASE_URL}${pagePath}`;
  console.log(`\n📄 ${pagePath}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    errors.push({ page: pagePath, test: 'Page load', error: err.message });
    console.log(`  ❌ Nelze načíst stránku: ${err.message.substring(0, 50)}`);
    return;
  }

  for (const test of tests) {
    try {
      // Počkat na element
      const element = await page.waitForSelector(test.selector, { timeout: 5000 }).catch(() => null);

      if (!element) {
        if (test.optional) {
          console.log(`  ⏭️  ${test.name} - Element nenalezen (optional)`);
          continue;
        }
        errors.push({ page: pagePath, test: test.name, error: 'Element not found' });
        console.log(`  ❌ ${test.name} - Element nenalezen`);
        continue;
      }

      // Provést akci
      if (test.action === 'click') {
        await element.click();
      } else if (test.action === 'fill') {
        await element.fill(test.value);
      } else if (test.action === 'select') {
        await element.selectOption(test.value);
      } else if (test.action === 'check') {
        await element.check();
      } else if (test.action === 'slide') {
        // Pro slidery - nastavit hodnotu přes evaluate
        await page.evaluate((sel, val) => {
          const input = document.querySelector(sel);
          if (input) {
            input.value = val;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, test.selector, test.value);
      }

      // Počkat na reakci
      await page.waitForTimeout(300);

      // Ověřit, že nedošlo k JS chybě (zkontrolovat, že stránka stále reaguje)
      const isResponsive = await page.evaluate(() => document.body !== null);

      if (!isResponsive) {
        throw new Error('Page became unresponsive');
      }

      // Pokud má test očekávaný výsledek, ověřit
      if (test.expectVisible) {
        const visible = await page.isVisible(test.expectVisible);
        if (!visible) {
          throw new Error(`Expected element not visible: ${test.expectVisible}`);
        }
      }

      if (test.expectText) {
        const text = await page.textContent(test.expectText.selector);
        if (!text || !text.includes(test.expectText.contains)) {
          throw new Error(`Expected text not found: ${test.expectText.contains}`);
        }
      }

      successes.push({ page: pagePath, test: test.name });
      console.log(`  ✅ ${test.name}`);

    } catch (err) {
      errors.push({ page: pagePath, test: test.name, error: err.message });
      console.log(`  ❌ ${test.name} - ${err.message.substring(0, 60)}`);
    }
  }
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Zachytávání JS chyb
  page.on('pageerror', (err) => {
    errors.push({
      page: page.url(),
      test: 'JS Error',
      error: err.message,
    });
  });

  console.log('🧪 Kompletní test interaktivních prvků\n');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════════');

  // ===== INVESTIČNÍ KALKULAČKA =====
  await testPage(page, '/kalkulacky/investicni-kalkulacka', [
    { name: 'Počáteční investice', selector: 'input[type="number"]', action: 'fill', value: '100000' },
    { name: 'Měsíční vklad (2. input)', selector: 'input[type="number"]:nth-of-type(1)', action: 'fill', value: '5000', optional: true },
    { name: 'Slider roční výnos', selector: 'input[type="range"]', action: 'slide', value: '8', optional: true },
    { name: 'Tlačítko/Tab přepnutí', selector: 'button, [role="tab"]', action: 'click', optional: true },
  ]);

  // ===== FIRE KALKULAČKA =====
  await testPage(page, '/kalkulacky/fire-kalkulacka', [
    { name: 'Input pole', selector: 'input[type="number"]', action: 'fill', value: '50000' },
    { name: 'Další input', selector: 'input[type="number"]:nth-of-type(2)', action: 'fill', value: '30000', optional: true },
    { name: 'Slider', selector: 'input[type="range"]', action: 'slide', value: '7', optional: true },
  ]);

  // ===== HYPOTEČNÍ KALKULAČKA =====
  await testPage(page, '/kalkulacky/hypotecni-kalkulacka', [
    { name: 'Výše hypotéky', selector: 'input[type="number"]', action: 'fill', value: '3000000' },
    { name: 'Úroková sazba', selector: 'input[type="number"]:nth-of-type(2)', action: 'fill', value: '5.5', optional: true },
    { name: 'Slider', selector: 'input[type="range"]', action: 'slide', value: '25', optional: true },
  ]);

  // ===== MONTE CARLO SIMULÁTOR =====
  await testPage(page, '/kalkulacky/monte-carlo-simulator', [
    { name: 'Počáteční kapitál', selector: 'input[type="number"]', action: 'fill', value: '500000' },
    { name: 'Měsíční investice', selector: 'input[type="number"]:nth-of-type(2)', action: 'fill', value: '10000', optional: true },
    { name: 'Spustit simulaci', selector: 'button', action: 'click', optional: true },
  ]);

  // ===== BACKTEST PORTFOLIA =====
  await testPage(page, '/kalkulacky/backtest-portfolia', [
    { name: 'Počáteční investice', selector: 'input[type="number"]', action: 'fill', value: '100000' },
    { name: 'Slider alokace', selector: 'input[type="range"]', action: 'slide', value: '80', optional: true },
    { name: 'Dropdown/Select', selector: 'select, [role="combobox"]', action: 'click', optional: true },
  ]);

  // ===== ČISTÝ PLAT 2026 =====
  await testPage(page, '/kalkulacky/cisty-plat-2026', [
    { name: 'Hrubá mzda', selector: 'input[type="number"]', action: 'fill', value: '60000' },
    { name: 'Toggle/Checkbox', selector: 'input[type="checkbox"], [role="switch"]', action: 'click', optional: true },
  ]);

  // ===== KALKULAČKA POPLATKŮ ETF =====
  await testPage(page, '/kalkulacky/kalkulacka-poplatku-etf', [
    { name: 'Investovaná částka', selector: 'input[type="number"]', action: 'fill', value: '1000000' },
    { name: 'TER slider', selector: 'input[type="range"]', action: 'slide', value: '0.2', optional: true },
  ]);

  // ===== KURZOVÝ DOPAD ETF =====
  await testPage(page, '/kalkulacky/kurzovy-dopad-etf', [
    { name: 'Částka investice', selector: 'input[type="number"]', action: 'fill', value: '250000' },
    { name: 'Slider', selector: 'input[type="range"]', action: 'slide', value: '5', optional: true },
  ]);

  // ===== NOUZOVÁ REZERVA =====
  await testPage(page, '/kalkulacky/nouzova-rezerva', [
    { name: 'Měsíční výdaje', selector: 'input[type="number"]', action: 'fill', value: '35000' },
    { name: 'Počet měsíců', selector: 'input[type="number"]:nth-of-type(2)', action: 'fill', value: '6', optional: true },
  ]);

  // ===== ÚVĚROVÁ KALKULAČKA =====
  await testPage(page, '/kalkulacky/uverova-kalkulacka', [
    { name: 'Výše úvěru', selector: 'input[type="number"]', action: 'fill', value: '500000' },
    { name: 'Úroková sazba', selector: 'input[type="number"]:nth-of-type(2)', action: 'fill', value: '8', optional: true },
  ]);

  // ===== ETF DETAIL - CURRENCY SWITCHER =====
  await testPage(page, '/etf/IE00B5BMR087', [
    { name: 'Currency EUR', selector: '[data-currency="EUR"]', action: 'click' },
    { name: 'Currency CZK', selector: '[data-currency="CZK"]', action: 'click' },
    { name: 'Currency USD', selector: '[data-currency="USD"]', action: 'click' },
  ]);

  // ===== SROVNÁNÍ ETF =====
  await testPage(page, '/srovnani-etf', [
    { name: 'Search input', selector: 'input[type="text"], input[type="search"]', action: 'fill', value: 'MSCI', optional: true },
    { name: 'Dropdown', selector: 'select, [role="combobox"]', action: 'click', optional: true },
  ]);

  // ===== NEJLEPŠÍ ETF - TABULKA =====
  await testPage(page, '/nejlepsi-etf', [
    { name: 'Filtr/Tab', selector: '[role="tab"], button', action: 'click', optional: true },
    { name: 'Řazení', selector: 'th[role="button"], button[aria-sort]', action: 'click', optional: true },
  ]);

  // ===== HOMEPAGE =====
  await testPage(page, '/', [
    { name: 'ETF Search', selector: 'input[type="text"], input[type="search"]', action: 'fill', value: 'S&P', optional: true },
    { name: 'CTA Button', selector: 'a[href*="kalkulacky"], a[href*="etf"]', action: 'click', optional: true },
  ]);

  await browser.close();

  // ===== VÝSLEDKY =====
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 VÝSLEDKY');
  console.log('═══════════════════════════════════════════════════════════');

  console.log(`\n✅ Úspěšných testů: ${successes.length}`);
  console.log(`❌ Chyb: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n🔴 CHYBY:');
    console.log('─────────────────────────────────────────');

    // Group by page
    const errorsByPage = {};
    errors.forEach(err => {
      if (!errorsByPage[err.page]) errorsByPage[err.page] = [];
      errorsByPage[err.page].push(err);
    });

    Object.keys(errorsByPage).forEach(pagePath => {
      console.log(`\n${pagePath}:`);
      errorsByPage[pagePath].forEach(err => {
        console.log(`  • ${err.test}: ${err.error}`);
      });
    });
  }

  if (errors.length === 0) {
    console.log('\n🎉 Všechny interaktivní prvky fungují správně!\n');
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
