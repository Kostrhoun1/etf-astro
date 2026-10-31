#!/usr/bin/env python3
"""
Testy meze „jistě konečného“ bodu řady zdroje (vynosy_z_rady.mez_konecnosti / konec_konecny).

PROČ (31. 10. 2026): justETF přepisuje předběžný bod dne D konečným až ~04:00 UTC dne D+2 (30. 10. 2026 bod
28. 10. mezi 03:59 a 04:01 UTC). Mez „2 pracovní dny zpět“ bez ohledu na hodinu vzala 29. 10. u 2 373 fondů
stažených před 04:00 UTC předběžný bod → výnosy za období vedle (SPGP −1,43 % úrovně, EMIM letos 1,12 p. b.).

Spuštění (bez závislostí navíc): cd scraper && python3 -m unittest test_vynosy_z_rady -v
(funguje i python3 -m pytest scraper/test_vynosy_z_rady.py, je-li pytest nainstalovaný).
"""

import os
import sys
import unittest
from datetime import date, datetime, timedelta, timezone
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import vynosy_z_rady as v  # noqa: E402

UTC = timezone.utc
SEC = timezone(timedelta(hours=1))   # Praha 30. 10. 2026 (zimní čas od 25. 10.)


def utc(rok, mes, den, hod, minut=0):
    return datetime(rok, mes, den, hod, minut, tzinfo=UTC)


def rada_do(posledni: date, od: date = date(2026, 9, 1)):
    """Syntetická denní řada po–ne (víkend = kopie pátku jako u zdroje) končící dnem `posledni` (průběžný bod)."""
    rada, d, u = [], od, 1.0
    while d <= posledni:
        if d.weekday() < 5:
            u *= 1.001
        rada.append((d, u))
        d += timedelta(days=1)
    return rada


class MezKonecnosti(unittest.TestCase):
    def test_patek_0130_utc_je_utery(self):
        # Pá 30. 10. 01:30 UTC (start běhu z pg_cron): bod středy 28. 10. je ještě předběžný → 3 prac. dny zpět
        self.assertEqual(v.mez_konecnosti(utc(2026, 10, 30, 1, 30)), date(2026, 10, 27))

    def test_patek_0530_utc_je_streda(self):
        # Pá 30. 10. 05:30 UTC: bod 28. 10. už zdroj přepsal (03:59–04:01 UTC) + 1 h rezerva → 2 prac. dny zpět
        self.assertEqual(v.mez_konecnosti(utc(2026, 10, 30, 5, 30)), date(2026, 10, 28))

    def test_hranice_0500_utc(self):
        self.assertEqual(v.mez_konecnosti(utc(2026, 10, 30, 4, 59)), date(2026, 10, 27))
        self.assertEqual(v.mez_konecnosti(utc(2026, 10, 30, 5, 0)), date(2026, 10, 28))

    def test_pondeli_0500_utc_je_ctvrtek(self):
        # Po 2. 11. 05:00 UTC (pondělní pg_cron): 2 prac. dny zpět = pá 30. 10., čt 29. 10. → čtvrtek
        self.assertEqual(v.mez_konecnosti(utc(2026, 11, 2, 5, 0)), date(2026, 10, 29))
        # Pondělí před 05:00 UTC: 3 prac. dny zpět → středa
        self.assertEqual(v.mez_konecnosti(utc(2026, 11, 2, 4, 59)), date(2026, 10, 28))

    def test_utery_0130_utc_je_ctvrtek(self):
        # Út 3. 11. 01:30 UTC: po, pá, čt → čtvrtek 29. 10. (páteční bod se v mezi ještě nebere – rezerva)
        self.assertEqual(v.mez_konecnosti(utc(2026, 11, 3, 1, 30)), date(2026, 10, 29))

    def test_cas_v_jine_zone_se_prevede_na_utc(self):
        # 05:30 SEČ = 04:30 UTC → ještě před přepisem+rezervou; 06:30 SEČ = 05:30 UTC → po
        self.assertEqual(v.mez_konecnosti(datetime(2026, 10, 30, 5, 30, tzinfo=SEC)), date(2026, 10, 27))
        self.assertEqual(v.mez_konecnosti(datetime(2026, 10, 30, 6, 30, tzinfo=SEC)), date(2026, 10, 28))

    def test_naivni_cas_se_odmitne(self):
        with self.assertRaises(ValueError):
            v.mez_konecnosti(datetime(2026, 10, 30, 5, 30))


class KonecKonecny(unittest.TestCase):
    # Řada stažená v pátek 30. 10.: poslední bod = průběžný pátek, 29. 10. a (do ~04:00 UTC) 28. 10. předběžné
    RADA = rada_do(date(2026, 10, 30))

    def test_pred_prepisem_konci_v_utery(self):
        self.assertEqual(v.konec_konecny(self.RADA, ted=utc(2026, 10, 30, 1, 30)), date(2026, 10, 27))

    def test_po_prepisu_konci_ve_stredu(self):
        self.assertEqual(v.konec_konecny(self.RADA, ted=utc(2026, 10, 30, 5, 30)), date(2026, 10, 28))

    def test_nikdy_posledni_bod_rady(self):
        # Řada o dny pozadu (končí 28. 10.) → 28. 10. je její poslední bod, i po 05:00 UTC se bere 27. 10.
        rada = rada_do(date(2026, 10, 28))
        self.assertEqual(v.konec_konecny(rada, ted=utc(2026, 10, 30, 5, 30)), date(2026, 10, 27))

    def test_vikendove_kopie_se_preskakuji(self):
        # Pondělí 05:00 UTC, řada končí nedělní kopií pátku → konec = čtvrtek 29. 10.
        rada = rada_do(date(2026, 11, 1))
        self.assertEqual(v.konec_konecny(rada, ted=utc(2026, 11, 2, 5, 0)), date(2026, 10, 29))

    def test_jen_den_bez_hodiny_je_konzervativni(self):
        # Bez hodiny nevíme, jestli zdroj už bod přepsal → 3 prac. dny (pá → út), ne dřívější 2 (pá → st)
        self.assertEqual(v.konec_konecny(self.RADA, dnes=date(2026, 10, 30)), date(2026, 10, 27))

    def test_vychozi_je_aktualni_cas_v_utc(self):
        class Hodiny(datetime):
            @classmethod
            def now(cls, tz=None):
                return datetime(2026, 10, 30, 1, 30, tzinfo=UTC).astimezone(tz)
        with mock.patch.object(v, 'datetime', Hodiny):
            self.assertEqual(v.konec_konecny(self.RADA), date(2026, 10, 27))


class VynosyKonecne(unittest.TestCase):
    def test_konec_podle_hodiny_stazeni(self):
        rada = rada_do(date(2026, 10, 30), od=date(2020, 1, 1))
        with mock.patch.object(v, 'stahni_radu', return_value=rada) as stahni:
            konec, vynosy, _ = v.vynosy_konecne(None, 'IE00B3RBWM25', ted=utc(2026, 10, 30, 1, 30))
            self.assertEqual(konec, date(2026, 10, 27))
            self.assertEqual(stahni.call_args[0][3], date(2026, 10, 31))   # dateTo = den stažení (UTC) + 1
            self.assertIsNotNone(vynosy['1m'])
            konec, _, _ = v.vynosy_konecne(None, 'IE00B3RBWM25', ted=utc(2026, 10, 30, 5, 30))
            self.assertEqual(konec, date(2026, 10, 28))
            # 00:30 SEČ v sobotu 31. 10. = 23:30 UTC v pátek → den stažení je pátek (UTC), ne sobota
            v.vynosy_konecne(None, 'IE00B3RBWM25', ted=datetime(2026, 10, 31, 0, 30, tzinfo=SEC))
            self.assertEqual(stahni.call_args[0][3], date(2026, 10, 31))

    def test_vynos_odpovida_bodum_rady(self):
        # Nezávislý přepočet z holých bodů: 1 m k 28. 10. = úroveň 28. 10. / úroveň posledního bodu ≤ 28. 9. − 1
        rada = rada_do(date(2026, 10, 30), od=date(2020, 1, 1))
        body = dict(rada)
        ocekavany = (body[date(2026, 10, 28)] / body[date(2026, 9, 28)] - 1) * 100
        with mock.patch.object(v, 'stahni_radu', return_value=rada):
            _, vynosy, _ = v.vynosy_konecne(None, 'X', ted=utc(2026, 10, 30, 5, 30))
        self.assertAlmostEqual(vynosy['1m'], ocekavany, places=4)


if __name__ == '__main__':
    unittest.main(verbosity=2)
