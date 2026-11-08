#!/usr/bin/env python3
"""
Scraper Currency Integration - patch pro final_scraper.py
Přidává currency conversion funkcionalitu do existujícího scraperu
"""

# Importy potřebné pro integraci
from performance_converter import create_performance_conversion_for_scraper, KALENDARNI_ROKY, OBDOBI_ZA_OBDOBI
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
    
    # V non-verbose módu skryj debug zprávy a běžné (info) zprávy o měnách. Chyby a varování NIKDY
    # (do 8. 11. 2026 filtr podle slov „CZK“, „USD“, „kurz“, „Currency“ zahazoval i je).
    if not VERBOSE_MODE and level not in ('error', 'warning'):
        # Žádné debug zprávy vůbec
        if level == 'debug':
            return
        # Žádné currency-related info zprávy
        if any(keyword in message for keyword in [
            '💱', 'Currency', 'Convert', 'EUR ->', 'CZK', 'USD', 'pp)', 'CNB:', 'Frankfurter:', 
            'Přepočítávám performance', 'performance přidána', 'Přidány CZK/USD', 'k 2025-', 'k 2024-',
            'rates:', '->  ', '%', 'kurz', 'rate'
        ]):
            return
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {level.upper()}: {message}")

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
            # Celý převod spadl → všechna období s EUR výnosem jsou bez Kč/USD; započítat do souhrnu běhu
            try:
                chybi = [f"{o}/{m}" for o in OBDOBI_ZA_OBDOBI + KALENDARNI_ROKY
                         if getattr(etf, f'return_{o}', None) is not None
                         for m in ('CZK', 'USD') if getattr(etf, f'return_{o}_{m.lower()}', None) is None]
                self.converter.zaznamenej_chybejici_prevod(etf.isin, chybi)
            except Exception:
                pass
            return False
    
    def _etf_to_dict_for_conversion(self, etf):
        """Konverze ETF objektu na dict pro currency conversion"""
        d = {'isin': etf.isin, 'name': etf.name}
        for o in OBDOBI_ZA_OBDOBI + KALENDARNI_ROKY:
            d[f'return_{o}'] = getattr(etf, f'return_{o}', None)
        # Den, ke kterému platí výnosy za období (z denní řady, vynosy_z_rady.py) – kurzy se berou k TOMUTO dni
        d['returns_as_of'] = getattr(etf, 'returns_as_of', None)
        return d

    def _apply_currency_performance_to_etf(self, etf, enhanced_dict):
        """Aplikuje currency performance zpět na ETF objekt (chybějící převod = None, nikdy EUR hodnota)."""
        for o in OBDOBI_ZA_OBDOBI + KALENDARNI_ROKY:
            for mena in ('czk', 'usd'):
                setattr(etf, f'return_{o}_{mena}', enhanced_dict.get(f'return_{o}_{mena}'))

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