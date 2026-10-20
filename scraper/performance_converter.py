#!/usr/bin/env python3
"""
Performance Converter - přepočet EUR performance na CZK/USD s ohledem na změny směnných kurzů
Stejná logika jako má justETF pro různé měny
"""

import calendar
from typing import Dict, Optional, Tuple
from datetime import date, datetime, timedelta, timezone
from exchange_rates_fetcher import ExchangeRatesFetcher

def _get_verbose_mode() -> bool:
    """Helper function to get VERBOSE_MODE from final_scraper"""
    try:
        import sys
        if 'final_scraper' in sys.modules:
            return getattr(sys.modules['final_scraper'], 'VERBOSE_MODE', False)
        else:
            return False
    except:
        return False

def safe_log(level: str, message: str):
    """Utility logging function - respects VERBOSE_MODE from final_scraper"""
    VERBOSE_MODE = _get_verbose_mode()
    
    # V non-verbose módu skryj VŠECHNY debug zprávy a všechny currency zprávy
    if not VERBOSE_MODE:
        # Žádné debug zprávy vůbec
        if level == 'debug':
            return
        # Žádné currency-related zprávy
        if any(keyword in message for keyword in [
            '💱', 'Currency', 'Convert', 'EUR ->', 'CZK', 'USD', 'pp)', 'CNB:', 'Frankfurter:', 
            'Přepočítávám performance', 'performance přidána', 'Přidány CZK/USD', 'k 2025-', 'k 2024-',
            'rates:', '->  ', '%', 'kurz', 'rate'
        ]):
            return
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {level.upper()}: {message}")

# ── Den, ke kterému platí data zdroje, a začátky období ──────────────────────────────────────────
# KOLO 6 (20. 10. 2026): výnosy v Kč/USD za 3 m, 6 m, 1 r, 3 r a 5 let nesouhlasily s výnosem v EUR
# přepočteným kurzem ČNB ke stejným dnům (5 let o 0,4–1,0 p. b., 3 roky o 0,2–0,3 p. b.). Příčina: začátek
# období se bral jako „dnes − 30/90/180/365×N dní“ (5 let = 21. 10. 2021 místo 19. 10. 2021) a konec jako
# „dnešní“ kurz (před 14:30 ČNB vrátí včerejší, po 14:30 dnešní → podle hodiny běhu). justETF ale počítá
# EUR výnos od dne dat − N kalendářních měsíců do dne dat (ověřeno kontrolou kolo5 C na 0,00 p. b.).
# Teď: konec = kurz ke dni dat (poslední obchodní den před stažením – stejná logika jako web
# src/lib/datumCen.ts), začátek = kurz ke dni (den dat − N měsíců; YTD 31. 12. předchozího roku);
# o víkendu/svátku platí poslední kurz ≤ ten den (ČNB i Frankfurter tak odpovídají samy).

MESICU = {'1m': 1, '3m': 3, '6m': 6, '1y': 12, '3y': 36, '5y': 60}


def datum_dat(stazeno: Optional[datetime] = None) -> date:
    """Den, ke kterému platí ceny zdroje při stažení v čase `stazeno` (výchozí: teď).

    Kopie web src/lib/datumCen.ts: stažení před 18:00 pražského času (nebo o víkendu) → předchozí
    pracovní den; později v pracovní den → týž den. Svátky burz neznáme (jako web)."""
    if stazeno is None:
        stazeno = datetime.now(timezone.utc)
    if stazeno.tzinfo is None:  # naivní čas bereme jako UTC (GitHub Actions běží v UTC)
        stazeno = stazeno.replace(tzinfo=timezone.utc)
    try:
        from zoneinfo import ZoneInfo
        praha = stazeno.astimezone(ZoneInfo('Europe/Prague'))
    except Exception:  # bez tzdata: SEČ (v létě o hodinu vedle – na hranici 18:00 nevadí)
        praha = stazeno.astimezone(timezone(timedelta(hours=1)))
    d = praha.date()
    if praha.hour < 18 or d.weekday() >= 5:
        d -= timedelta(days=1)
        while d.weekday() >= 5:
            d -= timedelta(days=1)
    return d


def mesice_zpet(d: date, mesicu: int) -> date:
    """d − N kalendářních měsíců, den oříznutý na konec měsíce (31. 3. − 1 m = 28./29. 2.)."""
    t = d.year * 12 + (d.month - 1) - mesicu
    rok, mes = divmod(t, 12)
    return date(rok, mes + 1, min(d.day, calendar.monthrange(rok, mes + 1)[1]))


def obdobi_dny(period: str, den_dat: date) -> Optional[Tuple[date, date]]:
    """(začátek, konec) období pro přepočet kurzem, nebo None pro neznámé/budoucí období."""
    if period in MESICU:
        return mesice_zpet(den_dat, MESICU[period]), den_dat
    if period == 'ytd':
        return date(den_dat.year - 1, 12, 31), den_dat
    if period.isdigit() and len(period) == 4:
        rok = int(period)
        if rok > den_dat.year:
            return None
        return date(rok - 1, 12, 31), (date(rok, 12, 31) if rok < den_dat.year else den_dat)
    return None


class PerformanceConverter:
    def __init__(self):
        self.exchange_fetcher = ExchangeRatesFetcher()
        self.rates_cache = {}

    def _kurz(self, den: date, target_currency: str) -> Optional[float]:
        d = datetime(den.year, den.month, den.day)
        if target_currency == 'CZK':
            return self.exchange_fetcher.fetch_cnb_rate(d, 'EUR')        # Kč za 1 EUR (ČNB)
        if target_currency == 'USD':
            return self.exchange_fetcher.fetch_frankfurter_rate(d, 'USD')  # USD za 1 EUR (ECB)
        safe_log("error", f"Nepodporovaná měna: {target_currency}")
        return None

    def get_exchange_rates_for_period(self, period: str, target_currency: str,
                                      den_dat: Optional[date] = None) -> Tuple[Optional[float], Optional[float]]:
        """Kurzy EUR→cílová měna na začátku a konci období. Returns: (kurz_zacatek, kurz_konec)"""
        den_dat = den_dat or datum_dat()
        cache_key = f"{period}_{target_currency}_{den_dat.isoformat()}"
        if cache_key in self.rates_cache:
            return self.rates_cache[cache_key]
        dny = obdobi_dny(period, den_dat)
        if dny is None:
            safe_log("warning", f"Neznámé období: {period}")
            return None, None
        result = (self._kurz(dny[0], target_currency), self._kurz(dny[1], target_currency))
        self.rates_cache[cache_key] = result
        return result

    def convert_performance_eur_to_target(
        self, 
        performance_eur: float, 
        period: str, 
        target_currency: str,
        base_investment: float = 1000.0,
        den_dat: Optional[date] = None
    ) -> Optional[float]:
        """
        Přepočítá EUR performance na target currency s ohledem na změnu směnného kurzu
        
        Args:
            performance_eur: Performance v EUR (např. 25.5 pro 25.5%)
            period: Období ('1m', '3m', '6m', '1y', '3y', '5y', etc.)
            target_currency: Cílová měna ('CZK', 'USD')
            base_investment: Výchozí investice pro simulaci (default 1000 EUR)
            
        Returns:
            Performance v target currency jako % (nebo None při chybě)
        """
        
        if performance_eur is None:
            return None
        
        # Získej kurzy
        historical_rate, current_rate = self.get_exchange_rates_for_period(period, target_currency, den_dat)
        
        if historical_rate is None or current_rate is None:
            safe_log("warning", f"Kurzy nedostupné pro {period} -> {target_currency}")
            return None
        
        # Simulace investice
        initial_eur = base_investment
        final_eur = initial_eur * (1 + performance_eur / 100)
        
        # Přepočet na cílovou měnu
        initial_target = initial_eur * historical_rate
        final_target = final_eur * current_rate
        
        # Výpočet performance v cílové měně
        performance_target = ((final_target - initial_target) / initial_target) * 100
        
        # Performance conversion completed - no need to log
        
        return performance_target
    
    def convert_all_performance_periods(
        self, 
        etf_performance_eur: Dict[str, float], 
        target_currency: str,
        den_dat: Optional[date] = None
    ) -> Dict[str, float]:
        """
        Přepočítá všechna performance období z EUR na target currency
        
        Args:
            etf_performance_eur: Dict s EUR performance {'1y': 25.5, '3y': 54.89, ...}
            target_currency: 'CZK' nebo 'USD'
            
        Returns:
            Dict s přepočtenými performance v target currency
        """
        
        result = {}
        
        # Converting performance from EUR to target currency
        
        for period, performance_eur in etf_performance_eur.items():
            if performance_eur is not None:
                converted = self.convert_performance_eur_to_target(
                    performance_eur, period, target_currency, den_dat=den_dat
                )
                result[period] = converted
            else:
                result[period] = None
        
        return result

def test_performance_converter():
    """Test funkce pro ověření konverze"""
    print("🧪 Test Performance Converter")
    print("=" * 60)
    
    # Testovací performance data (podobná VWCE)
    test_performance_eur = {
        '1m': 2.22,
        '3m': 7.13,
        '6m': 9.54,
        '1y': 11.07,
        '3y': 54.89,
        '5y': 96.20,
        '2021': 32.10,
        '2022': -12.96,
        '2023': 19.55,
        '2024': 26.24,
    }
    
    converter = PerformanceConverter()
    
    print("\n📊 PŮVODNÍ PERFORMANCE (EUR):")
    for period, perf in test_performance_eur.items():
        print(f"  {period:>4}: {perf:>6.2f}%")
    
    print("\n💱 KONVERZE DO CZK:")
    performance_czk = converter.convert_all_performance_periods(test_performance_eur, 'CZK')
    
    print("\n💱 KONVERZE DO USD:")
    performance_usd = converter.convert_all_performance_periods(test_performance_eur, 'USD')
    
    print("\n📋 SOUHRNNÁ TABULKA:")
    print(f"{'Období':>6} | {'EUR':>8} | {'CZK':>8} | {'USD':>8} | {'CZK vs EUR':>10} | {'USD vs EUR':>10}")
    print("-" * 70)
    
    for period in test_performance_eur.keys():
        eur_val = test_performance_eur[period]
        czk_val = performance_czk.get(period)
        usd_val = performance_usd.get(period)
        
        czk_diff = (czk_val - eur_val) if czk_val is not None else None
        usd_diff = (usd_val - eur_val) if usd_val is not None else None
        
        czk_str = f"{czk_val:>6.2f}%" if czk_val is not None else "   N/A"
        usd_str = f"{usd_val:>6.2f}%" if usd_val is not None else "   N/A"
        czk_diff_str = f"{czk_diff:>+7.2f}pp" if czk_diff is not None else "     N/A"
        usd_diff_str = f"{usd_diff:>+7.2f}pp" if usd_diff is not None else "     N/A"
        
        print(f"{period:>6} | {eur_val:>6.2f}% | {czk_str} | {usd_str} | {czk_diff_str} | {usd_diff_str}")

def create_performance_conversion_for_scraper():
    """
    Vytvoří funkci pro integraci do scraperu
    Returns: Dict s funkcemi pro použití ve scraperu
    """
    
    converter = PerformanceConverter()
    
    def add_currency_performance_to_etf(etf_data: dict) -> dict:
        """
        Přidá CZK a USD performance k ETF datům
        """
        # Extraktuj EUR performance z ETF dat
        eur_performance = {}
        
        performance_fields = [
            'return_1m', 'return_3m', 'return_6m', 'return_ytd', 'return_1y', 
            'return_3y', 'return_5y', 'return_2021', 'return_2022', 'return_2023', 'return_2024', 'return_2025'
        ]
        
        for field in performance_fields:
            if field in etf_data and etf_data[field] is not None:
                # Převod field name na period name
                period = field.replace('return_', '')
                eur_performance[period] = etf_data[field]
        
        # Den, ke kterému platí stažené výnosy (poslední obchodní den před stažením) – kurzy ke stejným dnům.
        den_dat = datum_dat()

        # Konverze na CZK
        czk_performance = converter.convert_all_performance_periods(eur_performance, 'CZK', den_dat)
        
        # Konverze na USD
        usd_performance = converter.convert_all_performance_periods(eur_performance, 'USD', den_dat)
        
        # Přidej do ETF dat
        for period, czk_val in czk_performance.items():
            if czk_val is not None:
                field_name = f"return_{period}_czk"
                etf_data[field_name] = round(czk_val, 4)
        
        for period, usd_val in usd_performance.items():
            if usd_val is not None:
                field_name = f"return_{period}_usd"
                etf_data[field_name] = round(usd_val, 4)
        
        safe_log("info", f"✅ Přidány CZK/USD performance pro {etf_data.get('isin', 'unknown')}")
        
        return etf_data
    
    return {
        'converter': converter,
        'add_currency_performance': add_currency_performance_to_etf
    }

if __name__ == "__main__":
    test_performance_converter()