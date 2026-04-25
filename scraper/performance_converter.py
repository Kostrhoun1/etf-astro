#!/usr/bin/env python3
"""
Performance Converter - přepočet EUR performance na CZK/USD s ohledem na změny směnných kurzů
Stejná logika jako má justETF pro různé měny
"""

from typing import Dict, Optional, Tuple
from datetime import datetime
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

class PerformanceConverter:
    def __init__(self):
        self.exchange_fetcher = ExchangeRatesFetcher()
        self.rates_cache = {}
    
    def get_period_days(self, period: str) -> int:
        """Převede období na počet dní"""
        period_map = {
            '1m': 30,
            '3m': 90,
            '6m': 180,
            'ytd': self._get_ytd_days(),
            '1y': 365,
            '3y': 365 * 3,
            '5y': 365 * 5,
            # Roční výnosy
            '2021': self._get_year_days(2021),
            '2022': self._get_year_days(2022),
            '2023': self._get_year_days(2023),
            '2024': self._get_year_days(2024),
            '2025': self._get_year_days(2025),
        }
        return period_map.get(period, 0)
    
    def _get_ytd_days(self) -> int:
        """Počet dní od začátku roku"""
        now = datetime.now()
        start_of_year = datetime(now.year, 1, 1)
        return (now - start_of_year).days
    
    def _get_year_days(self, year: int) -> int:
        """Počet dní od začátku konkrétního roku do konce roku"""
        now = datetime.now()
        start_of_year = datetime(year, 1, 1)
        end_of_year = datetime(year, 12, 31)
        
        if year < now.year:
            # Celý rok
            return (end_of_year - start_of_year).days + 1
        else:
            # Pouze do současnosti
            return (now - start_of_year).days
    
    def get_exchange_rates_for_period(self, period: str, target_currency: str) -> Tuple[Optional[float], Optional[float]]:
        """
        Získá kurzy na začátku a konci období
        Returns: (historical_rate, current_rate)
        """
        cache_key = f"{period}_{target_currency}"
        if cache_key in self.rates_cache:
            return self.rates_cache[cache_key]
        
        days_ago = self.get_period_days(period)
        if days_ago == 0:
            safe_log("warning", f"Neznámé období: {period}")
            return None, None
        
        # Aktuální kurz
        current_rates = self.exchange_fetcher.get_current_rates()
        current_rate = current_rates.get(f'EUR_{target_currency}')
        
        # Historický kurz
        historical_date = self.exchange_fetcher.get_date_days_ago(days_ago)
        
        if target_currency == 'CZK':
            historical_rate = self.exchange_fetcher.fetch_cnb_rate(historical_date, 'EUR')
        elif target_currency == 'USD':
            historical_rate = self.exchange_fetcher.fetch_frankfurter_rate(historical_date, 'USD')
            # Frankfurter dává EUR/USD přímo
            # Pro přepočet: 1 EUR = historical_rate USD
        else:
            safe_log("error", f"Nepodporovaná měna: {target_currency}")
            return None, None
        
        result = (historical_rate, current_rate)
        self.rates_cache[cache_key] = result
        return result
    
    def convert_performance_eur_to_target(
        self, 
        performance_eur: float, 
        period: str, 
        target_currency: str,
        base_investment: float = 1000.0
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
        historical_rate, current_rate = self.get_exchange_rates_for_period(period, target_currency)
        
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
        target_currency: str
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
                    performance_eur, period, target_currency
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
        
        # Konverze na CZK
        czk_performance = converter.convert_all_performance_periods(eur_performance, 'CZK')
        
        # Konverze na USD
        usd_performance = converter.convert_all_performance_periods(eur_performance, 'USD')
        
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