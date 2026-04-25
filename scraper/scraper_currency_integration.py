#!/usr/bin/env python3
"""
Scraper Currency Integration - patch pro final_scraper.py
Přidává currency conversion funkcionalitu do existujícího scraperu
"""

# Importy potřebné pro integraci
from performance_converter import create_performance_conversion_for_scraper
from datetime import datetime

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

# ==================================================
# PATCH 1: Rozšířit ETFDataComplete třídu
# ==================================================

# Toto se přidá do __init__ metody ETFDataComplete za performance sekci:

ETFDATA_CURRENCY_FIELDS = """
        # Currency Performance - CZK (přepočteno z EUR)
        self.return_1m_czk = None
        self.return_3m_czk = None
        self.return_6m_czk = None
        self.return_ytd_czk = None
        self.return_1y_czk = None
        self.return_3y_czk = None
        self.return_5y_czk = None
        self.return_2021_czk = None
        self.return_2022_czk = None
        self.return_2023_czk = None
        self.return_2024_czk = None
        self.return_2025_czk = None

        # Currency Performance - USD (přepočteno z EUR)
        self.return_1m_usd = None
        self.return_3m_usd = None
        self.return_6m_usd = None
        self.return_ytd_usd = None
        self.return_1y_usd = None
        self.return_3y_usd = None
        self.return_5y_usd = None
        self.return_2021_usd = None
        self.return_2022_usd = None
        self.return_2023_usd = None
        self.return_2024_usd = None
        self.return_2025_usd = None

        # Metadata
        self.currency_performance_updated_at = None
"""

# ==================================================
# PATCH 2: Rozšířit to_dict metodu
# ==================================================

TO_DICT_CURRENCY_FIELDS = """
            # Currency Performance - CZK
            'return_1m_czk': self.safe_numeric(etf.return_1m_czk),
            'return_3m_czk': self.safe_numeric(etf.return_3m_czk),
            'return_6m_czk': self.safe_numeric(etf.return_6m_czk),
            'return_ytd_czk': self.safe_numeric(etf.return_ytd_czk),
            'return_1y_czk': self.safe_numeric(etf.return_1y_czk),
            'return_3y_czk': self.safe_numeric(etf.return_3y_czk),
            'return_5y_czk': self.safe_numeric(etf.return_5y_czk),
            'return_2021_czk': self.safe_numeric(etf.return_2021_czk),
            'return_2022_czk': self.safe_numeric(etf.return_2022_czk),
            'return_2023_czk': self.safe_numeric(etf.return_2023_czk),
            'return_2024_czk': self.safe_numeric(etf.return_2024_czk),
            'return_2025_czk': self.safe_numeric(etf.return_2025_czk),

            # Currency Performance - USD
            'return_1m_usd': self.safe_numeric(etf.return_1m_usd),
            'return_3m_usd': self.safe_numeric(etf.return_3m_usd),
            'return_6m_usd': self.safe_numeric(etf.return_6m_usd),
            'return_ytd_usd': self.safe_numeric(etf.return_ytd_usd),
            'return_1y_usd': self.safe_numeric(etf.return_1y_usd),
            'return_3y_usd': self.safe_numeric(etf.return_3y_usd),
            'return_5y_usd': self.safe_numeric(etf.return_5y_usd),
            'return_2021_usd': self.safe_numeric(etf.return_2021_usd),
            'return_2022_usd': self.safe_numeric(etf.return_2022_usd),
            'return_2023_usd': self.safe_numeric(etf.return_2023_usd),
            'return_2024_usd': self.safe_numeric(etf.return_2024_usd),
            'return_2025_usd': self.safe_numeric(etf.return_2025_usd),

            # Metadata
            'currency_performance_updated_at': etf.currency_performance_updated_at,
"""

# ==================================================
# PATCH 3: Rozšířit convert_to_supabase_format
# ==================================================

SUPABASE_CURRENCY_FIELDS = """
            # Currency Performance - CZK
            'return_1m_czk': etf_dict.get('return_1m_czk', 0) or 0,
            'return_3m_czk': etf_dict.get('return_3m_czk', 0) or 0,
            'return_6m_czk': etf_dict.get('return_6m_czk', 0) or 0,
            'return_ytd_czk': etf_dict.get('return_ytd_czk', 0) or 0,
            'return_1y_czk': etf_dict.get('return_1y_czk', 0) or 0,
            'return_3y_czk': etf_dict.get('return_3y_czk', 0) or 0,
            'return_5y_czk': etf_dict.get('return_5y_czk', 0) or 0,
            'return_2021_czk': etf_dict.get('return_2021_czk', 0) or 0,
            'return_2022_czk': etf_dict.get('return_2022_czk', 0) or 0,
            'return_2023_czk': etf_dict.get('return_2023_czk', 0) or 0,
            'return_2024_czk': etf_dict.get('return_2024_czk', 0) or 0,
            'return_2025_czk': etf_dict.get('return_2025_czk', 0) or 0,

            # Currency Performance - USD
            'return_1m_usd': etf_dict.get('return_1m_usd', 0) or 0,
            'return_3m_usd': etf_dict.get('return_3m_usd', 0) or 0,
            'return_6m_usd': etf_dict.get('return_6m_usd', 0) or 0,
            'return_ytd_usd': etf_dict.get('return_ytd_usd', 0) or 0,
            'return_1y_usd': etf_dict.get('return_1y_usd', 0) or 0,
            'return_3y_usd': etf_dict.get('return_3y_usd', 0) or 0,
            'return_5y_usd': etf_dict.get('return_5y_usd', 0) or 0,
            'return_2021_usd': etf_dict.get('return_2021_usd', 0) or 0,
            'return_2022_usd': etf_dict.get('return_2022_usd', 0) or 0,
            'return_2023_usd': etf_dict.get('return_2023_usd', 0) or 0,
            'return_2024_usd': etf_dict.get('return_2024_usd', 0) or 0,
            'return_2025_usd': etf_dict.get('return_2025_usd', 0) or 0,

            # Metadata
            'currency_performance_updated_at': etf_dict.get('currency_performance_updated_at', ''),
"""

# ==================================================
# PATCH 4: Hlavní integrační funkce
# ==================================================

class CurrencyPerformanceIntegrator:
    """
    Třída pro integraci currency conversion do scraperu
    """
    
    def __init__(self):
        """Inicializace conversion funkcí"""
        try:
            self.conversion_functions = create_performance_conversion_for_scraper()
            self.converter = self.conversion_functions['converter']
            self.add_currency_performance = self.conversion_functions['add_currency_performance']
            # Currency conversion initialized - no need to log
        except Exception as e:
            safe_log("error", f"💱 Currency conversion initialization failed: {e}")
            self.conversion_functions = None
    
    def is_available(self) -> bool:
        """Kontrola, zda je currency conversion dostupná"""
        return self.conversion_functions is not None
    
    def enhance_etf_with_currency_performance(self, etf):
        """
        Přidá CZK/USD performance k ETF objektu
        
        Args:
            etf: ETFDataComplete instance s EUR performance daty
            
        Returns:
            bool: True pokud bylo úspěšně přidáno
        """
        if not self.is_available():
            safe_log("warning", "💱 Currency conversion není dostupná")
            return False
        
        try:
            # Konverze ETF objektu na dict pro processing
            etf_dict = self._etf_to_dict_for_conversion(etf)
            
            # Přidej currency performance
            enhanced_dict = self.add_currency_performance(etf_dict)
            
            # Aplikuj zpět na ETF objekt
            self._apply_currency_performance_to_etf(etf, enhanced_dict)
            
            # Nastav timestamp
            etf.currency_performance_updated_at = datetime.now().isoformat()
            
            # Currency performance added - no need to log for each ETF
            return True
            
        except Exception as e:
            safe_log("error", f"💱 Currency conversion selhala pro {etf.isin}: {e}")
            return False
    
    def _etf_to_dict_for_conversion(self, etf):
        """Konverze ETF objektu na dict pro currency conversion"""
        return {
            'isin': etf.isin,
            'name': etf.name,
            'return_1m': etf.return_1m,
            'return_3m': etf.return_3m,
            'return_6m': etf.return_6m,
            'return_ytd': etf.return_ytd,
            'return_1y': etf.return_1y,
            'return_3y': etf.return_3y,
            'return_5y': etf.return_5y,
            'return_2021': etf.return_2021,
            'return_2022': etf.return_2022,
            'return_2023': etf.return_2023,
            'return_2024': etf.return_2024,
            'return_2025': etf.return_2025,
        }
    
    def _apply_currency_performance_to_etf(self, etf, enhanced_dict):
        """Aplikuje currency performance zpět na ETF objekt"""
        
        # CZK fields
        etf.return_1m_czk = enhanced_dict.get('return_1m_czk')
        etf.return_3m_czk = enhanced_dict.get('return_3m_czk')
        etf.return_6m_czk = enhanced_dict.get('return_6m_czk')
        etf.return_ytd_czk = enhanced_dict.get('return_ytd_czk')
        etf.return_1y_czk = enhanced_dict.get('return_1y_czk')
        etf.return_3y_czk = enhanced_dict.get('return_3y_czk')
        etf.return_5y_czk = enhanced_dict.get('return_5y_czk')
        etf.return_2021_czk = enhanced_dict.get('return_2021_czk')
        etf.return_2022_czk = enhanced_dict.get('return_2022_czk')
        etf.return_2023_czk = enhanced_dict.get('return_2023_czk')
        etf.return_2024_czk = enhanced_dict.get('return_2024_czk')
        etf.return_2025_czk = enhanced_dict.get('return_2025_czk')

        # USD fields
        etf.return_1m_usd = enhanced_dict.get('return_1m_usd')
        etf.return_3m_usd = enhanced_dict.get('return_3m_usd')
        etf.return_6m_usd = enhanced_dict.get('return_6m_usd')
        etf.return_ytd_usd = enhanced_dict.get('return_ytd_usd')
        etf.return_1y_usd = enhanced_dict.get('return_1y_usd')
        etf.return_3y_usd = enhanced_dict.get('return_3y_usd')
        etf.return_5y_usd = enhanced_dict.get('return_5y_usd')
        etf.return_2021_usd = enhanced_dict.get('return_2021_usd')
        etf.return_2022_usd = enhanced_dict.get('return_2022_usd')
        etf.return_2023_usd = enhanced_dict.get('return_2023_usd')
        etf.return_2024_usd = enhanced_dict.get('return_2024_usd')
        etf.return_2025_usd = enhanced_dict.get('return_2025_usd')

# ==================================================
# PATCH 5: Funkce pro integraci do scraperu
# ==================================================

def create_scraper_integration_patch():
    """
    Vytvoří všechny potřebné komponenty pro integraci do scraperu
    """
    
    integrator = CurrencyPerformanceIntegrator()
    
    def patch_scraper_class(scraper_class):
        """
        Patch pro CompleteProductionScraper třídu
        """
        
        # Přidej integrator jako atribut
        scraper_class.currency_integrator = integrator
        
        # Uložíme původní scrape_etf_complete_with_retry metodu
        original_scrape = scraper_class.scrape_etf_complete_with_retry
        
        def enhanced_scrape_etf_complete_with_retry(self, isin: str, max_retries: int = 3):
            """
            Rozšířená verze scrapingu s currency conversion
            """
            # Zavolej původní scraping
            etf = original_scrape(self, isin, max_retries)
            
            # Pokud scraping byl úspěšný, přidej currency performance
            if etf.scraping_status == "success" and hasattr(etf, 'return_1y') and etf.return_1y is not None:
                safe_log("info", f"💱 Přidávám currency performance pro {isin}")
                currency_success = self.currency_integrator.enhance_etf_with_currency_performance(etf)
                
                if currency_success:
                    safe_log("info", f"✅ Currency performance úspěšně přidána pro {isin}")
                else:
                    safe_log("warning", f"⚠️ Currency performance selhala pro {isin}")
            else:
                safe_log("debug", f"⏭️ Přeskakuji currency conversion pro {isin} (no performance data)")
            
            return etf
        
        # Nahradíme metodu
        scraper_class.scrape_etf_complete_with_retry = enhanced_scrape_etf_complete_with_retry
        
        safe_log("info", "🔧 Scraper patched with currency conversion functionality")
        
        return scraper_class
    
    return {
        'integrator': integrator,
        'patch_scraper_class': patch_scraper_class
    }

# ==================================================
# PATCH 6: Testovací funkce
# ==================================================

def test_currency_integration():
    """Test integrace currency conversion"""
    
    # Test jednoho ETF
    print("🧪 Test Currency Integration")
    print("=" * 50)
    
    # Vytvoří mock ETF objekt
    class MockETF:
        def __init__(self, isin):
            self.isin = isin
            self.name = "Test ETF"
            self.scraping_status = "success"
            
            # EUR performance
            self.return_1m = 2.22
            self.return_3m = 7.13
            self.return_6m = 9.54
            self.return_ytd = 3.69
            self.return_1y = 11.07
            self.return_3y = 54.89
            self.return_5y = 96.20
            self.return_2021 = 32.10
            self.return_2022 = -12.96
            self.return_2023 = 19.55
            self.return_2024 = 26.24
            
            # Currency fields (budou přidány)
            self.return_1y_czk = None
            self.return_5y_czk = None
            self.currency_performance_updated_at = None
    
    # Test integrace
    integrator = CurrencyPerformanceIntegrator()
    
    if integrator.is_available():
        mock_etf = MockETF("IE00BK5BQT80")
        
        print(f"📊 Před conversion:")
        print(f"   return_1y: {mock_etf.return_1y}% (EUR)")
        print(f"   return_5y: {mock_etf.return_5y}% (EUR)")
        print(f"   return_1y_czk: {mock_etf.return_1y_czk}")
        
        success = integrator.enhance_etf_with_currency_performance(mock_etf)
        
        print(f"\n📊 Po conversion:")
        print(f"   return_1y: {mock_etf.return_1y}% (EUR)")
        print(f"   return_1y_czk: {mock_etf.return_1y_czk}% (CZK)")
        print(f"   return_5y: {mock_etf.return_5y}% (EUR)")
        print(f"   return_5y_czk: {mock_etf.return_5y_czk}% (CZK)")
        print(f"   Updated: {mock_etf.currency_performance_updated_at}")
        print(f"\n✅ Integration success: {success}")
        
    else:
        print("❌ Currency integration není dostupná")

if __name__ == "__main__":
    test_currency_integration()