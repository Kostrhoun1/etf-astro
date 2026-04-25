#!/usr/bin/env python3
"""
Exchange Rates Fetcher - modul pro získávání směnných kurzů z ČNB a ECB
Integruje se do ETF scraperu pro automatické získávání historických kurzů
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import re

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
            'CNB:', 'Frankfurter:', 'ECB:', 'k 2025-', 'k 2024-', 'CZK', 'USD', 'EUR =', 'získáno',
            'Získávám historické kurzy', 'period rates', '💱', 'kurz', 'rate'
        ]):
            return
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {level.upper()}: {message}")

class ExchangeRatesFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })
        
        # Cache pro kurzy během session
        self.rates_cache = {}
    
    def get_date_days_ago(self, days: int) -> datetime:
        """Získá datum před X dny"""
        target_date = datetime.now() - timedelta(days=days)
        return target_date
    
    def format_date_for_cnb(self, date: datetime) -> str:
        """Formátuje datum pro ČNB API (dd.mm.yyyy)"""
        return date.strftime("%d.%m.%Y")
    
    def format_date_for_ecb(self, date: datetime) -> str:
        """Formátuje datum pro ECB API (yyyy-mm-dd)"""
        return date.strftime("%Y-%m-%d")
    
    def fetch_cnb_rate(self, target_date: datetime, currency: str = 'EUR') -> Optional[float]:
        """
        Získá kurz z ČNB pro konkrétní datum
        Currency: EUR, USD, etc.
        Returns: kurz CZK za 1 jednotku cizí měny
        """
        cache_key = f"CNB_{currency}_{target_date.strftime('%Y-%m-%d')}"
        if cache_key in self.rates_cache:
            return self.rates_cache[cache_key]
        
        date_str = self.format_date_for_cnb(target_date)
        url = f"https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date={date_str}"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            content = response.text
            lines = content.strip().split('\n')
            
            # Skip první 2 řádky (header)
            for line in lines[2:]:
                parts = line.split('|')
                if len(parts) >= 5:
                    country, currency_name, amount, curr_code, rate = parts
                    
                    if curr_code.strip() == currency:
                        # Kurz je ve formátu "25,450" - převést na float
                        rate_float = float(rate.strip().replace(',', '.'))
                        amount_int = int(amount.strip())
                        
                        # ČNB udává kurz za množství (např. 1 USD = 25.45 CZK)
                        final_rate = rate_float / amount_int
                        
                        self.rates_cache[cache_key] = final_rate
                        # CNB rate fetched - no need to log
                        return final_rate
            
            safe_log("warning", f"CNB: Kurz {currency} nenalezen pro {date_str}")
            return None
            
        except Exception as e:
            safe_log("error", f"CNB fetch error: {e}")
            return None
    
    def fetch_frankfurter_rate(self, target_date: datetime, currency: str = 'USD') -> Optional[float]:
        """
        Získá kurz z Frankfurter API pro konkrétní datum
        Currency: USD, GBP, etc. (vše oproti EUR)
        Returns: kolik jednotek cizí měny za 1 EUR
        """
        cache_key = f"FRANKFURTER_{currency}_{target_date.strftime('%Y-%m-%d')}"
        if cache_key in self.rates_cache:
            return self.rates_cache[cache_key]
        
        date_str = self.format_date_for_ecb(target_date)  # YYYY-MM-DD format
        
        # Frankfurter API endpoint
        url = f"https://api.frankfurter.dev/v1/{date_str}?base=EUR&symbols={currency}"
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'rates' in data and currency in data['rates']:
                rate = float(data['rates'][currency])
                self.rates_cache[cache_key] = rate
                # Frankfurter rate fetched - no need to log
                return rate
            else:
                safe_log("warning", f"Frankfurter: Kurz {currency} nenalezen pro {date_str}")
                return None
            
        except Exception as e:
            safe_log("error", f"Frankfurter fetch error: {e}")
            return None
    
    def _find_closest_ecb_rate(self, target_date: datetime, currency: str, root) -> Optional[float]:
        """Najde nejbližší dostupný kurz (pro víkendy/svátky)"""
        for days_back in range(1, 8):  # Zkus až 7 dní zpět
            check_date = target_date - timedelta(days=days_back)
            date_str = self.format_date_for_ecb(check_date)
            
            for cube_time in root.findall('.//Cube[@time]'):
                if cube_time.get('time') == date_str:
                    for cube_currency in cube_time.findall('.//Cube[@currency]'):
                        if cube_currency.get('currency') == currency:
                            rate = float(cube_currency.get('rate'))
                            # ECB rate fetched - no need to log
                            return rate
        
        safe_log("warning", f"ECB: Žádný kurz {currency} nalezen blízko {target_date.strftime('%Y-%m-%d')}")
        return None
    
    def get_current_rates(self) -> Dict[str, float]:
        """Získá aktuální kurzy"""
        today = datetime.now()
        
        rates = {}
        
        # ČNB - EUR/CZK
        eur_czk = self.fetch_cnb_rate(today, 'EUR')
        if eur_czk:
            rates['EUR_CZK'] = eur_czk
        
        # ČNB - USD/CZK  
        usd_czk = self.fetch_cnb_rate(today, 'USD')
        if usd_czk:
            rates['USD_CZK'] = usd_czk
        
        # Frankfurter - EUR/USD
        eur_usd = self.fetch_frankfurter_rate(today, 'USD')
        if eur_usd:
            rates['EUR_USD'] = eur_usd
        
        return rates
    
    def get_performance_period_rates(self) -> Dict[str, Dict[str, float]]:
        """
        Získá všechny potřebné kurzy pro performance období
        Returns: Dict s kurzy pro každé období
        """
        periods = {
            '1m': 30,
            '3m': 90, 
            '6m': 180,
            '1y': 365,
            '3y': 365 * 3,
            '5y': 365 * 5
        }
        
        result = {}
        current_rates = self.get_current_rates()
        
        # Getting historical rates - no need to log
        
        for period, days_ago in periods.items():
            historical_date = self.get_date_days_ago(days_ago)
            
            period_rates = {
                'current': current_rates,
                'historical': {}
            }
            
            # Historické kurzy
            historical_eur_czk = self.fetch_cnb_rate(historical_date, 'EUR')
            if historical_eur_czk:
                period_rates['historical']['EUR_CZK'] = historical_eur_czk
            
            historical_usd_czk = self.fetch_cnb_rate(historical_date, 'USD')
            if historical_usd_czk:
                period_rates['historical']['USD_CZK'] = historical_usd_czk
            
            historical_eur_usd = self.fetch_frankfurter_rate(historical_date, 'USD')
            if historical_eur_usd:
                period_rates['historical']['EUR_USD'] = historical_eur_usd
            
            result[period] = period_rates
            # Period rates fetched - no need to log
        
        return result

def test_exchange_rates_fetcher():
    """Test funkce pro ověření fungování"""
    print("🧪 Test Exchange Rates Fetcher")
    print("=" * 50)
    
    fetcher = ExchangeRatesFetcher()
    
    # Test aktuálních kurzů
    print("\n📊 Aktuální kurzy:")
    current = fetcher.get_current_rates()
    for pair, rate in current.items():
        print(f"  {pair}: {rate:.4f}")
    
    # Test historických kurzů
    print("\n📈 Test historických kurzů (před 1 rokem):")
    year_ago = fetcher.get_date_days_ago(365)
    
    eur_czk_old = fetcher.fetch_cnb_rate(year_ago, 'EUR')
    eur_usd_old = fetcher.fetch_frankfurter_rate(year_ago, 'USD')
    
    print(f"  EUR/CZK před rokem: {eur_czk_old:.4f}" if eur_czk_old else "  EUR/CZK: Failed")
    print(f"  EUR/USD před rokem: {eur_usd_old:.4f}" if eur_usd_old else "  EUR/USD: Failed")
    
    # Test performance periods
    print("\n🎯 Test všech performance období:")
    all_rates = fetcher.get_performance_period_rates()
    
    for period, data in all_rates.items():
        current_count = len(data['current'])
        historical_count = len(data['historical'])
        print(f"  {period}: {current_count} current + {historical_count} historical = {current_count + historical_count} total")

if __name__ == "__main__":
    test_exchange_rates_fetcher()