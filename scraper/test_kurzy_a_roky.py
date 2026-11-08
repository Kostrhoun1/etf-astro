#!/usr/bin/env python3
"""
Testy: výpadek kurzu (ČNB/Frankfurter) a kalendářní roky (2026/2027, ochrana uzavřených let).

PROČ (8. 11. 2026):
- 21. 9. 2026 jeden přechodný výpadek kurzu (1 pokus, timeout 10 s) uložil do cache (None, kurz) a všechny
  další fondy se stejným dnem a obdobím dostaly None (4 fondy Janus bez USD). V logu nebylo nic – safe_log
  mimo podrobný režim zahazoval zprávy se slovy „kurz“, „CZK“, „USD“, „rate“, i chyby.
- justETF ukazuje jen posledních 5 kalendářních let. V lednu přidá nový rok a nejstarší vyřadí – rok 2021
  tak upload přepsal na null. Parser navíc znal jen popisky 2021–2025.

Síť se nepoužívá (requests i Supabase jsou mockované).
Spuštění: cd scraper && python3 -m unittest test_kurzy_a_roky -v
"""

import io
import os
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from datetime import date, datetime
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import requests  # noqa: E402

import exchange_rates_fetcher as erf  # noqa: E402
import performance_converter as pc  # noqa: E402


def odpoved(status=200, text='', json_data=None):
    r = mock.Mock()
    r.status_code = status
    r.text = text
    r.json.return_value = json_data
    return r


CNB_TEXT = "18.09.2026 #181\nzemě|měna|množství|kód|kurz\nEMU|euro|1|EUR|24,350\nUSA|dolar|1|USD|20,780\n"
DEN = datetime(2026, 9, 18)


def _final_scraper():
    """Import final_scraperu v dočasné složce – při importu zakládá justetf_complete_production/ a log."""
    if 'final_scraper' not in sys.modules:
        puvodni = os.getcwd()
        os.chdir(tempfile.mkdtemp(prefix='test_final_scraper_'))
        try:
            import final_scraper  # noqa: F401
        finally:
            os.chdir(puvodni)
    return sys.modules['final_scraper']


# ── A(1): neúplný výsledek kurzů se neukládá do cache ─────────────────────────────────────────────────────────

class CacheKurzu(unittest.TestCase):
    def setUp(self):
        self.conv = pc.PerformanceConverter()
        self.conv.exchange_fetcher = mock.Mock()

    def test_vypadek_se_neulozi_a_dalsi_volani_kurz_stahne_znovu(self):
        f = self.conv.exchange_fetcher.fetch_cnb_rate
        f.side_effect = [None, 25.0,      # 1. fond: začátek období – výpadek
                         24.0, 25.0]      # 2. fond: kurz se stáhne znovu
        den = date(2026, 9, 18)
        self.assertEqual(self.conv.get_exchange_rates_for_period('1y', 'CZK', den), (None, 25.0))
        self.assertEqual(self.conv.rates_cache, {})
        self.assertEqual(self.conv.get_exchange_rates_for_period('1y', 'CZK', den), (24.0, 25.0))
        self.assertEqual(f.call_count, 4)
        # úplný výsledek už z cache (žádné další stahování)
        self.assertEqual(self.conv.get_exchange_rates_for_period('1y', 'CZK', den), (24.0, 25.0))
        self.assertEqual(f.call_count, 4)

    def test_prevod_s_chybejicim_kurzem_je_none_a_pocita_se_do_souhrnu(self):
        funkce = pc.create_performance_conversion_for_scraper()
        conv = funkce['converter']
        conv.exchange_fetcher = mock.Mock()
        conv.exchange_fetcher.fetch_cnb_rate.return_value = 25.0
        conv.exchange_fetcher.fetch_frankfurter_rate.return_value = None   # Frankfurter mimo provoz
        etf = {'isin': 'IE00TEST0001', 'return_1y': 10.0, 'return_2025': 5.0, 'returns_as_of': '2026-11-05'}
        with redirect_stdout(io.StringIO()) as out:
            vysledek = funkce['add_currency_performance'](etf)
        self.assertAlmostEqual(vysledek['return_1y_czk'], 10.0, places=6)   # stejný kurz na začátku i konci
        self.assertNotIn('return_1y_usd', vysledek)                          # žádná náhrada EUR hodnotou
        self.assertNotIn('return_2025_usd', vysledek)
        self.assertEqual(conv.stat_prevodu['obdobi_bez_prevodu'], 2)
        self.assertEqual(conv.stat_prevodu['fondy'], [{'isin': 'IE00TEST0001', 'obdobi': ['1y/USD', '2025/USD']}])
        self.assertIn('PŘEVOD: IE00TEST0001', out.getvalue())                # varování je vidět i mimo podrobný režim

    def test_seznam_obdobi_obsahuje_nove_roky(self):
        conv = pc.create_performance_conversion_for_scraper()
        conv['converter'].exchange_fetcher = mock.Mock()
        conv['converter'].exchange_fetcher.fetch_cnb_rate.return_value = 25.0
        conv['converter'].exchange_fetcher.fetch_frankfurter_rate.return_value = 1.1
        v = conv['add_currency_performance']({'isin': 'X', 'return_2026': 7.5, 'returns_as_of': '2027-01-06'})
        self.assertAlmostEqual(v['return_2026_czk'], 7.5, places=6)
        self.assertAlmostEqual(v['return_2026_usd'], 7.5, places=6)


# ── A(2): opakování stažení kurzu ─────────────────────────────────────────────────────────────────────────────

class OpakovaniKurzu(unittest.TestCase):
    def setUp(self):
        self.f = erf.ExchangeRatesFetcher()
        self.f.session = mock.Mock()
        self.spanek = mock.patch.object(erf.time, 'sleep').start()
        self.addCleanup(mock.patch.stopall)
        self.out = io.StringIO()
        r = redirect_stdout(self.out)
        r.__enter__()
        self.addCleanup(r.__exit__, None, None, None)

    def test_cnb_treti_pokus_uspeje(self):
        self.f.session.get.side_effect = [requests.ConnectionError('reset'), odpoved(503), odpoved(200, CNB_TEXT)]
        self.assertAlmostEqual(self.f.fetch_cnb_rate(DEN, 'EUR'), 24.35)
        self.assertEqual(self.f.session.get.call_count, 3)
        self.assertEqual([c.args[0] for c in self.spanek.call_args_list], [2, 5])

    def test_cnb_tri_selhani_none_a_chyba_v_logu(self):
        self.f.session.get.side_effect = requests.Timeout('10 s')
        self.assertIsNone(self.f.fetch_cnb_rate(DEN, 'EUR'))
        self.assertEqual(self.f.session.get.call_count, 3)
        self.assertNotIn('CNB_EUR_2026-09-18', self.f.rates_cache)
        self.assertIn('ERROR: CNB fetch error: 3 pokusy selhaly', self.out.getvalue())

    def test_frankfurter_timeout_pak_uspech(self):
        self.f.session.get.side_effect = [requests.Timeout('10 s'),
                                          odpoved(200, json_data={'date': '2026-09-18', 'rates': {'USD': 1.1734}})]
        self.assertAlmostEqual(self.f.fetch_frankfurter_rate(DEN, 'USD'), 1.1734)
        self.assertEqual(self.f.session.get.call_count, 2)
        self.assertEqual([c.args[0] for c in self.spanek.call_args_list], [2])

    def test_http_4xx_se_neopakuje(self):
        self.f.session.get.return_value = odpoved(404)
        self.assertIsNone(self.f.fetch_frankfurter_rate(DEN, 'USD'))
        self.assertEqual(self.f.session.get.call_count, 1)
        self.spanek.assert_not_called()

    def test_kontrola_data_kurzu_zustava(self):
        # kurz starší než 7 dní se nepoužije (a neopakuje se – odpověď přišla v pořádku)
        stary = "01.09.2026 #170\nzemě|měna|množství|kód|kurz\nEMU|euro|1|EUR|24,350\n"
        self.f.session.get.return_value = odpoved(200, stary)
        self.assertIsNone(self.f.fetch_cnb_rate(DEN, 'EUR'))
        self.assertEqual(self.f.session.get.call_count, 1)
        self.assertIn('nepoužiji', self.out.getvalue())

    def test_dlouhy_vypadek_zdroj_na_chvili_vynecha(self):
        self.f.session.get.side_effect = requests.ConnectionError('down')
        for den in range(1, self.f.VYPADEK_PO_SELHANI + 1):
            self.assertIsNone(self.f.fetch_cnb_rate(datetime(2026, 9, den), 'EUR'))
        volani = self.f.session.get.call_count
        self.assertEqual(volani, 3 * self.f.VYPADEK_PO_SELHANI)
        self.assertIsNone(self.f.fetch_cnb_rate(datetime(2026, 9, 20), 'EUR'))
        self.assertEqual(self.f.session.get.call_count, volani)        # vynecháno, bez dalších pokusů
        # Frankfurter se tím nevypíná
        self.f.session.get.side_effect = None
        self.f.session.get.return_value = odpoved(200, json_data={'date': '2026-09-18', 'rates': {'USD': 1.17}})
        self.assertEqual(self.f.fetch_frankfurter_rate(DEN, 'USD'), 1.17)


# ── A(3): chyby a varování se nezahazují ──────────────────────────────────────────────────────────────────────

class LogovaniChyb(unittest.TestCase):
    def test_error_a_warning_projdou_i_se_slovem_kurz(self):
        import scraper_currency_integration as sci
        for modul in (erf, pc, sci):
            with redirect_stdout(io.StringIO()) as out:
                modul.safe_log('error', 'CNB fetch error: kurz CZK USD rate')
                modul.safe_log('warning', 'Frankfurter: kurz USD nepoužiji')
                modul.safe_log('info', 'kurz CZK získáno')   # běžná info o kurzu se dál filtruje
                modul.safe_log('debug', 'cokoli')
            radky = out.getvalue().strip().splitlines()
            self.assertEqual(len(radky), 2, modul.__name__)
            self.assertIn('ERROR', radky[0])
            self.assertIn('WARNING', radky[1])


# ── B: kalendářní roky ────────────────────────────────────────────────────────────────────────────────────────

def html_vykonnosti(radky):
    tr = ''.join(f'<tr><td class="vallabel">{l}</td><td class="val green">{v}</td></tr>' for l, v in radky)
    return ('<html><body><table class="table etf-data-table"><tr><td>1 month</td><td>3 months</td><td>YTD</td></tr>'
            f'{tr}</table></body></html>')


class ParserRoku(unittest.TestCase):
    def test_popisek_2026_a_2027(self):
        fs = _final_scraper()
        from bs4 import BeautifulSoup
        etf = fs.ETFDataComplete('IE00TEST0001')
        soup = BeautifulSoup(html_vykonnosti([('1 month', '+1.00%'), ('2027', '+3.21%'), ('2026', '+17.60%'),
                                              ('2025', '+1,234.50%'), ('2023', '-5.00%')]), 'html.parser')
        fs.CompleteProductionScraper._extract_performance_robust(None, soup, etf)
        self.assertEqual(etf.return_1m, 1.0)
        self.assertEqual(etf.return_2026, 17.6)
        self.assertEqual(etf.return_2027, 3.21)
        self.assertEqual(etf.return_2025, 1234.5)
        self.assertEqual(etf.return_2023, -5.0)
        self.assertIsNone(etf.return_2022)   # zdroj neuvádí → None (DB ho nepřepíše, viz OchranaUzavrenychLet)

    def test_nove_roky_v_datove_tride_a_radku_pro_db(self):
        fs = _final_scraper()
        etf = fs.ETFDataComplete('IE00TEST0001')
        d = etf.to_dict()
        for rok in ('2026', '2027'):
            for m in ('', '_czk', '_usd'):
                self.assertIn(f'return_{rok}{m}', d)


class OchranaUzavrenychLet(unittest.TestCase):
    def setUp(self):
        fs = _final_scraper()
        self.fs = fs
        self.s = object.__new__(fs.CompleteProductionScraper)   # bez __init__ (žádná síť)
        self.s.stat_nahrani = {'nenahrane': [], 'bez_nazvu': [], 'oriznuto': [], 'roky_bez_sloupce': {}, 'zachovane_roky': {}}
        self.s.supabase = mock.MagicMock()
        self.stare = {'isin': 'IE00TEST0001', 'return_2021': 22.0, 'return_2021_czk': 20.0, 'return_2021_usd': 14.0,
                      'return_2022': -18.0, 'return_2022_czk': -20.0, 'return_2022_usd': -23.0,
                      'return_2025': 7.0, 'return_2025_czk': 3.0, 'return_2025_usd': 20.0,
                      'return_ytd': 12.0, 'return_ytd_czk': 10.0}
        self.s.supabase.table.return_value.select.return_value.in_.return_value.execute.return_value.data = [self.stare]
        mock.patch.object(fs.CompleteProductionScraper, '_aktualni_rok', staticmethod(lambda: 2027)).start()
        self.addCleanup(mock.patch.stopall)

    def radek(self, **kw):
        r = {'isin': 'IE00TEST0001', 'name': 'Test ETF'}
        for rok in ('2021', '2022', '2025', '2026'):
            for m in ('', '_czk', '_usd'):
                r[f'return_{rok}{m}'] = None
        r.update({'return_ytd': None, 'return_ytd_czk': None})
        r.update(kw)
        return r

    def test_rok_ktery_zdroj_neuvadi_se_neprepise_na_null(self):
        r = self.s._chran_stavajici_hodnoty([self.radek()])[0]
        self.assertEqual((r['return_2021'], r['return_2021_czk'], r['return_2021_usd']), (22.0, 20.0, 14.0))
        self.assertEqual((r['return_2022'], r['return_2022_czk'], r['return_2022_usd']), (-18.0, -20.0, -23.0))
        self.assertEqual(self.s.stat_nahrani['zachovane_roky'], {'2021': 1, '2022': 1, '2025': 1})

    def test_vynosy_za_obdobi_se_nechrani(self):
        r = self.s._chran_stavajici_hodnoty([self.radek()])[0]
        self.assertIsNone(r['return_ytd'])
        self.assertIsNone(r['return_ytd_czk'])

    def test_nova_hodnota_se_zapise(self):
        r = self.s._chran_stavajici_hodnoty([self.radek(return_2025=7.5, return_2025_czk=3.4, return_2025_usd=20.6)])[0]
        self.assertEqual((r['return_2025'], r['return_2025_czk'], r['return_2025_usd']), (7.5, 3.4, 20.6))

    def test_vypadek_kurzu_u_uzavreneho_roku_doplni_stare_kc_usd(self):
        # zdroj rok uvádí (stejný EUR výnos), převod do USD selhal → stará USD hodnota, ne null
        r = self.s._chran_stavajici_hodnoty([self.radek(return_2025=7.0, return_2025_czk=3.0)])[0]
        self.assertEqual(r['return_2025_usd'], 20.0)
        # jiný EUR výnos (zdroj ho opravil) → stará USD k němu nepatří, zůstane None (na webu „—“)
        r = self.s._chran_stavajici_hodnoty([self.radek(return_2025=7.4, return_2025_czk=3.3)])[0]
        self.assertIsNone(r['return_2025_usd'])

    def test_letosni_rok_se_nechrani(self):
        mock.patch.object(self.fs.CompleteProductionScraper, '_aktualni_rok', staticmethod(lambda: 2025)).start()
        r = self.s._chran_stavajici_hodnoty([self.radek()])[0]
        self.assertIsNone(r['return_2025'])          # rok 2025 v roce 2025 = YTD, ne uzavřený
        self.assertEqual(r['return_2022'], -18.0)


class SloupceNovychLet(unittest.TestCase):
    def setUp(self):
        fs = _final_scraper()
        self.s = object.__new__(fs.CompleteProductionScraper)
        self.s.stat_nahrani = {'nenahrane': [], 'bez_nazvu': [], 'oriznuto': [], 'roky_bez_sloupce': {}, 'zachovane_roky': {}}
        self.s.supabase = mock.MagicMock()
        self.dotaz = self.s.supabase.table.return_value.select.return_value.limit.return_value.execute

    def radek(self):
        r = {'isin': 'IE00TEST0001', 'return_2025': 1.0, 'return_2025_czk': 2.0, 'return_2025_usd': 3.0}
        r.update({'return_2026': 17.6, 'return_2026_czk': 15.0, 'return_2026_usd': 25.0,
                  'return_2027': None, 'return_2027_czk': None, 'return_2027_usd': None})
        return r

    def test_bez_sloupcu_v_db_se_nove_roky_neposilaji(self):
        self.dotaz.side_effect = Exception("{'code': '42703', 'message': 'column etf_funds.return_2026 does not exist'}")
        with redirect_stdout(io.StringIO()):
            r = self.s._odeber_chybejici_sloupce(self.radek())
        self.assertFalse(any(k.startswith(('return_2026', 'return_2027')) for k in r))
        self.assertEqual(r['return_2025'], 1.0)
        self.assertEqual(self.s.stat_nahrani['roky_bez_sloupce'], {'2026': 1})   # 2027 bez hodnoty se nepočítá
        self.assertEqual(self.dotaz.call_count, 2)
        self.s._odeber_chybejici_sloupce(self.radek())                           # ověření jednou za běh
        self.assertEqual(self.dotaz.call_count, 2)

    def test_se_sloupci_v_db_se_nove_roky_posilaji(self):
        self.dotaz.return_value = mock.Mock(data=[])
        r = self.s._odeber_chybejici_sloupce(self.radek())
        self.assertEqual(r['return_2026'], 17.6)
        self.assertIn('return_2027', r)
        self.assertEqual(self.s.stat_nahrani['roky_bez_sloupce'], {})


if __name__ == '__main__':
    unittest.main()
