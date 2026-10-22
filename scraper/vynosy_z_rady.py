#!/usr/bin/env python3
"""
Výnosy za období (letos, 1 m, 3 m, 6 m, 1 r, 3 r, 5 let) z DENNÍ ŘADY zdroje – nezávisle na čase stažení.

PROČ (21. 10. 2026): justETF zveřejní večer za obchodní den D PŘEDBĚŽNOU hodnotu (≈ evropská závěrečná cena)
a během dne D+1 ji PŘEPÍŠE konečnou (NAV). Příklad SXR8: 19. 10. = 743,07 do 20. 10. 05:25 UTC, pak 739,32.
Výnosy z HTML profilu se počítají k POSLEDNÍMU bodu řady – ten je v době stažení předběžný → u fondů na USA
odchylka 0,2–0,9 p. b. u všech období. Profil navíc u části fondů není přepočítaný denně (LYP6, ZPRV, WSPX
21. 10. ukazovaly výnosy k jinému dni než poslední bod řady) a některé fondy mají řadu o dny pozadu
(ESEA, PSP5, S5USAS, WSPX končily 16. 10.), web je ale značil globálním datem.

JAK: jedno volání chart API na fond (EUR, s dividendami – stejné parametry jako graf na profilu zdroje, celá
historie fondu, ~60–530 kB, tj. méně než samotný HTML profil ~440 kB), konec období = poslední pracovní den ≥ 2 prac. dny před stažením a zároveň ne poslední bod řady (viz konec_konecny)
řady (= poslední jistě konečný; víkendové kopie se přeskakují podle data), začátek = poslední bod ≤ (konec − N
kalendářních měsíců), letos = poslední bod ≤ 31. 12. předchozího roku, od vzniku = první bod řady (= profil
„Since inception (MAX)“, ověřeno: SXR8 862,35 % = profil 862,35 %, EXSA 413,93 = 413,93).

PROČ RELATIVE_CHANGE, NE MARKET_VALUE: obě řady má zdroj zaokrouhlené na 2 desetinná místa. U ceny (MARKET_VALUE)
to u levných fondů dělá chybu až 0,1 % na bod (CBUS za 4,93 € → výnos o 0,12 p. b. vedle profilu, ESEA 0,03).
Relativní změna (% od prvního bodu okna, také 2 des. místa) má chybu 0,005 p. b. na úroveň ~100 % → shoda s
profilem ≤ 0,015 p. b. u všech 34 ověřených fondů (21. 10. 2026; MARKET_VALUE ≤ 0,005 jen u dražších fondů).
Kde by chyba zaokrouhlení přesáhla MAX_CHYBA_PB (fond od začátku okna spadl na zlomek – páka, krypto),
stáhne se řada znovu s počátkem přímo v začátku období (úroveň ≈ 100 %, chyba ≤ 0,01 p. b.).

Selže-li API, výnosy za období = None (web ukáže „—"), NIKDY ne tichá náhrada z HTML profilu.

PORUCHY ŘADY U ZDROJE (22. 10. 2026, kontrolní kolo 7):
- NULOVÁ CENA v historii: BTCW (GB00BJYDH287, 1,4 mld. €) má u zdroje 25. 5.–15. 8. 2021 cenu 0 / 0,01 €. Relativní
  řada celé historie je od první nuly navždy −100 % → body se zahazovaly, řada „končila“ 24. 5. 2021 a fond měl
  VŠECHNY výnosy None (stejně dalších 12 pákových ETP). Teď se nulové body drží (úroveň 0) a období, které díru
  nezahrnuje, se spočítá z řady s kotvou v začátku období. Období přes díru (a od vzniku) zůstane None.
- SKOK, KTERÝ NEMŮŽE BÝT SKUTEČNÝ: jednodenní změna úrovně víc než ×MAX_SKOK nebo pod ×1/MAX_SKOK (−90 %).
  HASH/HAMO (Hashdex) 21.→22. 9. 2026 49,55 → 1,70 (−96,6 %; burza ani bitcoin nic takového nemají – obchodování
  na Xetře stojí od 11. 9. na 49,61 €), DIS3 16.→17. 9. 2026 0,13 → 26,37 (×200, neupravená konsolidace) → výnos
  za 1 m +22 208 %. Výnos období, které takový den obsahuje, = None.
- PŘETEČENÍ SLOUPCE: |výnos| ≥ MAX_VYNOS_PCT se do DB nevejde (numeric(8,4)) a shodí upload CELÉ dávky 5 fondů
  (21.–22. 10. 2026 denně 25 fondů bez aktualizace, mj. BTCN, SPUT, SGLS) → None.
"""

import calendar
import random
import time
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple

import requests

API = ("https://www.justetf.com/api/etfs/{isin}/performance-chart?locale=en&currency=EUR"
       "&valuesType=RELATIVE_CHANGE&reduceData=false&includeDividends=true&features=DIVIDENDS"
       "&dateFrom={od}&dateTo={do}")

MESICU = {'1m': 1, '3m': 3, '6m': 6, '1y': 12, '3y': 36, '5y': 60}
OBDOBI = ('ytd', '1m', '3m', '6m', '1y', '3y', '5y', 'inception')
OD_POCATKU = date(1990, 1, 1)   # dateFrom celé historie (první ETF v Evropě 2000)
MAX_MEZERA_ZACATKU = 7   # dní: bod začátku smí být nejvýš týden před požadovaným dnem (jinak fond tehdy neexistoval)
MAX_CHYBA_PB = 0.02      # p. b.: nejvyšší přípustná chyba zaokrouhlení zdroje u výnosu (jinak přesnější řada / None)
ZAOKROUHLENI = 0.005     # zdroj dává relativní změnu v % na 2 desetinná místa → ±0,005 p. b.
MAX_SKOK = 10.0          # jednodenní změna úrovně > ×10 nebo < ×0,1 = porucha řady u zdroje (ne trh)
MAX_VYNOS_PCT = 9999.0   # sloupce výnosů numeric(8,4) pojmou |x| < 10 000 → větší = None (jinak spadne celá dávka)

Rada = List[Tuple[date, float]]   # (datum, úroveň; 1.0 = první bod okna)


def mesice_zpet(d: date, mesicu: int) -> date:
    """d − N kalendářních měsíců, den oříznutý na konec měsíce (31. 3. − 1 m = 28./29. 2.)."""
    t = d.year * 12 + (d.month - 1) - mesicu
    rok, mes = divmod(t, 12)
    return date(rok, mes + 1, min(d.day, calendar.monthrange(rok, mes + 1)[1]))


def zacatek_obdobi(konec: date, obdobi: str) -> date:
    if obdobi == 'inception':
        return OD_POCATKU
    if obdobi == 'ytd':
        return date(konec.year - 1, 12, 31)
    return mesice_zpet(konec, MESICU[obdobi])


def stahni_radu(session: requests.Session, isin: str, od: date, do: date,
                pokusu: int = 3, pauza_s: float = 20.0) -> Optional[Rada]:
    """Denní řada úrovní (1.0 = první bod) v EUR s dividendami za [od, do]. None = nepodařilo se / fond nemá data.

    Šetrně: jedno volání (~60 kB za 5 let), krátká náhodná pauza před voláním, retry s rostoucí pauzou při
    chybě sítě / 429 / 5xx."""
    url = API.format(isin=isin, od=od.isoformat(), do=do.isoformat())
    for pokus in range(pokusu):
        try:
            time.sleep(random.uniform(0.2, 0.6))
            r = session.get(url, timeout=30, headers={'Accept': 'application/json'})
            if r.status_code in (400, 404):
                return None
            if r.status_code == 429 or r.status_code >= 500:
                raise requests.exceptions.HTTPError(f"HTTP {r.status_code}")
            r.raise_for_status()
            rada = []
            for b in r.json().get('series') or []:
                try:
                    v = float((b.get('value') or {}).get('raw'))
                    d = date.fromisoformat(str(b.get('date'))[:10])
                except (TypeError, ValueError):
                    continue
                # ≤ −100 % = nulová cena u zdroje (díra v datech). Bod se DRŽÍ s úrovní 0 (dřív se zahazoval a řada
                # pak „končila“ před dírou → všechny výnosy None, BTCW); období přes něj vyřadí _porucha.
                rada.append((d, max(0.0, 1 + v / 100)))
            rada.sort(key=lambda x: x[0])
            return rada or None
        except (requests.exceptions.RequestException, ValueError):
            if pokus < pokusu - 1:
                time.sleep(pauza_s * (pokus + 1))
    return None


def _pracovni_den_zpet(d: date, n: int) -> date:
    """d − n pracovních dnů (po–pá; svátky burz neznáme)."""
    while n > 0:
        d -= timedelta(days=1)
        if d.weekday() < 5:
            n -= 1
    return d


def konec_konecny(rada: Rada, dnes: Optional[date] = None) -> Optional[date]:
    """Poslední JISTĚ KONEČNÝ obchodní den řady.

    Zdroj (ověřeno 20.–21. 10. 2026, SXR8): bod dne D je večer PŘEDBĚŽNÝ (≈ evropská závěrečná cena) a konečnou
    hodnotou ho přepíše až během D+1 / v noci na D+2; během obchodování navíc přidává PRŮBĚŽNÝ bod dneška. Proto
    nestačí „předposlední bod řady“ (21. 10. po 07:20 UTC to byl předběžný 20. 10.). Konec = nejnovější pracovní
    den, který (a) není posledním pracovním bodem řady a (b) je aspoň 2 pracovní dny před dnem stažení
    (stažení ve středu → pondělí). Víkendové body jsou kopie pátku a přeskakují se podle data."""
    prac = [d for d, _ in rada if d.weekday() < 5]
    if len(prac) < 2:
        return None
    mez = _pracovni_den_zpet(dnes or date.today(), 2)
    kandidati = [d for d in prac[:-1] if d <= mez]
    return kandidati[-1] if kandidati else None


def _bod(rada: Rada, d: date) -> Optional[Tuple[date, float]]:
    """Poslední bod řady s datem ≤ d (řada je seřazená)."""
    vysl = None
    for b in rada:
        if b[0] <= d:
            vysl = b
        else:
            break
    return vysl


def _porucha(rada: Rada, od: date, do: date) -> Optional[date]:
    """První den v (od, do], kdy je řada u zdroje porušená: nulová úroveň, nebo jednodenní skok víc než ×MAX_SKOK
    / pod ×1/MAX_SKOK proti předchozímu bodu. None = řada je v okně v pořádku."""
    pred = None
    for d, u in rada:
        if d > do:
            break
        if d >= od:
            if u <= 0:
                return d
            if pred is not None and pred[0] >= od and (u / pred[1] > MAX_SKOK or u / pred[1] < 1 / MAX_SKOK):
                return d
        pred = (d, u)
    return None


def vynos_obdobi(rada: Rada, konec: date, obdobi: str) -> Tuple[Optional[float], float, Optional[date]]:
    """(výnos v % nebo None, odhad chyby zaokrouhlení zdroje v p. b., datum bodu začátku).

    Od vzniku = první bod řady (řada se stahuje od OD_POCATKU, tj. začíná prvním dnem fondu u zdroje).
    Chyba: každá úroveň má ±0,005 p. b. z zaokrouhlení; první bod řady (kotva, 0,00 %) je přesný."""
    e = _bod(rada, konec)
    if obdobi == 'inception':
        s = rada[0] if rada else None
    else:
        z = zacatek_obdobi(konec, obdobi)
        s = _bod(rada, z)
        if s and (z - s[0]).days > MAX_MEZERA_ZACATKU:
            s = None
    if not e or e[0] != konec or not s or s[1] <= 0 or e[1] <= 0:
        return None, 0.0, None
    if _porucha(rada, s[0], e[0]) is not None:   # díra nebo nemožný skok uvnitř období → raději „—“
        return None, 0.0, None
    pomer = e[1] / s[1]
    chyba = 100 * pomer * (ZAOKROUHLENI / 100) * (1 / e[1] + (0 if s is rada[0] else 1 / s[1]))
    return (pomer - 1) * 100, chyba, s[0]


def vynosy_k_datu(rada: Rada, konec: date) -> Dict[str, Optional[float]]:
    """Výnosy v % (EUR) za období k dni `konec` (bez kontroly přesnosti – pro testy a kontroly)."""
    return {o: (None if (v := vynos_obdobi(rada, konec, o)[0]) is None else round(v, 4)) for o in OBDOBI}


def vynosy_konecne(session: requests.Session, isin: str, dnes: Optional[date] = None
                   ) -> Tuple[Optional[date], Dict[str, Optional[float]], str]:
    """(returns_as_of, výnosy EUR v % podle období, poznámka do logu).

    Při neúspěchu (None, {všechna None}, důvod) – volající NESMÍ výnosy nahradit hodnotami z HTML profilu."""
    dnes = dnes or date.today()
    prazdne: Dict[str, Optional[float]] = {o: None for o in OBDOBI}
    rada = stahni_radu(session, isin, OD_POCATKU, dnes + timedelta(days=1))
    if not rada:
        return None, prazdne, 'chart API nevrátilo řadu'
    konec = konec_konecny(rada, dnes)
    if konec is None:
        return None, prazdne, f'řada má méně než 2 obchodní dny ({len(rada)} bodů)'
    if (dnes - konec).days > 31:
        # Fond u zdroje už měsíc nemá nové ceny (zrušený / pozastavený) – výnosy „k dnešku“ nepsat.
        return None, prazdne, f'řada končí {rada[-1][0]} (víc než měsíc stará)'
    vysl: Dict[str, Optional[float]] = {}
    poznamky = []
    nulova = next((d for d, u in rada if u <= 0), None)   # nulová cena u zdroje → řada celé historie od ní −100 %
    if nulova:
        poznamky.append(f'nulová cena u zdroje od {nulova}')
    for o in OBDOBI:
        v, chyba, den_zacatku = vynos_obdobi(rada, konec, o)
        if v is None and nulova and o != 'inception':
            # Díra v historii zdroje (BTCW 2021). Řada s kotvou těsně před začátkem období díru neobsahuje, pokud
            # období začíná až po ní; jinak _porucha výnos odmítne (raději None než výnos přes díru).
            z = zacatek_obdobi(konec, o)
            rada2 = stahni_radu(session, isin, z - timedelta(days=MAX_MEZERA_ZACATKU), konec + timedelta(days=1))
            v, chyba, den_zacatku = vynos_obdobi(rada2, konec, o) if rada2 else (None, 0.0, None)
        if v is not None and chyba > MAX_CHYBA_PB:
            # Úroveň řady je u začátku/konce malá (fond od vzniku hodně spadl – páka, krypto) → řada s kotvou
            # přímo v bodě začátku období (ten je pak přesně 0,00 %, chyba jen z konce ≈ 0,005 p. b.).
            rada2 = stahni_radu(session, isin, den_zacatku, konec + timedelta(days=1))
            v2, chyba2, z2 = vynos_obdobi(rada2, konec, o) if rada2 else (None, 0.0, None)
            if v2 is not None and z2 == den_zacatku and chyba2 <= MAX_CHYBA_PB:
                v = v2
            else:
                poznamky.append(f'{o}: chyba zaokrouhlení {chyba:.3f} p. b. → None')
                v = None
        if v is not None and abs(v) >= MAX_VYNOS_PCT:
            poznamky.append(f'{o}: {v:.0f} % se nevejde do DB → None')
            v = None
        vysl[o] = None if v is None else round(v, 4)
    return konec, vysl, '; '.join(poznamky)


if __name__ == '__main__':
    # Ruční kontrola: python vynosy_z_rady.py IE00B5BMR087 FR0011550680
    import sys
    s = requests.Session()
    s.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    for isin in sys.argv[1:]:
        print(isin, *vynosy_konecne(s, isin))
