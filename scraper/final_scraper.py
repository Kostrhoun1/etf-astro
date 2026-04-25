#!/usr/bin/env python3
"""
JustETF COMPLETE Production Scraper - VERZE S DIVIDENDY

KOMPLETNÍ FUNKCIONALITA:
- ✅ Batch processing s checkpointy a resume capability
- ✅ Stock exchange data extraction (burzy, tickery, Bloomberg/Reuters)
- ✅ Holdings, performance, risk metrics
- ✅ České překlady s finančním slovníkem
- ✅ Kategorizace ETF (Akcie/Dluhopisy/Krypto/Komodity)
- ✅ Automatické určení regionu (US/Evropa/Čína/Rozvíjející se země atd.)
- ✅ DIVIDENDOVÉ INFORMACE (Current yield, Last 12 months)
- ✅ Error handling a retry mechanismus
- ✅ Progress monitoring a statistiky
- ✅ Export do Excel, JSON a CSV
- ✅ Automatická aktualizace webu po dokončení
- 🔧 OPRAVA: Unicode/emoji problémů pro Windows

INSTALACE ZÁVISLOSTÍ:
pip install requests beautifulsoup4 pandas googletrans==4.0.0rc1 openpyxl

POUŽITÍ:
python final_scraper.py --csv ISIN.csv --batch-size 50 --resume
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import time
import re
from datetime import datetime
import os
import random
from typing import List, Dict, Optional, Tuple
import logging
import argparse
import csv
import sys
from dataclasses import dataclass
from etf_rating import calculate_etf_rating
from market_heatmap_generator import MarketHeatmapGenerator
from scraper_currency_integration import CurrencyPerformanceIntegrator

# Potlačení warningů
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", message=".*urllib3.*OpenSSL.*")
warnings.filterwarnings("ignore", message=".*pseudo class.*contains.*deprecated.*")

# Ochrana proti uspávání počítače (macOS/Linux)
try:
    import subprocess
    import threading
    CAFFEINE_AVAILABLE = True
except ImportError:
    CAFFEINE_AVAILABLE = False

# FTP/SFTP knihovny pro nahrávání na server
try:
    import ftplib
    import paramiko  # pro SFTP
    FTP_AVAILABLE = True
except ImportError:
    FTP_AVAILABLE = False

# OPRAVA UNICODE - nastavení kodování pro Windows
if sys.platform.startswith('win'):
    import codecs
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except:
        pass

# Pokusí se importovat deep-translator (kompatibilní s novějšími httpx verzemi)
try:
    from deep_translator import GoogleTranslator
    GOOGLETRANS_AVAILABLE = True
except ImportError as e:
    print(f"WARNING: deep-translator není dostupný: {e}")
    print("INFO: Pro povolení překladu nainstalujte: pip install deep-translator")
    GOOGLETRANS_AVAILABLE = False
    GoogleTranslator = None

# Pokusí se importovat Supabase klient a dotenv
try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
    SUPABASE_AVAILABLE = True
    # Načti environment variables z .env souboru
    load_dotenv('../.env')
except ImportError:
    print("WARNING: Supabase klient nebo python-dotenv není nainstalován. Automatické nahrávání do DB bude vypnuté.")
    print("INFO: Pro povolení nahrávání spusťte: pip install supabase python-dotenv")
    SUPABASE_AVAILABLE = False

# ================================
# WEBHOOK FUNKCIONALITA PRO AUTOMATICKOU AKTUALIZACI WEBU
# ========================================================

def trigger_website_refresh():
    """
    Zavolá webhook pro aktualizaci homepage po dokončení scrapingu
    """
    try:
        # URL webhook endpointu
        webhook_url = "https://www.etfpruvodce.cz/api/revalidate"
        
        # Pro development (localhost) 
        # webhook_url = "http://localhost:3000/api/revalidate"
        
        # Secret key pro zabezpečení (musí odpovídat REVALIDATE_SECRET ve Vercelu)
        secret_key = "etf_rebuild_x7Km9pQ2vL8n"
        
        # Payload
        payload = {
            "secret": secret_key,
            "source": "scraper",
            "timestamp": datetime.now().isoformat()
        }
        
        safe_log("info", "🔄 Triggering website refresh...")
        
        # Zavolej webhook
        response = requests.post(
            webhook_url, 
            json=payload,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            safe_log("info", f"✅ Website refresh successful: {result.get('message')}")
            safe_log("info", f"📅 Timestamp: {result.get('timestamp')}")
        else:
            safe_log("error", f"❌ Website refresh failed: {response.status_code}")
            safe_log("error", f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        safe_log("error", f"❌ Network error during website refresh: {e}")
    except Exception as e:
        safe_log("error", f"❌ Unexpected error during website refresh: {e}")

# PRODUCTION KONFIGURACE
# ================================
PRODUCTION_MODE = True
BATCH_SIZE = 50  # Počet ETF v jednom batch
MAX_RETRIES = 3
RETRY_DELAY = 30  # sekund
TRANSLATE_DESCRIPTIONS = True and GOOGLETRANS_AVAILABLE  # Zapnuto s deep-translator
SAVE_HTML = False  # Pro production vypnuto kvůli místu
DEBUG_MODE = False
VERBOSE_MODE = False  # Méně výstupů na terminál - jen progress 
AUTO_CLEANUP = True  # Automatické mazání checkpointů po dokončení
EXTRACT_EXCHANGE_DATA = True
EXTRACT_DIVIDEND_DATA = True  # NOVÉ: Extrakce dividendových dat
AUTO_UPLOAD_TO_DB = True and SUPABASE_AVAILABLE  # NOVÉ: Automatické nahrávání do databáze
GENERATE_MARKET_HEATMAP = True  # NOVÉ: Generování market heatmap dat
UPLOAD_HEATMAP_TO_SERVER = True  # NOVÉ: Automatické nahrávání heatmap dat na server

# Konfigurace serveru pro nahrávání market heatmap dat
# Pokud existuje server_config.py, načti z něj, jinak použij výchozí hodnoty
try:
    from server_config import FTP_SERVER, FTP_USERNAME, FTP_PASSWORD, FTP_REMOTE_PATH, UPLOAD_METHOD
    SERVER_CONFIG_LOADED = True
except ImportError:
    # Výchozí hodnoty - UPRAVTE PODLE VAŠEHO SERVERU
    FTP_SERVER = "your-domain.com"  # Nahraďte svou doménou
    FTP_USERNAME = "your-username"  # Nahraďte svým FTP uživatelským jménem
    FTP_PASSWORD = "your-password"  # Nahraďte svým FTP heslem (nebo použijte SSH klíče)
    FTP_REMOTE_PATH = "/public_html/data/"  # Cesta na serveru kam nahrát JSON soubory
    UPLOAD_METHOD = "sftp"  # "ftp" nebo "sftp" nebo "scp"
    SERVER_CONFIG_LOADED = False

# Výstupní složky
OUTPUT_DIR = "justetf_complete_production"
CHECKPOINTS_DIR = os.path.join(OUTPUT_DIR, "checkpoints")
RESULTS_DIR = os.path.join(OUTPUT_DIR, "results")
LOGS_DIR = os.path.join(OUTPUT_DIR, "logs")

# Vytvoř složky
for directory in [OUTPUT_DIR, CHECKPOINTS_DIR, RESULTS_DIR, LOGS_DIR]:
    os.makedirs(directory, exist_ok=True)

# OPRAVA LOGGINGU - použití safe_log funkce
class SafeFormatter(logging.Formatter):
    """Formatter který bezpečně zpracovává Unicode znaky"""
    def format(self, record):
        try:
            return super().format(record)
        except UnicodeEncodeError:
            # Odstranit emoji a problematické znaky
            record.msg = str(record.msg).encode('ascii', errors='ignore').decode('ascii')
            return super().format(record)

# Upravené logging setup s Unicode podporou
log_file = os.path.join(LOGS_DIR, f'scraping_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')

# File handler s UTF-8 kodováním
file_handler = logging.FileHandler(log_file, encoding='utf-8')
file_handler.setFormatter(SafeFormatter('%(asctime)s - %(levelname)s - %(message)s'))

# Console handler s fallbackem pro Windows
console_handler = logging.StreamHandler()
console_handler.setFormatter(SafeFormatter('%(asctime)s - %(levelname)s - %(message)s'))

# Nastavení loggeru
logger = logging.getLogger(__name__)
if VERBOSE_MODE:
    logger.setLevel(logging.DEBUG)
    console_handler.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)  # Povolím INFO zprávy pro progress
    console_handler.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

def safe_log(level: str, message: str):
    """Bezpečná logging funkce která odstraní problematické znaky pro Windows"""
    
    # V non-verbose módu zobrazuj jen důležité zprávy
    if not VERBOSE_MODE and level == 'debug':
        return
    
    # Filtruj spam zprávy ale nech důležité info
    if level in ['debug', 'info'] and 'EXCHANGE:' in message:
        return
    if level == 'debug' and any(keyword in message for keyword in ['DIVIDEND:', 'SKIP:']):
        return
    try:
        # Pokus o normální log
        getattr(logger, level.lower())(message)
    except UnicodeEncodeError:
        # Fallback - odstraň emoji a použij ASCII
        clean_message = message.encode('ascii', errors='ignore').decode('ascii')
        clean_message = re.sub(r'[^\x00-\x7F]+', ' ', clean_message)  # Odstraň non-ASCII
        getattr(logger, level.lower())(f"[CLEANED] {clean_message}")

# ================================
# FINANČNÍ SLOVNÍK PRO PŘEKLADY
# ================================
FINANCIAL_TERMS = {
    'stocks': 'akcie',
    'stock': 'akcie',
    'domiciled': 'se sídlem v',
    'domiciled in': 'se sídlem v',
    'tracking': 'sledování',
    'tracks': 'sleduje',
    'assets under management': 'spravovaná aktiva',
    'total expense ratio': 'celkový poměr nákladů',
    'replicates': 'replikuje',
    'performance': 'výkon',
    'underlying index': 'základní index',
    'accumulating': 'akumulující',
    'distributing': 'distribuující',
    'launched': 'spuštěn',
    'sampling technique': 'technikou vzorkování',
    'show more': 'zobrazit více',
    'show less': 'zobrazit méně',
    'government bonds': 'státní dluhopisy',
    'corporate bonds': 'firemní dluhopisy',
    'investment grade': 'investiční stupeň',
    'dividend': 'dividenda',
    'yield': 'výnos'
}

# ================================
# DATOVÉ STRUKTURY
# ================================
@dataclass
class ExchangeListing:
    exchange_name: str = ""
    trade_currency: str = ""
    ticker: str = ""
    bloomberg_code: str = ""
    reuters_code: str = ""
    market_maker: str = ""

class ETFDataComplete:
    def __init__(self, isin: str):
        self.isin = isin
        self.name = ""
        self.url = ""
        
        # Popisy fondů
        self.description_en = ""
        self.description_cs = ""
        
        # Costs
        self.ter = ""
        self.ter_numeric = None
        
        # Fund info
        self.fund_size = ""
        self.fund_size_numeric = None
        self.fund_size_currency = ""
        self.fund_currency = ""
        self.fund_domicile = ""
        self.fund_provider = ""
        self.inception_date = ""
        
        # Distribution
        self.distribution_policy = ""
        self.distribution_frequency = ""
        
        # Structure
        self.replication = ""
        self.legal_structure = ""
        
        # Investment
        self.index_name = ""
        self.investment_focus = ""
        self.sustainability = ""
        
        # Risk information - NOVÉ POLE PRO 100% PŘESNOU HEDGING DETEKCI
        self.currency_risk = ""
        self.strategy_risk = ""
        
        # Category
        self.category = ""
        
        # Leveraged ETF flag
        self.is_leveraged = False
        
        # Region
        self.region = ""
        
        # Holdings
        self.total_holdings = None
        self.holdings = []
        
        # Geographic
        self.countries = []
        
        # Sectors
        self.sectors = []
        
        # Performance - krátká období
        self.return_1m = None
        self.return_3m = None
        self.return_6m = None
        self.return_ytd = None
        self.return_1y = None
        self.return_3y = None
        self.return_5y = None
        
        # Performance - roční výnosy
        self.return_2021 = None
        self.return_2022 = None
        self.return_2023 = None
        self.return_2024 = None
        self.return_2025 = None

        # Performance - inception (celková životnost)
        self.return_inception = None
        self.performance_last_updated = None
        
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
        
        # Risk metriky
        self.volatility_1y = None
        self.volatility_3y = None
        self.volatility_5y = None
        self.return_per_risk_1y = None
        self.return_per_risk_3y = None
        self.return_per_risk_5y = None
        self.max_drawdown_1y = None
        self.max_drawdown_3y = None
        self.max_drawdown_5y = None
        self.max_drawdown_inception = None
        self.beta = None
        self.correlation = None
        self.tracking_error = None
        self.information_ratio = None
        
        # Stock Exchange Data
        self.exchange_listings = []  # List[ExchangeListing]
        self.primary_exchange = ""
        self.primary_ticker = ""
        self.total_exchanges = 0
        
        # NOVÉ: DIVIDENDOVÉ INFORMACE
        self.current_dividend_yield = ""
        self.current_dividend_yield_numeric = None
        self.dividends_12m = ""
        self.dividends_12m_numeric = None
        self.dividends_12m_currency = ""
        self.dividend_extraction_method = ""
        
        # DEGIRO info
        self.degiro_free = False
        
        # Metadata
        self.scraping_date = datetime.now().isoformat()
        self.scraping_status = "pending"
        self.retry_count = 0
        
    def add_exchange_listing(self, listing: ExchangeListing):
        """Přidá nové stock exchange listing"""
        self.exchange_listings.append(listing)
        
        # Smarter primary ticker selection - preferuj známé tickery
        if not self.primary_exchange:
            self.primary_exchange = listing.exchange_name
            self.primary_ticker = listing.ticker
        else:
            # Pokud nový ticker je více "preference" než current primary
            if self._is_preferred_ticker_static(listing.ticker, self.primary_ticker):
                self.primary_ticker = listing.ticker
                self.primary_exchange = listing.exchange_name
        
        self.total_exchanges = len(self.exchange_listings)
    
    @staticmethod
    def _is_preferred_ticker_static(new_ticker: str, current_ticker: str) -> bool:
        """Určuje, zda je nový ticker preferovanější než současný"""
        if not new_ticker or not current_ticker:
            return bool(new_ticker)  # Preferuj neprázdný ticker
        
        # Známé populární tickery (preferuj tyto)
        popular_tickers = {
            'CSPX', 'VWCE', 'IWDA', 'VUAA', 'SWDA', 'VEVE',  # Core ETFs
            'EIMI', 'VFEM', 'XMME',  # Emerging markets
            'VHYL', 'UDVD', 'WDIV',  # Dividend ETFs
            'INRG', 'IUSN'  # Sector ETFs
        }
        
        # Pokud nový ticker je populární a současný ne, preferuj nový
        if new_ticker in popular_tickers and current_ticker not in popular_tickers:
            return True
        
        # Pokud současný ticker je populární a nový ne, zůstaň u současného
        if current_ticker in popular_tickers and new_ticker not in popular_tickers:
            return False
        
        # Pokud oba jsou populární nebo oba nejsou, preferuj kratší ticker
        if len(new_ticker) < len(current_ticker):
            return True
        
        # Při stejné délce, preferuj alfabeticky první
        if len(new_ticker) == len(current_ticker):
            return new_ticker < current_ticker
        
        return False
        
    def to_dict(self):
        base_dict = {
            'isin': self.isin,
            'name': self.name,
            'url': self.url,
            'description_en': self.description_en,
            'description_cs': self.description_cs,
            'ter': self.ter,
            'ter_numeric': self.ter_numeric,
            'fund_size': self.fund_size,
            'fund_size_numeric': self.fund_size_numeric,
            'fund_size_currency': self.fund_size_currency,
            'fund_currency': self.fund_currency,
            'fund_domicile': self.fund_domicile,
            'fund_provider': self.fund_provider,
            'inception_date': self.inception_date,
            'distribution_policy': self.distribution_policy,
            'distribution_frequency': self.distribution_frequency,
            'replication': self.replication,
            'legal_structure': self.legal_structure,
            'index_name': self.index_name,
            'investment_focus': self.investment_focus,
            'sustainability': self.sustainability,
            'currency_risk': self.currency_risk,
            'strategy_risk': self.strategy_risk,
            'category': self.category,
            'is_leveraged': self.is_leveraged,
            'region': self.region,
            'total_holdings': self.total_holdings,
            'return_1y': self.return_1y,
            'return_3y': self.return_3y,
            'return_5y': self.return_5y,
            'return_ytd': self.return_ytd,
            # NOVÁ POLE - kratší období a roční data
            'return_1m': self.return_1m,
            'return_3m': self.return_3m,
            'return_6m': self.return_6m,
            'return_2021': self.return_2021,
            'return_2022': self.return_2022,
            'return_2023': self.return_2023,
            'return_2024': self.return_2024,
            'return_2025': self.return_2025,
            'return_inception': self.return_inception,
            
            # Currency Performance - CZK
            'return_1m_czk': self.return_1m_czk,
            'return_3m_czk': self.return_3m_czk,
            'return_6m_czk': self.return_6m_czk,
            'return_ytd_czk': self.return_ytd_czk,
            'return_1y_czk': self.return_1y_czk,
            'return_3y_czk': self.return_3y_czk,
            'return_5y_czk': self.return_5y_czk,
            'return_2021_czk': self.return_2021_czk,
            'return_2022_czk': self.return_2022_czk,
            'return_2023_czk': self.return_2023_czk,
            'return_2024_czk': self.return_2024_czk,
            'return_2025_czk': self.return_2025_czk,

            # Currency Performance - USD
            'return_1m_usd': self.return_1m_usd,
            'return_3m_usd': self.return_3m_usd,
            'return_6m_usd': self.return_6m_usd,
            'return_ytd_usd': self.return_ytd_usd,
            'return_1y_usd': self.return_1y_usd,
            'return_3y_usd': self.return_3y_usd,
            'return_5y_usd': self.return_5y_usd,
            'return_2021_usd': self.return_2021_usd,
            'return_2022_usd': self.return_2022_usd,
            'return_2023_usd': self.return_2023_usd,
            'return_2024_usd': self.return_2024_usd,
            'return_2025_usd': self.return_2025_usd,

            # Metadata
            'currency_performance_updated_at': self.currency_performance_updated_at,
            
            'volatility_1y': self.volatility_1y,
            'volatility_3y': self.volatility_3y,
            'volatility_5y': self.volatility_5y,
            'return_per_risk_1y': self.return_per_risk_1y,
            'return_per_risk_3y': self.return_per_risk_3y,
            'return_per_risk_5y': self.return_per_risk_5y,
            'max_drawdown_1y': self.max_drawdown_1y,
            'max_drawdown_3y': self.max_drawdown_3y,
            'max_drawdown_5y': self.max_drawdown_5y,
            'max_drawdown_inception': self.max_drawdown_inception,
            'beta': self.beta,
            'correlation': self.correlation,
            'tracking_error': self.tracking_error,
            'information_ratio': self.information_ratio,
            
            # Stock Exchange Summary
            'primary_exchange': self.primary_exchange,
            'primary_ticker': self.primary_ticker,
            'total_exchanges': self.total_exchanges,
            
            # NOVÉ: Dividendové informace
            'current_dividend_yield': self.current_dividend_yield,
            'current_dividend_yield_numeric': self.current_dividend_yield_numeric,
            'dividends_12m': self.dividends_12m,
            'dividends_12m_numeric': self.dividends_12m_numeric,
            'dividends_12m_currency': self.dividends_12m_currency,
            'dividend_extraction_method': self.dividend_extraction_method,
            
            'scraping_date': self.scraping_date,
            'scraping_status': self.scraping_status,
            'retry_count': self.retry_count,
        }
        
        # Holdings - top 10
        for i in range(10):
            base_dict[f'holding_{i+1}_name'] = self.holdings[i][0] if i < len(self.holdings) else ""
            base_dict[f'holding_{i+1}_weight'] = self.holdings[i][1] if i < len(self.holdings) else None
        
        # Countries - top 5
        for i in range(5):
            base_dict[f'country_{i+1}_name'] = self.countries[i][0] if i < len(self.countries) else ""
            base_dict[f'country_{i+1}_weight'] = self.countries[i][1] if i < len(self.countries) else None
        
        # Sectors - top 5
        for i in range(5):
            base_dict[f'sector_{i+1}_name'] = self.sectors[i][0] if i < len(self.sectors) else ""
            base_dict[f'sector_{i+1}_weight'] = self.sectors[i][1] if i < len(self.sectors) else None
        
        # Exchange Listings (top 10 - ROZŠÍŘENO)
        for i in range(10):
            if i < len(self.exchange_listings):
                listing = self.exchange_listings[i]
                base_dict[f'exchange_{i+1}_name'] = listing.exchange_name
                base_dict[f'exchange_{i+1}_currency'] = listing.trade_currency
                base_dict[f'exchange_{i+1}_ticker'] = listing.ticker
                base_dict[f'exchange_{i+1}_bloomberg'] = listing.bloomberg_code
                base_dict[f'exchange_{i+1}_reuters'] = listing.reuters_code
                base_dict[f'exchange_{i+1}_market_maker'] = listing.market_maker
            else:
                base_dict[f'exchange_{i+1}_name'] = ""
                base_dict[f'exchange_{i+1}_currency'] = ""
                base_dict[f'exchange_{i+1}_ticker'] = ""
                base_dict[f'exchange_{i+1}_bloomberg'] = ""
                base_dict[f'exchange_{i+1}_reuters'] = ""
                base_dict[f'exchange_{i+1}_market_maker'] = ""
        
        # Calculate ETF rating based on the data
        try:
            rating_result = calculate_etf_rating(base_dict)
            base_dict['rating'] = rating_result['rating']
            base_dict['rating_score'] = rating_result['rating_score']
            # Store individual rating components for database
            base_dict['rating_ter_score'] = rating_result.get('rating_ter_score')
            base_dict['rating_size_score'] = rating_result.get('rating_size_score')
            base_dict['rating_track_record_score'] = rating_result.get('rating_track_record_score')
            base_dict['rating_provider_score'] = rating_result.get('rating_provider_score')
            base_dict['rating_performance_score'] = rating_result.get('rating_performance_score')
            # Optionally store breakdown as JSON
            # base_dict['rating_breakdown'] = json.dumps(rating_result['rating_breakdown'])
        except Exception as e:
            safe_log("warning", f"Rating calculation failed for {self.isin}: {e}")
            base_dict['rating'] = None
            base_dict['rating_score'] = None
            base_dict['rating_ter_score'] = None
            base_dict['rating_size_score'] = None
            base_dict['rating_track_record_score'] = None
            base_dict['rating_provider_score'] = None
            base_dict['rating_performance_score'] = None
        
        return base_dict
    

    def is_synthetic(self) -> bool:
        """Zkontroluje, zda je ETF syntetické"""
        return 'synthetic' in (self.replication or '').lower()


class KeepAwakeManager:
    """Správce pro udržení počítače v aktivním stavu během scrapingu"""
    def __init__(self):
        self.caffeinate_process = None
        self.keep_awake_thread = None
        self.running = False
        
    def start_keep_awake(self):
        """Spustí systém pro udržení počítače vzhůru"""
        if not CAFFEINE_AVAILABLE:
            safe_log("warning", "Caffeinate není dostupné - počítač se může uspat")
            return
            
        if sys.platform == "darwin":  # macOS
            try:
                self.caffeinate_process = subprocess.Popen(['caffeinate', '-d'])
                safe_log("info", "💡 Caffeinate aktivní - počítač nebude uspán")
            except Exception as e:
                safe_log("warning", f"Nelze spustit caffeinate: {e}")
        elif sys.platform.startswith("linux"):  # Linux
            self._start_linux_keep_awake()
        else:
            safe_log("warning", "Ochrana proti uspání není dostupná pro tento OS")
    
    def _start_linux_keep_awake(self):
        """Udržuje Linux počítač vzhůru pomocí xdotool nebo jiných metod"""
        self.running = True
        def keep_awake_loop():
            while self.running:
                try:
                    # Pokusí se poslat neviditelný keystroke
                    subprocess.run(['xdotool', 'key', 'ctrl'], 
                                 stdout=subprocess.DEVNULL, 
                                 stderr=subprocess.DEVNULL, 
                                 timeout=1)
                except:
                    pass
                time.sleep(300)  # Každých 5 minut
        
        self.keep_awake_thread = threading.Thread(target=keep_awake_loop, daemon=True)
        self.keep_awake_thread.start()
        safe_log("info", "💡 Linux keep-awake aktivní")
    
    def stop_keep_awake(self):
        """Zastaví systém pro udržení počítače vzhůru"""
        self.running = False
        
        if self.caffeinate_process:
            try:
                self.caffeinate_process.terminate()
                self.caffeinate_process.wait(timeout=5)
                safe_log("info", "💡 Caffeinate ukončen")
            except:
                try:
                    self.caffeinate_process.kill()
                except:
                    pass
            self.caffeinate_process = None


class CompleteProductionScraper:
    def __init__(self, batch_size: int = 50):
        self.batch_size = batch_size
        self.current_etf_index = 0  # For reduced logging
        self.keep_awake_manager = KeepAwakeManager()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,cs;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
        # Inicializace překladače
        if TRANSLATE_DESCRIPTIONS and GOOGLETRANS_AVAILABLE:
            try:
                self.translator = GoogleTranslator(source='en', target='cs')
                safe_log("info", "OK: Deep Translator (Google) inicializován")
            except Exception as e:
                safe_log("warning", f"WARNING: Translator chyba: {e}")
                self.translator = None
        else:
            self.translator = None
            
        # Inicializace Supabase klienta
        if AUTO_UPLOAD_TO_DB and SUPABASE_AVAILABLE:
            try:
                supabase_url = os.getenv('VITE_SUPABASE_URL')
                # Pro upload operations používáme SERVICE_ROLE klíč místo PUBLISHABLE klíče
                # Service role bypasses RLS, což je potřebné pro batch uploads
                supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
                
                if not supabase_url or not supabase_key:
                    safe_log("warning", "WARNING: Supabase credentials nejsou nastavené v .env souboru")
                    safe_log("warning", "       Zkontrolujte VITE_SUPABASE_URL a SUPABASE_SERVICE_ROLE_KEY")
                    self.supabase = None
                else:
                    self.supabase = create_client(supabase_url, supabase_key)
                    safe_log("info", "OK: Supabase klient inicializován s SERVICE_ROLE klíčem")
            except Exception as e:
                safe_log("warning", f"WARNING: Supabase klient chyba: {e}")
                self.supabase = None
        else:
            self.supabase = None
        
        # Inicializace Currency Performance Integrator
        try:
            self.currency_integrator = CurrencyPerformanceIntegrator()
            if self.currency_integrator.is_available():
                safe_log("info", "💱 Currency Performance Integrator inicializován")
            else:
                safe_log("warning", "💱 Currency conversion není dostupná")
        except Exception as e:
            safe_log("warning", f"💱 Currency integrator chyba: {e}")
            self.currency_integrator = None
    
    def load_isins_from_csv(self, csv_file: str) -> List[str]:
        """Načte ISIN kódy z CSV souboru"""
        safe_log("info", f"INFO: Načítám ISIN kódy z {csv_file}")
        
        isins = []
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    isin = row['ISIN'].strip()
                    if isin and len(isin) == 12:  # Validace ISIN
                        isins.append(isin)
                    else:
                        safe_log("warning", f"WARNING: Nevalidní ISIN: {isin}")
        
        except Exception as e:
            safe_log("error", f"ERROR: Chyba při načítání CSV: {e}")
            raise
        
        safe_log("info", f"OK: Načteno {len(isins)} validních ISIN kódů")
        return isins
    
    def load_checkpoint(self, batch_id: int) -> Optional[List[ETFDataComplete]]:
        """Načte checkpoint pro batch"""
        checkpoint_file = os.path.join(CHECKPOINTS_DIR, f"batch_{batch_id:04d}.json")
        
        if os.path.exists(checkpoint_file):
            try:
                with open(checkpoint_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                etf_list = []
                for item in data:
                    etf = ETFDataComplete(item['isin'])
                    # Restore základní data
                    for key, value in item.items():
                        if hasattr(etf, key):
                            setattr(etf, key, value)
                    
                    # Restore exchange listings (ROZŠÍŘENO na 10)
                    etf.exchange_listings = []
                    for i in range(1, 11):
                        exchange_name = item.get(f'exchange_{i}_name', '')
                        if exchange_name:
                            listing = ExchangeListing()
                            listing.exchange_name = exchange_name
                            listing.trade_currency = item.get(f'exchange_{i}_currency', '')
                            listing.ticker = item.get(f'exchange_{i}_ticker', '')
                            listing.bloomberg_code = item.get(f'exchange_{i}_bloomberg', '')
                            listing.reuters_code = item.get(f'exchange_{i}_reuters', '')
                            listing.market_maker = item.get(f'exchange_{i}_market_maker', '')
                            etf.exchange_listings.append(listing)
                    
                    # Restore holdings
                    etf.holdings = []
                    for i in range(1, 11):
                        name = item.get(f'holding_{i}_name', '')
                        weight = item.get(f'holding_{i}_weight')
                        if name and weight is not None:
                            etf.holdings.append((name, weight))
                    
                    # Restore countries a sectors
                    etf.countries = []
                    for i in range(1, 6):
                        name = item.get(f'country_{i}_name', '')
                        weight = item.get(f'country_{i}_weight')
                        if name and weight is not None:
                            etf.countries.append((name, weight))
                    
                    etf.sectors = []
                    for i in range(1, 6):
                        name = item.get(f'sector_{i}_name', '')
                        weight = item.get(f'sector_{i}_weight')
                        if name and weight is not None:
                            etf.sectors.append((name, weight))
                    
                    etf_list.append(etf)
                
                safe_log("info", f"CHECKPOINT: Načten checkpoint pro batch {batch_id}")
                return etf_list
            except Exception as e:
                safe_log("warning", f"WARNING: Chyba při načítání checkpoint: {e}")
        
        return None
    
    def save_checkpoint(self, batch_id: int, etf_list: List[ETFDataComplete]):
        """Uloží checkpoint pro batch"""
        checkpoint_file = os.path.join(CHECKPOINTS_DIR, f"batch_{batch_id:04d}.json")
        
        try:
            data = [etf.to_dict() for etf in etf_list]
            with open(checkpoint_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            safe_log("debug", f"SAVE: Checkpoint uložen pro batch {batch_id}")
        except Exception as e:
            safe_log("error", f"ERROR: Chyba při ukládání checkpoint: {e}")
    
    def is_batch_completed(self, batch_id: int, expected_count: int) -> bool:
        """Zkontroluje, zda je batch dokončený"""
        checkpoint = self.load_checkpoint(batch_id)
        if not checkpoint:
            return False
        
        completed = sum(1 for etf in checkpoint if etf.scraping_status in ['success', 'error', 'not_found'])
        return completed == expected_count
    
    def cleanup_checkpoints(self):
        """Smaže všechny checkpoint soubory po dokončení scrapingu"""
        try:
            if not os.path.exists(CHECKPOINTS_DIR):
                return
            
            checkpoint_files = [f for f in os.listdir(CHECKPOINTS_DIR) if f.endswith('.json')]
            
            if not checkpoint_files:
                safe_log("info", "🧹 CLEANUP: Žádné checkpoint soubory k mazání")
                return
            
            deleted_count = 0
            for filename in checkpoint_files:
                filepath = os.path.join(CHECKPOINTS_DIR, filename)
                try:
                    os.remove(filepath)
                    deleted_count += 1
                except Exception as e:
                    safe_log("error", f"❌ CLEANUP: Chyba při mazání {filename}: {e}")
            
            safe_log("info", f"🧹 CLEANUP: Smazáno {deleted_count} checkpoint souborů")
            
            # Pokus o smazání prázdné složky checkpoints
            try:
                if not os.listdir(CHECKPOINTS_DIR):
                    os.rmdir(CHECKPOINTS_DIR)
                    safe_log("info", "🧹 CLEANUP: Smazána prázdná složka checkpoints")
            except:
                pass  # Nevadí, pokud se nepodaří
                
        except Exception as e:
            safe_log("error", f"❌ CLEANUP: Chyba při čištění checkpointů: {e}")
    
    def scrape_etf_complete_with_retry(self, isin: str, max_retries: int = MAX_RETRIES) -> ETFDataComplete:
        """KOMPLETNÍ scraping s retry mechanismem + DIVIDENDY"""
        etf = ETFDataComplete(isin)
        etf.url = f"https://www.justetf.com/en/etf-profile.html?isin={isin}"
        
        for attempt in range(max_retries + 1):
            try:
                safe_log("debug", f"SCRAPING: {isin} (pokus {attempt + 1}/{max_retries + 1})")
                
                # Randomized delay
                time.sleep(random.uniform(2, 5))
                
                response = self.session.get(etf.url, timeout=30)
                
                if response.status_code == 404:
                    etf.scraping_status = "not_found"
                    safe_log("warning", f"WARNING: ETF {isin} nenalezen (404)")
                    break
                
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # KOMPLETNÍ EXTRAKCE - všechna data
                self._extract_basic_info_robust(soup, etf)
                self._extract_fund_info_robust(soup, etf)
                self._extract_detailed_table_data(soup, etf)
                self._extract_total_holdings_improved(soup, etf)
                self._extract_performance_robust(soup, etf)
                self._extract_comprehensive_risk_metrics_improved(soup, etf)
                self._extract_description_improved(soup, etf)
                self._categorize_etf(etf)
                self._determine_region(etf)
                
                # Stock Exchange Data
                if EXTRACT_EXCHANGE_DATA:
                    self._extract_stock_exchange_data(soup, etf)
                
                # NOVÉ: Dividendové informace
                if EXTRACT_DIVIDEND_DATA:
                    self._extract_dividend_data(soup, etf)
                
                # Portfolio data JEN pro fyzické ETF
                if not etf.is_synthetic():
                    self._extract_holdings_enhanced(soup, etf)
                    self._extract_geographic_enhanced(soup, etf)
                    self._extract_sectors_enhanced(soup, etf)
                else:
                    etf.holdings = []
                    etf.countries = []
                    etf.sectors = []
                    etf.total_holdings = None
                
                etf.scraping_status = "success"
                etf.retry_count = attempt
                
                # NOVÉ: Currency Performance Conversion
                if (self.currency_integrator and self.currency_integrator.is_available() and 
                    hasattr(etf, 'return_1y') and etf.return_1y is not None):
                    safe_log("debug", f"💱 Přidávám currency performance pro {isin}")
                    currency_success = self.currency_integrator.enhance_etf_with_currency_performance(etf)
                    
                    if currency_success:
                        safe_log("debug", f"✅ Currency performance úspěšně přidána pro {isin}")
                    else:
                        safe_log("debug", f"⚠️ Currency performance selhala pro {isin}")
                else:
                    safe_log("debug", f"⏭️ Přeskakuji currency conversion pro {isin} (no performance data)")
                
                # ROZŠÍŘENÝ LOG s dividendovými informacemi
                div_info = f"| Yield: {etf.current_dividend_yield or 'N/A'}" if etf.current_dividend_yield else ""
                safe_log("debug", f"OK: {isin}: {(etf.name[:30] + '...') if etf.name else 'No name'} | {etf.region} | ({etf.total_exchanges} exchanges) {div_info}")
                break
                
            except requests.exceptions.RequestException as e:
                safe_log("warning", f"WARNING: Network error scraping {isin} (pokus {attempt + 1}): {e}")
                etf.scraping_status = "network_error"
                etf.retry_count = attempt
                
                if attempt < max_retries:
                    time.sleep(RETRY_DELAY)
                
            except Exception as e:
                safe_log("error", f"ERROR: Error scraping {isin} (pokus {attempt + 1}): {e}")
                etf.scraping_status = "error"
                etf.retry_count = attempt
                
                if attempt < max_retries:
                    time.sleep(RETRY_DELAY)
        
        return etf
    
    def process_batch(self, batch_id: int, batch_isins: List[str], resume: bool = False) -> List[ETFDataComplete]:
        """Zpracuje jeden batch ETF s KOMPLETNÍMI daty"""
        if VERBOSE_MODE:
            safe_log("info", f"BATCH: Processing batch {batch_id} ({len(batch_isins)} ETFs)")
        
        # Pokus o načtení checkpointu
        if resume:
            checkpoint = self.load_checkpoint(batch_id)
            if checkpoint:
                completed = sum(1 for etf in checkpoint if etf.scraping_status in ['success', 'error', 'not_found'])
                if completed == len(batch_isins):
                    safe_log("info", f"OK: Batch {batch_id} už je dokončený")
                    return checkpoint
                else:
                    safe_log("info", f"RESUME: Pokračuji v batch {batch_id} ({completed}/{len(batch_isins)} hotovo)")
                    existing_data = {etf.isin: etf for etf in checkpoint}
        
        etf_list = []
        
        for i, isin in enumerate(batch_isins, 1):
            # Set current index for reduced logging
            self.current_etf_index = i
            
            # Zkontroluj, zda už existuje
            if resume and 'existing_data' in locals() and isin in existing_data:
                existing_etf = existing_data[isin]
                if existing_etf.scraping_status in ['success', 'error', 'not_found']:
                    etf_list.append(existing_etf)
                    safe_log("debug", f"SKIP: Přeskočen {isin} (už hotový)")
                    continue
            
            # Show progress every 10 ETFs only
            if i % 10 == 0 or i == len(batch_isins):
                safe_log("info", f"[Batch {batch_id}] Processing {i}/{len(batch_isins)} ETFs... Current: {isin}")
            
            etf = self.scrape_etf_complete_with_retry(isin)
            etf_list.append(etf)
            
            # Průběžné ukládání checkpointu
            if i % 10 == 0:
                self.save_checkpoint(batch_id, etf_list)
        
        # Finální checkpoint
        self.save_checkpoint(batch_id, etf_list)
        
        # Statistiky batch
        successful = sum(1 for etf in etf_list if etf.scraping_status == 'success')
        with_exchanges = sum(1 for etf in etf_list if etf.total_exchanges > 0)
        with_dividends = sum(1 for etf in etf_list if etf.current_dividend_yield)
        safe_log("info", f"OK: Batch {batch_id} dokončen: {successful}/{len(etf_list)} úspěšně, {with_exchanges} s exchange daty, {with_dividends} s dividend daty")
        
        return etf_list
    
    def export_batch_results(self, batch_id: int, etf_list: List[ETFDataComplete]):
        """Export výsledků batch s KOMPLETNÍMI daty (Excel, JSON, CSV)"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Připravi data
        data = [etf.to_dict() for etf in etf_list]
        df = pd.DataFrame(data)
        
        # Excel export
        excel_path = os.path.join(RESULTS_DIR, f'batch_{batch_id:04d}_{timestamp}.xlsx')
        df.to_excel(excel_path, index=False)
        
        # JSON export
        json_path = os.path.join(RESULTS_DIR, f'batch_{batch_id:04d}_{timestamp}.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # CSV export s UTF-8 encoding
        csv_path = os.path.join(RESULTS_DIR, f'batch_{batch_id:04d}_{timestamp}.csv')
        df.to_csv(csv_path, index=False, encoding='utf-8', sep=';')
        
        safe_log("info", f"EXPORT: Batch {batch_id} exportován:")
        safe_log("info", f"   Excel: {excel_path}")
        safe_log("info", f"   JSON: {json_path}")
        safe_log("info", f"   CSV: {csv_path}")
    
    def run_complete_production_scraping(self, csv_file: str, resume: bool = False, start_batch: int = 0):
        """Hlavní funkce pro KOMPLETNÍ production scraping s dividendy"""
        safe_log("info", "START: Spuštění KOMPLETNÍHO production scrapingu + DIVIDENDY")
        safe_log("info", f"CONFIG: batch_size={self.batch_size}, resume={resume}, exchange_data={EXTRACT_EXCHANGE_DATA}, dividend_data={EXTRACT_DIVIDEND_DATA}")
        
        # Spustí ochranu proti uspávání
        self.keep_awake_manager.start_keep_awake()
        
        try:
            # Načti ISIN kódy
            all_isins = self.load_isins_from_csv(csv_file)
            total_batches = (len(all_isins) + self.batch_size - 1) // self.batch_size
            
            safe_log("info", f"TOTAL: {len(all_isins)} ETF v {total_batches} batch")
            
            all_results = []
            
            for batch_id in range(start_batch, total_batches):
                start_idx = batch_id * self.batch_size
                end_idx = min(start_idx + self.batch_size, len(all_isins))
                batch_isins = all_isins[start_idx:end_idx]
                
                # Kvalitnější progress indikátor
                if VERBOSE_MODE:
                    safe_log("info", f"BATCH: {batch_id + 1}/{total_batches}")
                else:
                    safe_log("info", f"📦 Processing batch {batch_id + 1}/{total_batches} ({len(batch_isins)} ETFs)")
                
                # Zkontroluj, zda už je batch dokončený
                if resume and self.is_batch_completed(batch_id, len(batch_isins)):
                    safe_log("info", f"SKIP: Batch {batch_id} už je dokončený, přeskakuji")
                    checkpoint = self.load_checkpoint(batch_id)
                    if checkpoint:
                        all_results.extend(checkpoint)
                    continue
                
                try:
                    batch_results = self.process_batch(batch_id, batch_isins, resume)
                    self.export_batch_results(batch_id, batch_results)
                    all_results.extend(batch_results)
                    
                    # Statistiky průběhu
                    total_processed = (batch_id + 1) * self.batch_size
                    total_processed = min(total_processed, len(all_isins))
                    progress = (total_processed / len(all_isins)) * 100
                    
                    if VERBOSE_MODE:
                        safe_log("info", f"PROGRESS: {total_processed}/{len(all_isins)} ({progress:.1f}%)")
                    else:
                        safe_log("info", f"✅ Batch completed - Total progress: {total_processed}/{len(all_isins)} ({progress:.1f}%)")
                    
                except Exception as e:
                    safe_log("error", f"ERROR: Chyba v batch {batch_id}: {e}")
                    continue
        
            # Finální export všech výsledků
            self.export_final_results(all_results)
            
            safe_log("info", "DONE: KOMPLETNÍ production scraping s dividendy dokončen!")
        
        finally:
            # Vypni ochranu proti uspávání
            self.keep_awake_manager.stop_keep_awake()
    
    def export_final_results(self, all_results: List[ETFDataComplete]):
        """Finální export všech KOMPLETNÍCH výsledků s dividendy"""
        if not all_results:
            safe_log("warning", "WARNING: Žádné výsledky k exportu")
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Kombinuj všechny výsledky
        data = [etf.to_dict() for etf in all_results]
        df = pd.DataFrame(data)
        
        # Excel export
        excel_path = os.path.join(RESULTS_DIR, f'FINAL_COMPLETE_WITH_DIVIDENDS_{timestamp}.xlsx')
        df.to_excel(excel_path, index=False)
        
        # JSON export
        json_path = os.path.join(RESULTS_DIR, f'FINAL_COMPLETE_WITH_DIVIDENDS_{timestamp}.json')
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # CSV export s UTF-8 encoding
        csv_path = os.path.join(RESULTS_DIR, f'FINAL_COMPLETE_WITH_DIVIDENDS_{timestamp}.csv')
        df.to_csv(csv_path, index=False, encoding='utf-8', sep=';')
        
        # KOMPLETNÍ statistiky
        self._print_final_complete_statistics(all_results)
        
        safe_log("info", f"FINAL: KOMPLETNÍ výsledky s dividendy exportovány:")
        safe_log("info", f"   Excel: {excel_path}")
        safe_log("info", f"   JSON: {json_path}")
        safe_log("info", f"   CSV: {csv_path}")
        
        # NOVÉ: Automatické nahrávání do databáze
        if AUTO_UPLOAD_TO_DB and self.supabase:
            safe_log("info", f"🚀 DATABÁZE: Začínám automatické nahrávání do Supabase databáze...")
            successful_etfs = [etf for etf in all_results if etf.scraping_status == 'success']
            
            if successful_etfs:
                upload_success = self.upload_etfs_to_database(successful_etfs)
                if upload_success:
                    safe_log("info", f"🎉 DATABÁZE: ✅ Automatické nahrávání do databáze dokončeno úspěšně!")
                    
                    # NOVÉ: Aktualizuj website po úspěšném uploadu
                    trigger_website_refresh()
                else:
                    safe_log("error", f"❌ DATABÁZE: Chyba při automatickém nahrávání do databáze")
            else:
                safe_log("warning", f"⚠️  DATABÁZE: Žádné úspěšné ETF fondy k nahrání")
        else:
            if AUTO_UPLOAD_TO_DB:
                safe_log("info", f"📤 DATABÁZE: Automatické nahrávání je zapnuté, ale Supabase klient není dostupný")
            else:
                safe_log("info", f"💾 DATABÁZE: Automatické nahrávání je vypnuté (AUTO_UPLOAD_TO_DB=False)")
        
        # NOVÉ: Generování market heatmap dat
        if GENERATE_MARKET_HEATMAP:
            self._generate_market_heatmap_data()
        
        # NOVÉ: Automatické mazání checkpointů po dokončení
        if AUTO_CLEANUP:
            self.cleanup_checkpoints()
    
    def _upload_file_to_server(self, local_file_path: str, remote_filename: str) -> bool:
        """Nahraje soubor na server pomocí FTP/SFTP/GitHub"""
        if not UPLOAD_HEATMAP_TO_SERVER:
            return False
            
        try:
            if UPLOAD_METHOD == "dry_run":
                safe_log("info", f"🧪 DRY RUN: Simuluji nahrání {remote_filename} na {FTP_SERVER}{FTP_REMOTE_PATH}")
                safe_log("info", f"   Lokální soubor: {local_file_path} ({os.path.getsize(local_file_path)} bytů)")
                return True
            elif UPLOAD_METHOD == "github_commit":
                return self._upload_via_github_commit(local_file_path, remote_filename)
            elif UPLOAD_METHOD == "sftp":
                return self._upload_via_sftp(local_file_path, remote_filename)
            elif UPLOAD_METHOD == "ftp":
                return self._upload_via_ftp(local_file_path, remote_filename)
            elif UPLOAD_METHOD == "scp":
                return self._upload_via_scp(local_file_path, remote_filename)
            else:
                safe_log("error", f"❌ UPLOAD: Neznámá metoda nahrávání: {UPLOAD_METHOD}")
                return False
        except Exception as e:
            safe_log("error", f"❌ UPLOAD: Chyba při nahrávání {remote_filename}: {e}")
            return False
    
    def _upload_via_sftp(self, local_file_path: str, remote_filename: str) -> bool:
        """Nahraje soubor přes SFTP"""
        try:
            # Vytvořit SSH klienta
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Připojit se k serveru
            safe_log("debug", f"🔗 SFTP: Připojuji se k {FTP_SERVER}...")
            ssh.connect(FTP_SERVER, username=FTP_USERNAME, password=FTP_PASSWORD)
            
            # Vytvořit SFTP klienta
            sftp = ssh.open_sftp()
            
            # Nahrát soubor
            remote_path = FTP_REMOTE_PATH + remote_filename
            safe_log("debug", f"📤 SFTP: Nahrávám {local_file_path} → {remote_path}")
            sftp.put(local_file_path, remote_path)
            
            # Zavřít spojení
            sftp.close()
            ssh.close()
            
            safe_log("info", f"✅ SFTP: Úspěšně nahráno: {remote_filename}")
            return True
            
        except Exception as e:
            safe_log("error", f"❌ SFTP: Chyba při nahrávání {remote_filename}: {e}")
            return False
    
    def _upload_via_ftp(self, local_file_path: str, remote_filename: str) -> bool:
        """Nahraje soubor přes FTP"""
        try:
            # Vytvořit FTP spojení
            ftp = ftplib.FTP(FTP_SERVER)
            ftp.login(FTP_USERNAME, FTP_PASSWORD)
            
            # Změnit na cílovou složku
            ftp.cwd(FTP_REMOTE_PATH)
            
            # Nahrát soubor
            with open(local_file_path, 'rb') as file:
                ftp.storbinary(f'STOR {remote_filename}', file)
            
            # Zavřít spojení
            ftp.quit()
            
            safe_log("info", f"✅ FTP: Úspěšně nahráno: {remote_filename}")
            return True
            
        except Exception as e:
            safe_log("error", f"❌ FTP: Chyba při nahrávání {remote_filename}: {e}")
            return False
    
    def _upload_via_scp(self, local_file_path: str, remote_filename: str) -> bool:
        """Nahraje soubor přes SCP (pomocí subprocess)"""
        try:
            remote_path = f"{FTP_USERNAME}@{FTP_SERVER}:{FTP_REMOTE_PATH}{remote_filename}"
            cmd = ["scp", local_file_path, remote_path]
            
            safe_log("debug", f"🔗 SCP: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                safe_log("info", f"✅ SCP: Úspěšně nahráno: {remote_filename}")
                return True
            else:
                safe_log("error", f"❌ SCP: Chyba: {result.stderr}")
                return False
                
        except Exception as e:
            safe_log("error", f"❌ SCP: Chyba při nahrávání {remote_filename}: {e}")
            return False
    
    def _upload_via_github_commit(self, local_file_path: str, remote_filename: str) -> bool:
        """Nahraje soubor přes automatický Git commit a push"""
        try:
            # Soubor je už uložený v správném místě (/src/data/), jen commitneme změny
            safe_log("info", f"🔗 GITHUB: Commituji {remote_filename} do Git repository...")
            
            # Git add pro konkrétní soubor
            git_add_cmd = ["git", "add", local_file_path]
            result = subprocess.run(git_add_cmd, capture_output=True, text=True, cwd="/Users/tomaskostrhoun/Documents/ETF")
            
            if result.returncode != 0:
                safe_log("error", f"❌ GITHUB: Git add selhalo: {result.stderr}")
                return False
            
            # Git commit s automatickým message
            commit_message = f"📊 Automatická aktualizace market heatmap dat ({remote_filename})\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"
            git_commit_cmd = ["git", "commit", "-m", commit_message]
            result = subprocess.run(git_commit_cmd, capture_output=True, text=True, cwd="/Users/tomaskostrhoun/Documents/ETF")
            
            # Pokud není co commitnout, je to OK
            if result.returncode != 0 and "nothing to commit" not in result.stdout:
                safe_log("warning", f"⚠️ GITHUB: Git commit: {result.stderr}")
                # Pokračujeme i přesto - možná už je commitnuto
            
            # Git push
            git_push_cmd = ["git", "push", "origin", "main"]
            result = subprocess.run(git_push_cmd, capture_output=True, text=True, cwd="/Users/tomaskostrhoun/Documents/ETF")
            
            if result.returncode == 0:
                safe_log("info", f"✅ GITHUB: Úspěšně commitnuto a pushnuto: {remote_filename}")
                return True
            else:
                safe_log("error", f"❌ GITHUB: Git push selhalo: {result.stderr}")
                return False
                
        except Exception as e:
            safe_log("error", f"❌ GITHUB: Chyba při commitování {remote_filename}: {e}")
            return False
    
    def _generate_market_heatmap_data(self):
        """Generování market heatmap dat pro všechna období"""
        safe_log("info", "🔥 HEATMAP: Začínám generování market heatmap dat...")
        
        try:
            # Vytvořit instanci generátoru
            generator = MarketHeatmapGenerator()
            
            # Nastavit cestu pro uložení dat do frontend složky
            frontend_data_path = os.getenv("HEATMAP_OUTPUT_DIR", "/Users/tomaskostrhoun/Documents/ETF/src/data"); os.makedirs(frontend_data_path, exist_ok=True)
            
            # Generovat data pro všechna období
            periods = ['1d', 'wtd', 'mtd', 'ytd', '1y', '3y', '5y', '10y']
            
            successful_periods = 0
            total_periods = len(periods)
            
            for period in periods:
                try:
                    safe_log("info", f"🔄 HEATMAP: Generuji data pro období {period}...")
                    
                    # Generovat heatmap data
                    heatmap_data = generator.generate_heatmap_data(period)
                    
                    # Přidat statistiky
                    stats = generator.generate_summary_stats(heatmap_data)
                    heatmap_data['summary_stats'] = stats
                    
                    # Uložit do ETF frontend složky
                    filename = f"market_heatmap_{period}.json"
                    output_path = os.path.join(frontend_data_path, filename)
                    
                    # Vytvořit složku pokud neexistuje
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    
                    with open(output_path, 'w', encoding='utf-8') as f:
                        json.dump(heatmap_data, f, indent=2, ensure_ascii=False)
                    
                    successful_periods += 1
                    safe_log("info", f"✅ HEATMAP: {period} úspěšně uloženo do {output_path}")
                    
                    # Nahrát soubor na server (pokud je to zapnuté)
                    if UPLOAD_HEATMAP_TO_SERVER:
                        upload_success = self._upload_file_to_server(output_path, filename)
                        if upload_success:
                            safe_log("info", f"🌐 HEATMAP: {period} úspěšně nahráno na server")
                        else:
                            safe_log("warning", f"⚠️ HEATMAP: Chyba při nahrávání {period} na server")
                    
                    # Zobrazit souhrn pro období
                    for category, avg in stats['category_averages'].items():
                        safe_log("debug", f"   {category}: {avg:.2f}% průměr")
                        
                except Exception as period_error:
                    safe_log("error", f"❌ HEATMAP: Chyba při generování {period}: {period_error}")
                    continue
            
            # Finální statistiky
            safe_log("info", f"🎉 HEATMAP: Dokončeno! Úspěšně vygenerováno {successful_periods}/{total_periods} období")
            safe_log("info", f"📁 HEATMAP: Data uložena do: {frontend_data_path}")
            
        except Exception as e:
            safe_log("error", f"❌ HEATMAP: Kritická chyba při generování market heatmap: {e}")
    
    def _print_final_complete_statistics(self, etf_list: List[ETFDataComplete]):
        """Výpis KOMPLETNÍCH finálních statistik včetně dividend"""
        successful = [etf for etf in etf_list if etf.scraping_status == 'success']
        errors = [etf for etf in etf_list if etf.scraping_status == 'error']
        not_found = [etf for etf in etf_list if etf.scraping_status == 'not_found']
        
        safe_log("info", f"STATS: FINÁLNÍ KOMPLETNÍ STATISTIKY S DIVIDENDY:")
        safe_log("info", f"   Total ETFs: {len(etf_list)}")
        safe_log("info", f"   Successful: {len(successful)} ({len(successful)/len(etf_list)*100:.1f}%)")
        safe_log("info", f"   Errors: {len(errors)} ({len(errors)/len(etf_list)*100:.1f}%)")
        safe_log("info", f"   Not found: {len(not_found)} ({len(not_found)/len(etf_list)*100:.1f}%)")
        
        if successful:
            # DIVIDENDOVÉ STATISTIKY
            with_dividend_yield = [etf for etf in successful if etf.current_dividend_yield]
            with_dividends_12m = [etf for etf in successful if etf.dividends_12m]
            
            safe_log("info", f"DIVIDEND DATA:")
            safe_log("info", f"   ETFs s dividend yield: {len(with_dividend_yield)}/{len(successful)} ({len(with_dividend_yield)/len(successful)*100:.1f}%)")
            safe_log("info", f"   ETFs s 12M dividends: {len(with_dividends_12m)}/{len(successful)} ({len(with_dividends_12m)/len(successful)*100:.1f}%)")
            
            if with_dividend_yield:
                yield_values = [etf.current_dividend_yield_numeric for etf in with_dividend_yield if etf.current_dividend_yield_numeric is not None]
                if yield_values:
                    safe_log("info", f"   Dividend yield range: {min(yield_values):.2f}% - {max(yield_values):.2f}%")
                    safe_log("info", f"   Average dividend yield: {sum(yield_values)/len(yield_values):.2f}%")
            
            # Exchange data statistiky
            with_exchanges = [etf for etf in successful if etf.total_exchanges > 0]
            total_exchange_listings = sum(etf.total_exchanges for etf in with_exchanges)
            
            safe_log("info", f"EXCHANGE DATA:")
            safe_log("info", f"   ETFs s exchange daty: {len(with_exchanges)}/{len(successful)} ({len(with_exchanges)/len(successful)*100:.1f}%)")
            safe_log("info", f"   Celkem exchange listings: {total_exchange_listings}")
            
            # Kategorie
            categories = {}
            for etf in successful:
                cat = etf.category or 'Neznámá'
                categories[cat] = categories.get(cat, 0) + 1
            
            safe_log("info", f"KATEGORIE:")
            for category, count in sorted(categories.items()):
                safe_log("info", f"   {category}: {count} ETF")
            
            # Regiony
            regions = {}
            for etf in successful:
                reg = etf.region or 'Neznámý'
                regions[reg] = regions.get(reg, 0) + 1
            
            safe_log("info", f"REGIONY:")
            for region, count in sorted(regions.items(), key=lambda x: x[1], reverse=True):
                safe_log("info", f"   {region}: {count} ETF")

    # ========================================
    # NOVÉ DIVIDENDOVÉ METODY
    # ========================================
    
    def _extract_dividend_data(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """NOVÁ FUNKCE: Extrakce dividendových informací"""
        safe_log("debug", f"DIVIDEND: Extracting dividend data for {etf.isin}")
        
        # Test různých metod extrakce
        dividend_data = {
            'current_dividend_yield': None,
            'current_dividend_yield_numeric': None,
            'dividends_12m': None,
            'dividends_12m_numeric': None,
            'dividends_12m_currency': None,
            'extraction_method': None
        }
        
        # Metoda 1: Hledání sekce "Dividends"
        dividend_data = self._extract_dividends_method1(soup, dividend_data)
        
        # Metoda 2: Regex v celém textu
        if not dividend_data['current_dividend_yield']:
            dividend_data = self._extract_dividends_method2(soup, dividend_data)
        
        # Metoda 3: Hledání podle class/id
        if not dividend_data['current_dividend_yield']:
            dividend_data = self._extract_dividends_method3(soup, dividend_data)
        
        # Uložení do ETF objektu
        etf.current_dividend_yield = dividend_data['current_dividend_yield'] or ""
        etf.current_dividend_yield_numeric = dividend_data['current_dividend_yield_numeric']
        etf.dividends_12m = dividend_data['dividends_12m'] or ""
        etf.dividends_12m_numeric = dividend_data['dividends_12m_numeric']
        etf.dividends_12m_currency = dividend_data['dividends_12m_currency'] or ""
        etf.dividend_extraction_method = dividend_data['extraction_method'] or ""
        
        safe_log("debug", f"   DIVIDEND: Yield={etf.current_dividend_yield}, 12M={etf.dividends_12m}, Method={etf.dividend_extraction_method}")
    
    def _extract_dividends_method1(self, soup: BeautifulSoup, dividend_data: dict) -> dict:
        """Metoda 1: Hledání sekce Dividends"""
        
        # Hledej nadpis "Dividends"
        dividend_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'], 
                                        string=re.compile(r'Dividends?', re.I))
        
        for heading in dividend_headings:
            # Najdi parent sekci
            section = heading.find_parent(['section', 'div', 'article'])
            if not section:
                section = heading.find_next_sibling()
                
            if section:
                section_text = section.get_text()
                
                # Hledej Current dividend yield
                yield_match = re.search(r'Current\s+dividend\s+yield[:\s]*(\d+[.,]\d+)%', section_text, re.I)
                if yield_match:
                    dividend_data['current_dividend_yield'] = f"{yield_match.group(1)}%"
                    dividend_data['current_dividend_yield_numeric'] = float(yield_match.group(1).replace(',', '.'))
                    dividend_data['extraction_method'] = 'method1_section'
                
                # Hledej Dividends last 12 months
                div_12m_patterns = [
                    r'Dividends?\s*\(last\s+12\s+months?\)[:\s]*([A-Z]{3})\s*([\d,\.]+)',
                    r'Dividends?\s*\(last\s+12\s+months?\)[:\s]*([\d,\.]+)\s*([A-Z]{3})',
                    r'Dividends?\s*12\s*months?[:\s]*([A-Z]{3})\s*([\d,\.]+)',
                ]
                
                for pattern in div_12m_patterns:
                    div_match = re.search(pattern, section_text, re.I)
                    if div_match:
                        # Zkontroluj pořadí (měna, hodnota) vs (hodnota, měna)
                        if re.match(r'^[A-Z]{3}$', div_match.group(1)):
                            # Měna, hodnota
                            currency = div_match.group(1)
                            value = div_match.group(2).replace(',', '')
                        else:
                            # Hodnota, měna
                            value = div_match.group(1).replace(',', '')
                            currency = div_match.group(2)
                        
                        dividend_data['dividends_12m'] = f"{currency} {value}"
                        dividend_data['dividends_12m_numeric'] = float(value)
                        dividend_data['dividends_12m_currency'] = currency
                        break
                
                if dividend_data['current_dividend_yield']:
                    break
        
        return dividend_data
    
    def _extract_dividends_method2(self, soup: BeautifulSoup, dividend_data: dict) -> dict:
        """Metoda 2: Regex patterns v celém textu"""
        
        full_text = soup.get_text()
        
        # Enhanced current dividend yield patterns
        yield_patterns = [
            r'Current\s+dividend\s+yield[:\s]*(\d+[.,]\d+)%',
            r'Dividend\s+yield[:\s]*(\d+[.,]\d+)%',
            r'Yield[:\s]*(\d+[.,]\d+)%',
            # Table patterns
            r'<td[^>]*>\s*Current\s+dividend\s+yield\s*</td>\s*<td[^>]*>\s*(\d+[.,]\d+)%\s*</td>',
            r'>Current dividend yield</td>\s*<td[^>]*>(\d+[.,]\d+)%',
            r'vallabel[^>]*>Current dividend yield[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)%',
            r'<td[^>]*>\s*Dividend\s+yield\s*</td>\s*<td[^>]*>\s*(\d+[.,]\d+)%\s*</td>',
            r'>Dividend yield</td>\s*<td[^>]*>(\d+[.,]\d+)%',
            # Distribution yield patterns
            r'Distribution\s+yield[:\s]*(\d+[.,]\d+)%',
            r'<td[^>]*>\s*Distribution\s+yield\s*</td>\s*<td[^>]*>\s*(\d+[.,]\d+)%\s*</td>',
            r'>Distribution yield</td>\s*<td[^>]*>(\d+[.,]\d+)%',
            # 12 month yield patterns
            r'12\s*-?\s*month\s+yield[:\s]*(\d+[.,]\d+)%',
            r'12M\s+yield[:\s]*(\d+[.,]\d+)%',
            r'TTM\s+yield[:\s]*(\d+[.,]\d+)%',
            # German patterns
            r'Dividendenrendite[:\s]*(\d+[.,]\d+)%',
            r'Ausschüttungsrendite[:\s]*(\d+[.,]\d+)%',
            # Alternative yield formats
            r'Annual\s+yield[:\s]*(\d+[.,]\d+)%',
            r'Trailing\s+yield[:\s]*(\d+[.,]\d+)%',
            # Additional robust patterns
            r'Income\s+yield[:\s]*(\d+[.,]\d+)%',
            r'Trailing\s+12\s*-?\s*month\s+yield[:\s]*(\d+[.,]\d+)%',
            r'SEC\s+yield[:\s]*(\d+[.,]\d+)%',
            r'30\s*-?\s*day\s+yield[:\s]*(\d+[.,]\d+)%',
            # More flexible patterns
            r'Yield\s*\([^)]*\)[:\s]*(\d+[.,]\d+)%',
            r'Current\s+yield[:\s]*(\d+[.,]\d+)%',
            # Pattern with optional colon and whitespace variations
            r'(?:Current\s+)?(?:Dividend\s+|Distribution\s+)?[Yy]ield\s*:?\s*(\d+[.,]\d+)\s*%',
            # French patterns
            r'Rendement[:\s]*(\d+[.,]\d+)%',
            r'Taux\s+de\s+distribution[:\s]*(\d+[.,]\d+)%'
        ]
        
        for pattern in yield_patterns:
            yield_match = re.search(pattern, full_text, re.I)
            if yield_match:
                value = yield_match.group(1).replace(',', '.')
                dividend_data['current_dividend_yield'] = f"{value}%"
                dividend_data['current_dividend_yield_numeric'] = float(value)
                dividend_data['extraction_method'] = 'method2_regex'
                break
        
        # Enhanced dividends 12 months patterns
        div_12m_patterns = [
            r'Dividends?\s*\(last\s+12\s+months?\)[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'Dividends?\s*\(last\s+12\s+months?\)[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            r'Last\s+12\s+months?[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'Last\s+12\s+months?[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            # Table patterns
            r'<td[^>]*>\s*Dividends\s*\(last\s+12\s+months?\)\s*</td>\s*<td[^>]*>\s*([A-Z]{3})\s*([\d,\.]+)\s*</td>',
            r'<td[^>]*>\s*Dividends\s*\(last\s+12\s+months?\)\s*</td>\s*<td[^>]*>\s*([\d,\.]+)\s*([A-Z]{3})\s*</td>',
            r'>Dividends \(last 12 months\)</td>\s*<td[^>]*>([A-Z]{3})\s*([\d,\.]+)',
            r'>Dividends \(last 12 months\)</td>\s*<td[^>]*>([\d,\.]+)\s*([A-Z]{3})',
            r'vallabel[^>]*>Dividends \(last 12 months\)[^<]*</td>\s*<td[^>]*>([A-Z]{3})\s*([\d,\.]+)',
            r'vallabel[^>]*>Dividends \(last 12 months\)[^<]*</td>\s*<td[^>]*>([\d,\.]+)\s*([A-Z]{3})',
            # Distribution patterns
            r'Distributions?\s*\(last\s+12\s+months?\)[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'Distributions?\s*\(last\s+12\s+months?\)[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            r'<td[^>]*>\s*Distributions\s*\(last\s+12\s+months?\)\s*</td>\s*<td[^>]*>\s*([A-Z]{3})\s*([\d,\.]+)\s*</td>',
            r'<td[^>]*>\s*Distributions\s*\(last\s+12\s+months?\)\s*</td>\s*<td[^>]*>\s*([\d,\.]+)\s*([A-Z]{3})\s*</td>',
            # TTM (Trailing Twelve Months) patterns
            r'TTM\s+dividends?[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'TTM\s+dividends?[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            r'12M\s+dividends?[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'12M\s+dividends?[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            # Annual dividend patterns
            r'Annual\s+dividends?[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'Annual\s+dividends?[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            # German patterns
            r'Dividenden\s*\(letzte\s+12\s+Monate\)[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'Dividenden\s*\(letzte\s+12\s+Monate\)[:\s]*([\d,\.]+)\s*([A-Z]{3})',
            r'Ausschüttungen\s*\(letzte\s+12\s+Monate\)[:\s]*([A-Z]{3})\s*([\d,\.]+)',
            r'Ausschüttungen\s*\(letzte\s+12\s+Monate\)[:\s]*([\d,\.]+)\s*([A-Z]{3})'
        ]
        
        for pattern in div_12m_patterns:
            div_match = re.search(pattern, full_text, re.I)
            if div_match:
                # Zkontroluj pořadí
                if re.match(r'^[A-Z]{3}$', div_match.group(1)):
                    currency = div_match.group(1)
                    value = div_match.group(2).replace(',', '')
                else:
                    value = div_match.group(1).replace(',', '')
                    currency = div_match.group(2)
                
                dividend_data['dividends_12m'] = f"{currency} {value}"
                dividend_data['dividends_12m_numeric'] = float(value)
                dividend_data['dividends_12m_currency'] = currency
                break
        
        return dividend_data
    
    def _extract_dividends_method3(self, soup: BeautifulSoup, dividend_data: dict) -> dict:
        """Metoda 3: CSS selektory a class/id hledání"""
        
        # Hledej elementy s 'dividend' v class nebo id
        dividend_elements = soup.find_all(['div', 'span', 'td', 'th'], 
                                        attrs={'class': re.compile(r'dividend', re.I)})
        dividend_elements += soup.find_all(['div', 'span', 'td', 'th'], 
                                         attrs={'id': re.compile(r'dividend', re.I)})
        
        for element in dividend_elements:
            element_text = element.get_text().strip()
            
            # Hledej yield v tomto elementu
            yield_match = re.search(r'(\d+[.,]\d+)%', element_text)
            if yield_match and not dividend_data['current_dividend_yield']:
                value = yield_match.group(1).replace(',', '.')
                # Validace - dividend yield by měl být rozumný (0-20%)
                if 0 <= float(value) <= 20:
                    dividend_data['current_dividend_yield'] = f"{value}%"
                    dividend_data['current_dividend_yield_numeric'] = float(value)
                    dividend_data['extraction_method'] = 'method3_css'
        
        return dividend_data

    # ========================================
    # OSTATNÍ EXTRAKČNÍ METODY (stejné jako předtím)
    # ========================================
    
    def _determine_region(self, etf: ETFDataComplete):
        """ZJEDNODUŠENÉ určení regionu - prioritně z investment_focus"""
        name_lower = (etf.name or '').lower()
        investment_focus_lower = (etf.investment_focus or '').lower()
        
        # 1. PRIORITNÍ REGION Z INVESTMENT_FOCUS (nejpřesnější)
        if investment_focus_lower:
            if 'united states' in investment_focus_lower or 'usa' in investment_focus_lower:
                etf.region = 'Severní Amerika'
                return
            elif 'europe' in investment_focus_lower or 'european' in investment_focus_lower:
                etf.region = 'Evropa'
                return
            elif 'asia' in investment_focus_lower or 'pacific' in investment_focus_lower:
                etf.region = 'Asie a Pacifik'
                return
            elif 'emerging' in investment_focus_lower:
                etf.region = 'Rozvíjející se trhy'
                return
            elif 'global' in investment_focus_lower or 'world' in investment_focus_lower:
                etf.region = 'Celosvětově'
                return
        
        # 2. FALLBACK NA NÁZEV (základní detekce)
        if any(word in name_lower for word in ['s&p 500', 'nasdaq', 'usa', 'america']):
            etf.region = 'Severní Amerika'
        elif any(word in name_lower for word in ['europe', 'stoxx', 'ftse']):
            etf.region = 'Evropa'
        elif any(word in name_lower for word in ['emerging', 'em ']):
            etf.region = 'Rozvíjející se trhy'
        elif any(word in name_lower for word in ['world', 'global', 'international']):
            etf.region = 'Celosvětově'
        else:
            # Default pro většinu ETF
            etf.region = 'Celosvětově'
    
    def _extract_stock_exchange_data(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Rychlá extrakce stock exchange dat s opravami"""
        exchange_section = None
        
        
        # Hledej Stock Exchange sekci - více metod
        exchange_elements = soup.find_all(['section', 'div', 'table'], 
                                        string=re.compile(r'Stock\s+exchange', re.I))
        
        if self.current_etf_index <= 3:
            safe_log("debug", f"EXCHANGE: Found {len(exchange_elements)} elements with 'Stock exchange' text")
        
        # Pokus 2: Hledej jen "exchange" 
        if not exchange_elements:
            exchange_elements = soup.find_all(['section', 'div', 'table'], 
                                            string=re.compile(r'exchange', re.I))
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: Found {len(exchange_elements)} elements with 'exchange' text")
        
        # Pokus 3: Hledej tabulky s typickými exchange headers
        if not exchange_elements:
            tables = soup.find_all('table')
            for table in tables:
                text = table.get_text().lower()
                # Musí mít kombinaci listing/exchange AND ticker/bloomberg
                has_exchange = any(keyword in text for keyword in ['listing', 'stock exchange'])
                has_ticker = any(keyword in text for keyword in ['ticker', 'bloomberg', 'reuters'])
                has_currency = 'currency' in text
                
                if has_exchange and has_ticker and has_currency:
                    exchange_elements = [table]
                    if self.current_etf_index <= 3:
                        safe_log("debug", f"EXCHANGE: Found exchange table with listing+ticker+currency keywords")
                    break
                elif has_ticker and has_currency and ('xetra' in text or 'london' in text):
                    # Fallback - pokud najde ticker+currency+známou burzu
                    exchange_elements = [table]
                    if self.current_etf_index <= 3:
                        safe_log("debug", f"EXCHANGE: Found exchange table with ticker+currency+exchange names")
                    break
        
        for element in exchange_elements:
            parent = element.find_parent(['section', 'div', 'article'])
            if parent:
                exchange_section = parent
                if self.current_etf_index <= 3:
                    safe_log("debug", f"EXCHANGE: Found parent section for stock exchange")
                break
        
        if exchange_section:
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: Found exchange section, calling _parse_exchange_table")
            self._parse_exchange_table(exchange_section, etf)
        else:
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: No exchange section found, calling _extract_exchange_from_text")
            self._extract_exchange_from_text(soup, etf)
        
        # Metoda 2: Nastav primary ticker z nejlepšího table kandidáta
        if not etf.primary_ticker and etf.exchange_listings:
            # Najdi první listing s tickerem
            for listing in etf.exchange_listings:
                if listing.ticker:
                    etf.primary_ticker = listing.ticker
                    etf.primary_exchange = listing.exchange_name
                    break
        
        # Metoda 3: Fallback - hledej ticker v celém textu pouze pokud tabulky selhaly
        if not etf.primary_ticker:
            self._extract_ticker_from_full_text(soup, etf)
        
    
    def _parse_exchange_table(self, section: BeautifulSoup, etf: ETFDataComplete):
        """Parsuje tabulku s exchange daty s DEBUG výstupem"""
        table = section if section.name == 'table' else section.find('table')
        
        if not table:
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: No table found in section")
            return
        
        rows = table.find_all('tr')
        if not rows:
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: No rows found in table")
            return
        
        header_row = rows[0]
        headers = [th.get_text().strip().lower() for th in header_row.find_all(['th', 'td'])]
        if self.current_etf_index <= 3:
            safe_log("debug", f"EXCHANGE: Headers found: {headers}")
        
        col_mapping = {}
        for i, header in enumerate(headers):
            if 'listing' in header or 'exchange' in header:
                col_mapping['exchange'] = i
            elif 'currency' in header:
                col_mapping['currency'] = i
            elif 'ticker' in header:
                col_mapping['ticker'] = i
            elif 'bloomberg' in header:
                col_mapping['bloomberg'] = i
            elif 'reuters' in header:
                col_mapping['reuters'] = i
        
        if self.current_etf_index <= 3:
            safe_log("debug", f"EXCHANGE: Column mapping: {col_mapping}")
        
        # Parsuj data řádky
        for row_idx, row in enumerate(rows[1:], 1):
            cells = row.find_all(['td', 'th'])
            if len(cells) < 2:
                continue
            
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: Row {row_idx} cells: {[cell.get_text().strip() for cell in cells]}")
            
            listing = ExchangeListing()
            
            if 'exchange' in col_mapping and col_mapping['exchange'] < len(cells):
                listing.exchange_name = cells[col_mapping['exchange']].get_text().strip()
            
            if 'currency' in col_mapping and col_mapping['currency'] < len(cells):
                listing.trade_currency = cells[col_mapping['currency']].get_text().strip()
            
            if 'ticker' in col_mapping and col_mapping['ticker'] < len(cells):
                raw_ticker = cells[col_mapping['ticker']].get_text().strip()
                if self.current_etf_index <= 3:
                    safe_log("debug", f"EXCHANGE: Raw ticker from cell {col_mapping['ticker']}: '{raw_ticker}'")
                listing.ticker = raw_ticker
            
            if 'bloomberg' in col_mapping and col_mapping['bloomberg'] < len(cells):
                bloomberg_raw = cells[col_mapping['bloomberg']].get_text().strip()
                if bloomberg_raw and bloomberg_raw != '--':
                    listing.bloomberg_code = bloomberg_raw
            
            if 'reuters' in col_mapping and col_mapping['reuters'] < len(cells):
                reuters_raw = cells[col_mapping['reuters']].get_text().strip()
                if reuters_raw and reuters_raw != '--':
                    listing.reuters_code = reuters_raw
            
            if self.current_etf_index <= 3:
                safe_log("debug", f"EXCHANGE: Created listing - Exchange: '{listing.exchange_name}', Ticker: '{listing.ticker}', Currency: '{listing.trade_currency}'")
            
            if listing.exchange_name and len(listing.exchange_name) > 1:
                etf.add_exchange_listing(listing)
                if self.current_etf_index <= 3:
                    safe_log("debug", f"EXCHANGE: Added listing for {listing.exchange_name}")
            else:
                if self.current_etf_index <= 3:
                    safe_log("debug", f"EXCHANGE: Skipped listing - invalid exchange name: '{listing.exchange_name}'")
    
    def _extract_exchange_from_text(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Fallback extrakce exchange dat z textu"""
        text = soup.get_text()
        
        exchanges = [
            'London Stock Exchange', 'Frankfurt Stock Exchange', 'Stuttgart Stock Exchange',
            'Euronext Amsterdam', 'Six Swiss Exchange', 'XETRA', 'Borsa Italiana',
            'gettex', 'Tradegate', 'NYSE', 'NASDAQ', 'Euronext Paris'
        ]
        
        for exchange in exchanges:
            if exchange.lower() in text.lower():
                listing = ExchangeListing()
                listing.exchange_name = exchange
                
                currency_mapping = {
                    'London Stock Exchange': 'GBP',
                    'Frankfurt Stock Exchange': 'EUR',
                    'Stuttgart Stock Exchange': 'EUR',
                    'Euronext Amsterdam': 'EUR',
                    'Six Swiss Exchange': 'CHF',
                    'XETRA': 'EUR',
                    'Euronext Paris': 'EUR',
                    'gettex': 'EUR'
                }
                listing.trade_currency = currency_mapping.get(exchange, 'EUR')
                
                etf.add_exchange_listing(listing)
    
    def _extract_basic_info_robust(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrakce základních informací"""
        # Název ETF
        name_selectors = ['h1', '.etf-name', '[data-field="name"]', '.fund-name']
        
        for selector in name_selectors:
            element = soup.select_one(selector)
            if element and element.get_text().strip():
                etf.name = element.get_text().strip()
                etf.name = etf.name.replace('&amp;', '&').replace('  ', ' ')
                break
        
        if not etf.name:
            title = soup.find('title')
            if title:
                title_text = title.get_text()
                if " | " in title_text:
                    etf.name = title_text.split(" | ")[0].strip()
        
        # TER
        text = soup.get_text()
        ter_patterns = [
            r'TER[:\s]*(\d+[.,]\d+)%',
            r'Total Expense Ratio[:\s]*(\d+[.,]\d+)%',
            r'Ongoing charges[:\s]*(\d+[.,]\d+)%',
            r'Annual fee[:\s]*(\d+[.,]\d+)%',
        ]
        
        for pattern in ter_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                ter_value = match.group(1).replace(',', '.')
                etf.ter = f"{ter_value}%"
                try:
                    etf.ter_numeric = float(ter_value)
                except:
                    pass
                break
        
        # Fund size
        size_patterns = [
            r'Fund size[:\s]*(EUR|USD|GBP)\s*([\d,\.]+)\s*m',
            r'Assets under management[:\s]*(EUR|USD|GBP)\s*([\d,\.]+)\s*m',
            r'AUM[:\s]*(EUR|USD|GBP)\s*([\d,\.]+)\s*m',
            r'Net assets[:\s]*(EUR|USD|GBP)\s*([\d,\.]+)\s*million',
        ]
        
        for pattern in size_patterns:
            match = re.search(pattern, text, re.I | re.S)
            if match:
                currency = match.group(1)
                amount = match.group(2).replace(',', '')
                etf.fund_size = f"{currency} {amount}m"
                etf.fund_size_currency = currency
                try:
                    etf.fund_size_numeric = float(amount)
                except:
                    pass
                break
    
    def _extract_fund_info_robust(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrakce informací o fondu"""
        text = soup.get_text()
        
        # NOVÉ: Provider ze strukturovaných dat (priortně)
        provider_selectors = [
            'div[class*="provider"] span',
            'div[class*="issuer"] span', 
            'div[class*="company"] span',
            'span[class*="provider"]',
            'span[class*="issuer"]',
            'div.fund-company',
            'div.provider-name',
            'td:contains("Provider") + td',
            'td:contains("Issuer") + td',
            'td:contains("Company") + td'
        ]
        
        for selector in provider_selectors:
            try:
                provider_element = soup.select_one(selector)
                if provider_element and provider_element.get_text(strip=True):
                    provider_text = provider_element.get_text(strip=True)
                    if len(provider_text) > 2 and len(provider_text) < 50:
                        etf.fund_provider = provider_text
                        break
            except:
                continue
        
        # Fallback: Provider z názvu (pokud structural selector selhala)
        if not etf.fund_provider and etf.name:
            providers = ['iShares', 'Vanguard', 'Xtrackers', 'Amundi', 'HSBC', 'UBS', 'SPDR', 'Invesco', 'SSGA', 'Lyxor', '21Shares', 'AMINA', 'WisdomTree', 'VanEck', 'Franklin', 'Fidelity', 'JPMorgan', 'BNP Paribas', 'State Street']
            for provider in providers:
                if provider in etf.name:
                    etf.fund_provider = provider
                    break
        
        # Distribution policy z názvu
        if etf.name:
            name_lower = etf.name.lower()
            
            if any(pattern in name_lower for pattern in ['(acc)', 'accumulating', '(c)', ' acc']):
                etf.distribution_policy = 'Accumulating'
            elif any(pattern in name_lower for pattern in ['(dist)', 'distributing', '(d)', ' dist', ' dis']):
                etf.distribution_policy = 'Distributing'
        
        self._extract_index_name(soup, etf)
    
    def _extract_index_name(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrahuje název indexu - nejprve z webové stránky, pak z názvu ETF"""
        
        # PRIORITA 1: Scrapuj index z webové stránky (už implementováno v _extract_detailed_table_data)
        # Pokud už máme index_name z tabulek, nepřepisuj ho
        if etf.index_name and len(etf.index_name) >= 3:
            return
        
        # PRIORITA 2: Fallback - extrakce z názvu ETF
        if etf.name:
            name = etf.name.replace('UCITS ETF', '').replace('ETP', '').replace('ETF', '')
            
            index_patterns = [
                r'(S&P 500)',
                r'(MSCI World)',
                r'(STOXX® Europe 600)',
                r'(STOXX Europe 600)',
                r'(EURO STOXX 50)',
                r'(STOXX [\w\s®©™&-]+)',
                r'(FTSE [\w\s®©™&-]+)',
                r'(NASDAQ [\w\s®©™&-]+)',
                r'(Nasdaq[\s-]100)',   # Specificky pro Nasdaq-100 nebo Nasdaq 100
                r'(NASDAQ[\s-]100)',   # Specificky pro NASDAQ-100 nebo NASDAQ 100
                r'(MSCI Europe)',
                r'(MSCI Emerging Markets)',
                r'(MSCI [\w\s®©™&-]+)',
                r'(Bloomberg [\w\s®©™&-]+)',
                r'(Euro Corporate)',
                r'(Government Bond)',
                r'(Bitcoin)',
                r'(Ethereum)',
                r'(Crypto)',
            ]
            
            for pattern in index_patterns:
                match = re.search(pattern, name, re.I)
                if match:
                    index_name = match.group(1).strip()
                    if 3 <= len(index_name) <= 50:
                        etf.index_name = index_name
                        return

    def _extract_investment_focus_from_html(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extrahuje investment_focus přímo z HTML struktury JustETF.
        JustETF používá tabulky s <td>Investment focus</td><td>hodnota</td>
        """
        # Metoda 1: Hledání v tabulkách - label + hodnota v další buňce
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                for i, cell in enumerate(cells):
                    cell_text = cell.get_text(strip=True).lower()
                    if 'investment focus' in cell_text and i + 1 < len(cells):
                        value = cells[i + 1].get_text(strip=True)
                        if value and len(value) >= 3 and not value.lower().startswith('risk'):
                            # Validace - musí obsahovat smysluplná slova
                            valid_keywords = ['equity', 'bond', 'commodity', 'commodities', 'precious',
                                            'gold', 'silver', 'real estate', 'reit', 'crypto',
                                            'world', 'united states', 'europe', 'asia', 'emerging',
                                            'large cap', 'small cap', 'dividend', 'technology',
                                            'healthcare', 'energy', 'materials', 'metals']
                            if any(kw in value.lower() for kw in valid_keywords):
                                return value

        # Metoda 2: Hledání pomocí CSS selektoru pro JustETF strukturu
        # JustETF někdy používá <div class="val">hodnota</div>
        try:
            # Hledej řádek s "Investment focus"
            for td in soup.find_all('td'):
                if 'investment focus' in td.get_text(strip=True).lower():
                    # Najdi hodnotu - buď v následující buňce nebo v child elementu
                    next_td = td.find_next_sibling('td')
                    if next_td:
                        value = next_td.get_text(strip=True)
                        if value and len(value) >= 3 and not value.lower().startswith('risk'):
                            return value
                    # Nebo hodnota v div s class="val"
                    val_div = td.find_next('div', class_='val')
                    if val_div:
                        value = val_div.get_text(strip=True)
                        if value and len(value) >= 3 and not value.lower().startswith('risk'):
                            return value
        except Exception:
            pass

        # Metoda 3: Regex na celém textu - jako fallback
        text = soup.get_text()
        patterns = [
            r'Investment focus\s*[:\s]*([A-Za-z\s,\(\)/-]+?)(?:\s*Index|\s*Fund|\s*Risk|\s*Strategy|\s*Sustainability|\n)',
            r'Asset class\s*[:\s]*([A-Za-z\s,\(\)/-]+?)(?:\s*Index|\s*Fund|\s*Risk|\n)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.I)
            if match:
                value = match.group(1).strip()
                # Vyčistit a validovat
                value = re.sub(r'\s+', ' ', value).strip()
                if value and 3 <= len(value) <= 100 and not value.lower().startswith('risk'):
                    return value

        return None

    def _extract_detailed_table_data(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrahuje detailní data z tabulek + CSS selektory pro investment_focus a strategy_risk"""

        # NOVÉ: Extrakce investment_focus z HTML struktury (před regex)
        # JustETF má strukturu: <td>Investment focus</td><td>Precious Metals, Silver (EUR Hedged)</td>
        if not etf.investment_focus or etf.investment_focus.startswith('risk'):
            investment_focus_extracted = self._extract_investment_focus_from_html(soup)
            if investment_focus_extracted:
                etf.investment_focus = investment_focus_extracted

        # NOVÉ: CSS selektory pro strategy_risk (před regex)
        if not etf.strategy_risk:
            strategy_risk_selectors = [
                'td:contains("Risk") + td',
                'td:contains("SRRI") + td',
                'td:contains("Risk level") + td',
                'td:contains("Risk rating") + td',
                'span[class*="risk"]',
                'div[class*="risk"] span',
                'div[class*="srri"] span',
                '.risk-indicator',
                '.risk-level'
            ]

            for selector in strategy_risk_selectors:
                try:
                    element = soup.select_one(selector)
                    if element:
                        text_value = element.get_text(strip=True)
                        # Hledej číselnou hodnotu nebo kategorie
                        risk_match = re.search(r'(\d+(?:[/-]\d+)?|Low|Medium|High|Conservative|Moderate|Aggressive)', text_value, re.I)
                        if risk_match and len(risk_match.group(1)) <= 20:
                            etf.strategy_risk = risk_match.group(1)
                            break
                except:
                    continue

        # Původní logika
        data_tables = []
        
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) > 5:
                data_tables.append(table)
        
        data_sections = soup.find_all(['div', 'section'], class_=re.compile(r'data|info|details|basics', re.I))
        for section in data_sections:
            data_tables.append(section)
        
        if not data_tables:
            data_tables = [soup]
        
        for data_source in data_tables:
            self._extract_table_fields(data_source, etf)
    
    def _extract_table_fields(self, source: BeautifulSoup, etf: ETFDataComplete):
        """Extrahuje konkrétní pole z tabulek"""
        text = source.get_text()
        
        field_patterns = {
            'fund_currency': [
                r'Fund currency\s*([A-Z]{3})',
                r'Currency\s*([A-Z]{3})',
                r'Base currency\s*([A-Z]{3})',
            ],
            'fund_domicile': [
                r'Fund domicile\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
                r'Domicile\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
                r'Domiciled in\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
            ],
            'inception_date': [
                r'Inception[/\s]*(?:Listing\s+)?Date\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})',
                r'Launch date\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})',
            ],
            'replication': [
                r'Replication\s*(Physical[^a-zA-Z]*(?:Full replication|Sampling)?)',
                r'Replication\s*(Synthetic[^a-zA-Z]*(?:Unfunded swap|Funded swap)?)',
                r'Replication\s*(Physical|Synthetic|Sampling)',
            ],
            'legal_structure': [
                r'Legal structure\s*([A-Za-z\s,/\(\)]+?)(?:\s*Fund|$|\n)',
                r'Structure\s*([A-Za-z\s,/\(\)]+?)(?:\s*Fund|$|\n)',
                r'Legal form\s*([A-Za-z\s,/\(\)]+?)(?:\s*Fund|$|\n)',
                r'Fund structure\s*([A-Za-z\s,/\(\)]+?)(?:\s*Fund|$|\n)',
                r'(UCITS[^a-zA-Z\n]*)',
                r'(SICAV[^a-zA-Z\n]*)',
                r'(?:^|\s)(UCITS|SICAV|AIF|OEIC)(?:\s|$)',
                r'Fund type\s*([A-Za-z\s,/\(\)]+?)(?:\s*Fund|$|\n)',
                r'Investment vehicle\s*([A-Za-z\s,/\(\)]+?)(?:\s*Fund|$|\n)',
            ],
            'distribution_frequency': [
                r'Distribution frequency\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
                r'Distribution\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
                r'Dividend frequency\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
                r'Payment frequency\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
                r'Frequency\s*([A-Za-z\s]+?)(?:\s*Fund|$|\n)',
            ],
            'index_name': [
                r'Index.*?<div.*?val.*?>([^<]+)',  # HTML structure: Index ... <div class="val">Nasdaq 100®</div>
                r'Index\s*([A-Za-z0-9\s®®©™&\.-]+?)(?:\s*$|\n|[A-Z]{2}\d)',  # Text format
                r'Benchmark.*?<div.*?val.*?>([^<]+)',
                r'Benchmark\s*([A-Za-z0-9\s®®©™&\.-]+?)(?:\s*$|\n|[A-Z]{2}\d)',
                r'Underlying index.*?<div.*?val.*?>([^<]+)',
                r'Underlying index\s*([A-Za-z0-9\s®®©™&\.-]+?)(?:\s*$|\n|[A-Z]{2}\d)',
                r'Tracks\s*([A-Za-z0-9\s®®©™&\.-]+?)(?:\s*$|\n|[A-Z]{2}\d)',
                r'Replicates\s*([A-Za-z0-9\s®®©™&\.-]+?)(?:\s*$|\n|[A-Z]{2}\d)',
            ],
            'investment_focus': [
                r'Investment focus\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Focus\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Investment strategy\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Strategy\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Investment objective\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Investment approach\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Asset class\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Index focus\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
                r'Geographic focus\s*([A-Za-z\s,\./-]+?)(?:\s*Fund|$|\n)',
            ],
            'sustainability': [
                r'Sustainability\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
                r'ESG\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
                r'Social responsibility\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
                r'SRI\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
                r'Sustainable\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
            ],
            'currency_risk': [
                r'Currency risk\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
                r'Currency\s*([A-Za-z\s,]+?)(?:\s*hedged|unhedged|$|\n)',
                r'Hedging\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
                r'Exchange rate risk\s*([A-Za-z\s,]+?)(?:\s*Fund|$|\n)',
            ],
            'strategy_risk': [
                r'Strategy risk\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Risk level\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Investment risk\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Risk category\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Risk rating\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Risk profile\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'SRRI\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Risk indicator\s*([A-Za-z\s,\d]+?)(?:\s*Fund|$|\n)',
                r'Risk\s*(\d+[/-]\d+|\d+)',  # Číselné hodnocení rizika
                r'(?:Risk|SRRI).*?(\d+)',   # Obecné hledání čísla u rizika
            ],
        }
        
        for field, pattern_list in field_patterns.items():
            if hasattr(etf, field) and getattr(etf, field):
                continue
                
            for pattern in pattern_list:
                match = re.search(pattern, text, re.I | re.S)
                if match:
                    value = match.group(1).strip()
                    
                    if field == 'fund_currency' and len(value) == 3 and value.isupper():
                        etf.fund_currency = value
                        break
                    elif field == 'fund_domicile' and 3 <= len(value) <= 30:
                        value = re.sub(r'(Fund|Investment|Legal|structure)', '', value, flags=re.I).strip()
                        if value:
                            etf.fund_domicile = value
                            break
                    elif field == 'inception_date' and len(value) >= 8:
                        etf.inception_date = value
                        break
                    elif field == 'replication':
                        if 'physical' in value.lower():
                            etf.replication = 'Physical'
                        elif 'synthetic' in value.lower():
                            if 'unfunded' in value.lower():
                                etf.replication = 'Synthetic (Unfunded swap)'
                            else:
                                etf.replication = 'Synthetic'
                        else:
                            etf.replication = value.title()
                        break
                    elif field == 'legal_structure' and 3 <= len(value) <= 50:
                        value = re.sub(r'(Fund|Investment|ETF)', '', value, flags=re.I).strip()
                        if value:
                            etf.legal_structure = value
                            break
                    elif field == 'distribution_frequency' and 3 <= len(value) <= 30:
                        value = re.sub(r'(Fund|Investment)', '', value, flags=re.I).strip()
                        if value:
                            etf.distribution_frequency = value
                            break
                    elif field == 'index_name' and 3 <= len(value) <= 100:
                        # Čištění index name - zachová speciální znaky jako ®, ©, ™
                        value = re.sub(r'(Fund|Investment|ETF|UCITS|ETP)(?:\s|$)', '', value, flags=re.I).strip()
                        # Odstraň trailing data jako "ISIN:" nebo country codes
                        value = re.sub(r'\s+[A-Z]{2}\d.*$', '', value).strip()
                        if value and len(value) >= 3:
                            etf.index_name = value
                            break
                    elif field == 'investment_focus' and 3 <= len(value) <= 200:
                        value = re.sub(r'(Fund|Investment|ETF)', '', value, flags=re.I).strip()
                        # Odstraň duplicitní slova a vyčistí
                        value = re.sub(r'\b(\w+)\s+\1\b', r'\1', value, flags=re.I)
                        if value and len(value.split()) >= 1:  # Změněno z 2 na 1 slovo
                            etf.investment_focus = value
                            break
                    elif field == 'sustainability' and 3 <= len(value) <= 50:
                        value = re.sub(r'(Fund|Investment)', '', value, flags=re.I).strip()
                        if value:
                            etf.sustainability = value
                            break
                    elif field == 'currency_risk' and 3 <= len(value) <= 50:
                        # Důležité pro přesnou hedging detekci
                        value = re.sub(r'(Fund|Investment)', '', value, flags=re.I).strip()
                        if value:
                            etf.currency_risk = value
                            break
                    elif field == 'strategy_risk' and 1 <= len(value) <= 50:
                        value = re.sub(r'(Fund|Investment)', '', value, flags=re.I).strip()
                        if value:
                            etf.strategy_risk = value
                            break
    
    def _extract_total_holdings_improved(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrakce počtu holdings"""
        text = soup.get_text()
        
        out_of_patterns = [
            r'out of\s*([\d,]+)',
            r'von\s*([\d,]+)',
            r'sur\s*([\d,]+)',
        ]
        
        for pattern in out_of_patterns:
            matches = re.findall(pattern, text, re.I)
            for match in matches:
                try:
                    holdings_count = int(match.replace(',', ''))
                    if 10 <= holdings_count <= 15000:
                        etf.total_holdings = holdings_count
                        return
                except ValueError:
                    continue
        
        holdings_patterns = [
            r'(\d{1,5})\s*holdings in total',
            r'Total number of holdings[:\s]*([\d,]+)',
            r'Portfolio contains\s*([\d,]+)\s*securities',
        ]
        
        for pattern in holdings_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                try:
                    holdings_count = int(match.group(1).replace(',', ''))
                    if 10 <= holdings_count <= 15000:
                        etf.total_holdings = holdings_count
                        return
                except ValueError:
                    continue
    
    def _categorize_etf(self, etf: ETFDataComplete):
        """PŘEPRACOVANÁ kategorizace ETF - s vylepšenou detekcí ETC/komodit"""
        name_lower = (etf.name or '').lower()
        index_lower = (etf.index_name or '').lower()
        investment_focus_lower = (etf.investment_focus or '').lower()
        description_lower = (etf.description_en or '').lower()

        # 0. PÁKOVÁ ETF DETEKCE
        leveraged_keywords = ['leveraged', '2x', '3x', '4x', '5x', '10x', 'ultra', 'leverage', 'bear', 'short', 'inverse']
        # "daily" samo o sobě neznamená pákové - musí být v kombinaci s multiplikátorem
        # "daily hedged" NENÍ pákové, jen "daily leveraged" nebo "2x daily" apod.
        daily_leveraged_patterns = ['5x long', '3x long', '2x long', '5x short', '3x short', '2x short',
                                   'daily leveraged', 'daily short', 'daily inverse']
        if any(keyword in name_lower for keyword in leveraged_keywords) or any(pattern in name_lower for pattern in daily_leveraged_patterns):
            etf.is_leveraged = True

        # ===== PRIORITA 0: NÁZEV - PŘÍMÁ DETEKCE ETC/KOMODIT (nejvyšší priorita) =====
        # ETC (Exchange Traded Commodities) a fyzické komodity - detekce z názvu
        etc_commodity_patterns = [
            'physical gold', 'physical silver', 'physical platinum', 'physical palladium',
            'physical precious', 'physical metal', 'gold etc', 'silver etc', 'platinum etc',
            ' etc ', ' etc$', 'gold etp', 'silver etp', 'xetra-gold', 'euwax gold',
            'wisdomtree gold', 'wisdomtree silver', 'wisdomtree platinum', 'wisdomtree precious',
            'wisdomtree commodity', 'wisdomtree oil', 'wisdomtree energy',
            'xtrackers physical', 'invesco physical', 'ishares physical',
            'amundi physical gold', 'amundi physical silver',
            'gold bullion', 'silver bullion', 'gold spot', 'silver spot',
        ]
        if any(pattern in name_lower for pattern in etc_commodity_patterns):
            etf.category = 'Komodity'
            return

        # ===== PRIORITA 1: INVESTMENT_FOCUS (pokud je validní) =====
        # Zkontroluj, zda investment_focus obsahuje validní data (ne "risk Long-only" apod.)
        invalid_focus_patterns = ['risk', 'long-only', 'sustainability', 'leverage']
        is_valid_focus = investment_focus_lower and not any(
            pattern in investment_focus_lower for pattern in invalid_focus_patterns
        )

        if is_valid_focus:
            # 1.1 KRYPTO
            crypto_focus = ['crypto', 'cryptocurrency', 'cryptocurrencies', 'bitcoin', 'ethereum', 'solana', 'blockchain', 'digital asset']
            if any(keyword in investment_focus_lower for keyword in crypto_focus):
                etf.category = 'Krypto'
                return

            # 1.2 KOMODITY (před dluhopisy!)
            commodity_focus = ['commodity', 'commodities', 'gold', 'silver', 'platinum', 'palladium',
                             'oil', 'energy', 'precious metal', 'precious metals', 'metals',
                             'agriculture', 'natural gas', 'copper', 'aluminium', 'wheat', 'corn']
            if any(keyword in investment_focus_lower for keyword in commodity_focus):
                etf.category = 'Komodity'
                return

            # 1.3 NEMOVITOSTI
            reit_focus = ['reit', 'real estate', 'property', 'immobilien', 'real estate investment']
            if any(keyword in investment_focus_lower for keyword in reit_focus):
                etf.category = 'Nemovitosti'
                return

            # 1.4 DLUHOPISY
            bond_focus = ['bond', 'bonds', 'fixed income', 'treasury', 'government bond', 'corporate bond', 'gilt', 'aggregate']
            if any(keyword in investment_focus_lower for keyword in bond_focus):
                etf.category = 'Dluhopisy'
                return

            # 1.5 AKCIE
            equity_focus = ['equity', 'equities', 'stock', 'stocks', 'shares']
            if any(keyword in investment_focus_lower for keyword in equity_focus):
                etf.category = 'Akcie'
                return

        # ===== PRIORITA 2: NÁZEV A POPIS (fallback) =====
        all_text = f"{name_lower} {description_lower} {index_lower}"

        # 2.1 KRYPTO
        crypto_keywords = ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'solana', 'blockchain', 'digital asset']
        if any(keyword in all_text for keyword in crypto_keywords):
            etf.category = 'Krypto'
            return

        # 2.2 KOMODITY (před dluhopisy! - důležité pro ETC s "debt obligation" v popisu)
        commodity_keywords = ['commodity', 'commodities', 'gold', 'silver', 'platinum', 'palladium',
                            'oil', 'crude', 'energy commodit', 'precious metal', 'precious metals',
                            'metals basket', 'agriculture', 'natural gas', 'copper', 'aluminium']
        if any(keyword in all_text for keyword in commodity_keywords):
            etf.category = 'Komodity'
            return

        # 2.3 NEMOVITOSTI
        reit_keywords = ['reit', 'real estate', 'property']
        if any(keyword in all_text for keyword in reit_keywords):
            etf.category = 'Nemovitosti'
            return

        # 2.4 DLUHOPISY (vyloučit "collateralised debt obligation" které se používá u ETC)
        # Kontrola, zda "debt" není součástí "collateralised debt obligation"
        has_bond_keyword = False
        bond_keywords = ['bond', 'treasury', 'government bond', 'corporate bond', 'fixed income', 'gilt']
        if any(keyword in all_text for keyword in bond_keywords):
            has_bond_keyword = True
        # Speciální kontrola pro "debt" - vyloučit ETC popis
        if 'debt' in all_text and 'collateralised debt obligation' not in all_text:
            has_bond_keyword = True
        if has_bond_keyword:
            etf.category = 'Dluhopisy'
            return

        # 2.5 AKCIE
        equity_keywords = ['equity', 'stock', 'shares']
        if any(keyword in all_text for keyword in equity_keywords):
            etf.category = 'Akcie'
            return

        # ===== PRIORITA 3: FALLBACK NA AKCIE =====
        etf.category = 'Akcie'
    
    def _extract_performance_robust(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """OPRAVENÁ extrakce performance dat - používá tabulkovou strukturu"""
        
        # Najdi performance tabulku
        perf_table = None
        tables = soup.find_all('table', class_='table etf-data-table')
        
        for table in tables:
            text = table.get_text()
            if '1 month' in text and '3 months' in text and 'YTD' in text:
                perf_table = table
                break
        
        if not perf_table:
            safe_log("warning", f"Performance tabulka nenalezena pro {etf.isin}")
            return
        
        # Extrakce pomocí tabulkové struktury
        rows = perf_table.find_all('tr')
        for row in rows:
            label_cell = row.find('td', class_='vallabel')
            value_cell = row.find('td', class_=['val', 'val green', 'val red'])
            
            if label_cell and value_cell:
                label = label_cell.get_text(strip=True).lower()
                value_text = value_cell.get_text(strip=True)
                
                # Extraktuj číslo z hodnoty
                value_match = re.search(r'([+-]?\d+[.,]\d+)', value_text)
                if value_match:
                    try:
                        value = float(value_match.group(1).replace(',', '.'))
                        
                        # Mapování labelů na pole
                        if '1 month' in label:
                            etf.return_1m = value
                        elif '3 months' in label:
                            etf.return_3m = value
                        elif '6 months' in label:
                            etf.return_6m = value
                        elif label == '2021':
                            etf.return_2021 = value
                        elif label == '2022':
                            etf.return_2022 = value
                        elif label == '2023':
                            etf.return_2023 = value
                        elif label == '2024':
                            etf.return_2024 = value
                        elif label == '2025':
                            etf.return_2025 = value
                        elif 'since inception' in label or label == 'max':
                            etf.return_inception = value
                        elif label == 'ytd':
                            etf.return_ytd = value
                        elif '1 year' in label:
                            etf.return_1y = value
                        elif '3 years' in label:
                            etf.return_3y = value  
                        elif '5 years' in label:
                            etf.return_5y = value
                            
                    except ValueError:
                        continue
    
    def _extract_comprehensive_risk_metrics_improved(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrakce risk metrik"""
        text = soup.get_text()
        
        # Advanced risk metrics patterns
        advanced_risk_patterns = {
            'tracking_error': [
                r'Tracking\s+error[:\s]*(\d+[.,]\d+)%',
                r'TE[:\s]*(\d+[.,]\d+)%',
                r'Tracking\s+difference[:\s]*(\d+[.,]\d+)%',
                r'Annual\s+tracking\s+error[:\s]*(\d+[.,]\d+)%',
                r'Tracking\s+error\s+\(annual\)[:\s]*(\d+[.,]\d+)%',
                r'Tracking\s+error\s+p\.a\.[:\s]*(\d+[.,]\d+)%',
                r'Tracking\s+error\s+\(per\s+annum\)[:\s]*(\d+[.,]\d+)%',
                r'Annual\s+TE[:\s]*(\d+[.,]\d+)%',
                # Enhanced patterns for table structure
                r'<td[^>]*>\s*Tracking\s+error\s*</td>\s*<td[^>]*>\s*(\d+[.,]\d+)%\s*</td>',
                r'>Tracking error</td>\s*<td[^>]*>(\d+[.,]\d+)%',
                r'vallabel[^>]*>Tracking error[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)%',
                # German patterns
                r'Tracking\s*-?\s*Fehler[:\s]*(\d+[.,]\d+)%'
            ],
            'beta': [
                r'Beta[:\s]*(\d+[.,]\d+)',
                r'Beta\s+coefficient[:\s]*(\d+[.,]\d+)',
                r'Beta\s+factor[:\s]*(\d+[.,]\d+)',
                r'Market\s+beta[:\s]*(\d+[.,]\d+)',
                r'β[:\s]*(\d+[.,]\d+)',
                # Table patterns
                r'<td[^>]*>\s*Beta\s*</td>\s*<td[^>]*>\s*(\d+[.,]\d+)\s*</td>',
                r'>Beta</td>\s*<td[^>]*>(\d+[.,]\d+)',
                r'vallabel[^>]*>Beta[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)',
                # Additional variations
                r'Beta\s+\(3\s+year\)[:\s]*(\d+[.,]\d+)',
                r'Beta\s+3Y[:\s]*(\d+[.,]\d+)',
                r'Beta\s+\(vs\.\s+benchmark\)[:\s]*(\d+[.,]\d+)'
            ],
            'correlation': [
                r'Correlation[:\s]*(\d+[.,]\d+)',
                r'Correlation\s+coefficient[:\s]*(\d+[.,]\d+)',
                r'R-squared[:\s]*(\d+[.,]\d+)',
                r'R²[:\s]*(\d+[.,]\d+)',
                r'Correlation\s+to\s+benchmark[:\s]*(\d+[.,]\d+)',
                r'Correlation\s+\(3\s+year\)[:\s]*(\d+[.,]\d+)',
                # Table patterns
                r'<td[^>]*>\s*Correlation\s*</td>\s*<td[^>]*>\s*(\d+[.,]\d+)\s*</td>',
                r'>Correlation</td>\s*<td[^>]*>(\d+[.,]\d+)',
                r'vallabel[^>]*>Correlation[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)',
                # Additional variations
                r'Correl\.[:\s]*(\d+[.,]\d+)',
                r'Correlation\s+3Y[:\s]*(\d+[.,]\d+)',
                # German patterns
                r'Korrelation[:\s]*(\d+[.,]\d+)'
            ],
            'information_ratio': [
                r'Information\s+ratio[:\s]*(-?\d+[.,]\d+)',
                r'IR[:\s]*(-?\d+[.,]\d+)',
                r'Info\s+ratio[:\s]*(-?\d+[.,]\d+)',
                r'Information\s+coefficient[:\s]*(-?\d+[.,]\d+)',
                r'Appraisal\s+ratio[:\s]*(-?\d+[.,]\d+)',
                # Table patterns
                r'<td[^>]*>\s*Information\s+ratio\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)\s*</td>',
                r'>Information ratio</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'vallabel[^>]*>Information ratio[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                # Additional variations
                r'Information\s+ratio\s+\(3\s+year\)[:\s]*(-?\d+[.,]\d+)',
                r'IR\s+3Y[:\s]*(-?\d+[.,]\d+)',
                # German patterns
                r'Informationsquotient[:\s]*(-?\d+[.,]\d+)'
            ]
        }
        
        # Extract advanced risk metrics - ENHANCED CSS approach
        # Try CSS selectors first (more reliable)
        css_risk_selectors = {
            'tracking_error': [
                'td:contains("Tracking error") + td',
                'td:contains("TE") + td', 
                'span[class*="tracking"]',
                'div[class*="tracking"] span',
                'td:contains("Tracking difference") + td'
            ],
            'information_ratio': [
                'td:contains("Information ratio") + td',
                'td:contains("IR") + td',
                'span[class*="information"]',
                'div[class*="info-ratio"] span'
            ],
            'beta': [
                'td:contains("Beta") + td',
                'span[class*="beta"]',
                'div[class*="beta"] span'
            ]
        }
        
        for metric, selectors in css_risk_selectors.items():
            for selector in selectors:
                try:
                    element = soup.select_one(selector)
                    if element:
                        text_value = element.get_text(strip=True)
                        # Extract numeric value
                        numeric_match = re.search(r'(-?\d+[.,]\d+)', text_value)
                        if numeric_match:
                            value = float(numeric_match.group(1).replace(',', '.'))
                            
                            # Apply validation ranges
                            if metric == 'tracking_error' and 0.01 <= value <= 5.0:
                                etf.tracking_error = value
                                break
                            elif metric == 'beta' and 0.1 <= value <= 3.0:
                                etf.beta = value
                                break
                            elif metric == 'information_ratio' and -2.0 <= value <= 2.0:
                                etf.information_ratio = value
                                break
                except:
                    continue
        
        # Fallback to regex patterns
        for metric, pattern_list in advanced_risk_patterns.items():
            # Skip if already found via CSS
            current_value = getattr(etf, metric, None)
            if current_value is not None:
                continue
                
            for pattern in pattern_list:
                match = re.search(pattern, text, re.I | re.S)
                if match:
                    try:
                        value = float(match.group(1).replace(',', '.'))
                        
                        # Apply sensible validation ranges for each metric
                        if metric == 'tracking_error' and 0.01 <= value <= 5.0:
                            etf.tracking_error = value
                            break
                        elif metric == 'beta' and 0.1 <= value <= 3.0:
                            etf.beta = value
                            break
                        elif metric == 'correlation' and 0.5 <= value <= 1.0:
                            etf.correlation = value
                            break
                        elif metric == 'information_ratio' and -2.0 <= value <= 2.0:
                            etf.information_ratio = value
                            break
                    except ValueError:
                        continue
        
        risk_patterns = {
            'volatility_1y': [
                r'Volatility\s+1\s+year[:\s]*(\d+[.,]\d+)%',
                r'>Volatility 1 year</td>\s*<td[^>]*>(\d+[.,]\d+)%',
                r'vallabel[^>]*>Volatility 1 year[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)%'
            ],
            'volatility_3y': [
                r'Volatility\s+3\s+years?[:\s]*(\d+[.,]\d+)%',
                r'>Volatility 3 years?</td>\s*<td[^>]*>(\d+[.,]\d+)%',
                r'vallabel[^>]*>Volatility 3 year[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)%'
            ],
            'volatility_5y': [
                r'Volatility\s+5\s+years?[:\s]*(\d+[.,]\d+)%',
                r'>Volatility 5 years?</td>\s*<td[^>]*>(\d+[.,]\d+)%',
                r'vallabel[^>]*>Volatility 5 year[^<]*</td>\s*<td[^>]*>(\d+[.,]\d+)%'
            ],
            'max_drawdown_1y': [
                r'Maximum\s+drawdown\s+1\s+year[:\s]*(-?\d+[.,]\d+)%',
                r'>Maximum drawdown 1 year</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'vallabel[^>]*>Maximum drawdown 1 year[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'Max\.\s*drawdown\s+1\s+year[:\s]*(-?\d+[.,]\d+)%',
                r'>Max drawdown 1 year</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'>Maximum drawdown 1y</td>\s*<td[^>]*>(-?\d+[.,]\d+)%'
            ],
            'max_drawdown_3y': [
                r'Maximum\s+drawdown\s+3\s+years?[:\s]*(-?\d+[.,]\d+)%',
                r'>Maximum drawdown 3 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'vallabel[^>]*>Maximum drawdown 3 year[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'Max\.\s*drawdown\s+3\s+years?[:\s]*(-?\d+[.,]\d+)%',
                r'>Max drawdown 3 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'>Maximum drawdown 3y</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                # Enhanced patterns for table structure with possible whitespace/newlines
                r'<td[^>]*>\s*Maximum\s+drawdown\s+3\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                r'<td[^>]*>\s*Max\s+drawdown\s+3\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                # Pattern for potential German text
                r'Maximaler\s+Drawdown\s+3\s+Jahre[:\s]*(-?\d+[.,]\d+)%'
            ],
            'max_drawdown_5y': [
                r'Maximum\s+drawdown\s+5\s+years?[:\s]*(-?\d+[.,]\d+)%',
                r'>Maximum drawdown 5 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'vallabel[^>]*>Maximum drawdown 5 year[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'Max\.\s*drawdown\s+5\s+years?[:\s]*(-?\d+[.,]\d+)%',
                r'>Max drawdown 5 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'>Maximum drawdown 5y</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                # Enhanced patterns for table structure with possible whitespace/newlines
                r'<td[^>]*>\s*Maximum\s+drawdown\s+5\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                r'<td[^>]*>\s*Max\s+drawdown\s+5\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                # Pattern for potential German text
                r'Maximaler\s+Drawdown\s+5\s+Jahre[:\s]*(-?\d+[.,]\d+)%'
            ],
            'max_drawdown_inception': [
                r'Maximum\s+drawdown\s+since\s+inception[:\s]*(-?\d+[.,]\d+)%',
                r'Max\s+drawdown\s+inception[:\s]*(-?\d+[.,]\d+)%',
                r'Maximum\s+drawdown\s+from\s+inception[:\s]*(-?\d+[.,]\d+)%',
                r'Max\s+drawdown\s+since\s+launch[:\s]*(-?\d+[.,]\d+)%',
                r'Maximum\s+drawdown\s+launch[:\s]*(-?\d+[.,]\d+)%',
                # Enhanced patterns for table structures
                r'>Maximum drawdown since inception</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'>Max drawdown inception</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'<td[^>]*>\s*Maximum\s+drawdown\s+since\s+inception\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                r'<td[^>]*>\s*Max\s+drawdown\s+inception\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                r'<td[^>]*>\s*Maximum\s+drawdown\s+from\s+launch\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                # German patterns
                r'Maximaler\s+Drawdown\s+seit\s+Auflage[:\s]*(-?\d+[.,]\d+)%',
                r'Max\.\s*Drawdown\s+seit\s+Auflage[:\s]*(-?\d+[.,]\d+)%',
                # Table patterns
                r'>Maximum drawdown since inception</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'>Max drawdown inception</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                r'vallabel[^>]*>Maximum drawdown since inception[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)%',
                # Enhanced patterns for table structure with whitespace/newlines
                r'<td[^>]*>\s*Maximum\s+drawdown\s+since\s+inception\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                r'<td[^>]*>\s*Max\s+drawdown\s+inception\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)%\s*</td>',
                # German patterns
                r'Maximaler\s+Drawdown\s+seit\s+Auflage[:\s]*(-?\d+[.,]\d+)%',
                # Alternative inception terminology
                r'Maximum\s+drawdown\s+since\s+start[:\s]*(-?\d+[.,]\d+)%',
                r'Max\s+drawdown\s+total[:\s]*(-?\d+[.,]\d+)%'
            ],
            'return_per_risk_1y': [
                r'Return\s+per\s+risk\s+1\s+year[:\s]*(-?\d+[.,]\d+)',
                r'Return\s*per\s*risk\s*1\s*year[:\s]*(-?\d+[.,]\d+)',
                r'>Return per risk 1 year</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'vallabel[^>]*>Return per risk 1 year[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'Sharpe\s+ratio\s+1\s+year[:\s]*(-?\d+[.,]\d+)',
                r'>Sharpe ratio 1 year</td>\s*<td[^>]*>(-?\d+[.,]\d+)'
            ],
            'return_per_risk_3y': [
                r'Return\s+per\s+risk\s+3\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Sharpe\s+ratio\s+3\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Risk\s+adjusted\s+return\s+3\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Return\/Risk\s+3\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Return\s*per\s*risk\s*3\s*years?[:\s]*(-?\d+[.,]\d+)',
                r'Return\s*per\s*risk\s*3\s*years?\s*</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'>Return per risk 3 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'>Return per risk 3 year</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'vallabel[^>]*>Return per risk 3 year[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                # Enhanced patterns for table structure with whitespace/newlines
                r'<td[^>]*>\s*Return\s+per\s+risk\s+3\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)\s*</td>',
                r'<td[^>]*>\s*Sharpe\s+ratio\s+3\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)\s*</td>',
                # Additional patterns for different formats
                r'>Sharpe ratio 3 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'>Risk adj\. return 3 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)'
            ],
            'return_per_risk_5y': [
                r'Return\s+per\s+risk\s+5\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Sharpe\s+ratio\s+5\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Risk\s+adjusted\s+return\s+5\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Return\/Risk\s+5\s+years?[:\s]*(-?\d+[.,]\d+)',
                r'Return\s*per\s*risk\s*5\s*years?[:\s]*(-?\d+[.,]\d+)',
                r'Return\s*per\s*risk\s*5\s*years?\s*</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'>Return per risk 5 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'>Return per risk 5 year</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'vallabel[^>]*>Return per risk 5 year[^<]*</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                # Enhanced patterns for table structure with whitespace/newlines
                r'<td[^>]*>\s*Return\s+per\s+risk\s+5\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)\s*</td>',
                r'<td[^>]*>\s*Sharpe\s+ratio\s+5\s+years?\s*</td>\s*<td[^>]*>\s*(-?\d+[.,]\d+)\s*</td>',
                # Additional patterns for different formats
                r'>Sharpe ratio 5 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)',
                r'>Risk adj\. return 5 years?</td>\s*<td[^>]*>(-?\d+[.,]\d+)'
            ]
        }
        
        for metric, pattern_list in risk_patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text, re.I | re.S)
                if match:
                    try:
                        value = float(match.group(1).replace(',', '.'))
                        if self._validate_risk_value(metric, value):
                            setattr(etf, metric, value)
                            break
                    except:
                        continue
    
    def _validate_risk_value(self, metric: str, value: float) -> bool:
        """Validace risk hodnot"""
        if metric.startswith('volatility'):
            return 0 <= value <= 200
        elif metric.startswith('return_per_risk'):
            return -5 <= value <= 10
        elif metric.startswith('max_drawdown'):
            return -100 <= value <= 0
        elif metric == 'tracking_error':
            return 0.01 <= value <= 5.0
        return True
    
    def _extract_description_improved(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Extrakce popisu s překlady"""
        description_text = ""
        
        # Metoda 1: Hledej sekci "Description"
        description_section = soup.find('section', {'id': 'description'}) or \
                            soup.find('div', {'class': re.compile(r'description', re.I)})
        
        if description_section:
            description_text = description_section.get_text().strip()
        
        # Metoda 2: Hledej podle nadpisu "Description"
        if not description_text:
            description_headings = soup.find_all(['h1', 'h2', 'h3', 'h4'], 
                                                string=re.compile(r'Description', re.I))
            
            for heading in description_headings:
                next_element = heading.find_next_sibling()
                if next_element:
                    description_text = next_element.get_text().strip()
                    break
        
        # Metoda 3: Fallback
        if not description_text:
            all_paragraphs = soup.find_all('p')
            for p in all_paragraphs:
                text = p.get_text().strip()
                if (len(text) > 200 and 
                    any(keyword in text.lower() for keyword in ['etf', 'etp', 'fund', 'track', 'index', 'seeks'])):
                    description_text = text
                    break
        
        # Čištění textu
        if description_text:
            # Odstranění UI artefaktů "Show more/Show less" ve všech variantách
            description_text = re.sub(r'Show more\s*Show less', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'Ukázat více\s*show méně', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'Show more\s*show méně', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'Ukázat více\s*Show less', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'Show more', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'Show less', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'Ukázat více', '', description_text, flags=re.IGNORECASE)
            description_text = re.sub(r'show méně', '', description_text, flags=re.IGNORECASE)
            
            # Standardní čištění bílých znaků
            description_text = re.sub(r'\s+', ' ', description_text)
            description_text = description_text.replace('\n', ' ').replace('\r', ' ')
            description_text = description_text.strip()
            
            if len(description_text) > 2000:
                description_text = description_text[:2000] + "..."
            
            etf.description_en = description_text
            
            # PŘEKLAD
            if self.translator and description_text and TRANSLATE_DESCRIPTIONS:
                try:
                    time.sleep(1)
                    etf.description_cs = self._improve_czech_translation(description_text)
                except Exception as e:
                    safe_log("warning", f"WARNING: Translation failed: {e}")
                    etf.description_cs = "[Překlad se nezdařil]"
            else:
                etf.description_cs = "[Překlad vypnutý]" if not TRANSLATE_DESCRIPTIONS else "[Překladač nedostupný]"
    
    def _improve_czech_translation(self, english_text: str) -> str:
        """Vylepšuje český překlad s finančním slovníkem"""
        if not english_text or not self.translator:
            return english_text
        
        try:
            czech_text = self.translator.translate(english_text)
            
            # Pooprav s finančním slovníkem
            for en_term, cs_term in FINANCIAL_TERMS.items():
                pattern = re.compile(re.escape(en_term), re.IGNORECASE)
                czech_text = pattern.sub(cs_term, czech_text)
            
            # Odstranění UI artefaktů "Show more/Show less" z překladu
            czech_text = re.sub(r'Show more\s*Show less', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'Ukázat více\s*show méně', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'Show more\s*show méně', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'Ukázat více\s*Show less', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'Show more', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'Show less', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'Ukázat více', '', czech_text, flags=re.IGNORECASE)
            czech_text = re.sub(r'show méně', '', czech_text, flags=re.IGNORECASE)
            
            # Specifické opravy
            czech_text = czech_text.replace('zásob', 'akcií')
            czech_text = czech_text.replace('byt v', 'se sídlem v')
            czech_text = czech_text.replace('p.a.ETF', 'p.a. ETF')
            
            # Finální čištění bílých znaků
            czech_text = re.sub(r'\s+', ' ', czech_text).strip()
            
            return czech_text
            
        except Exception as e:
            safe_log("warning", f"WARNING: Translation improvement failed: {e}")
            return english_text
    
    def _extract_holdings_enhanced(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Holdings extrakce pro akcie i dluhopisy"""
        if etf.is_synthetic():
            return
        
        holdings = []
        
        # Enhanced holdings section finding
        holdings_section = soup.find('section', id='holdings') or \
                         soup.find('div', class_=re.compile('holdings', re.I)) or \
                         soup.find('section', id='composition') or \
                         soup.find('div', class_=re.compile('composition', re.I)) or \
                         soup.find('section', id='portfolio') or \
                         soup.find('div', class_=re.compile('portfolio', re.I))
        
        # Alternative method: Find by heading text
        if not holdings_section:
            headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'], 
                                   string=re.compile(r'(Holdings|Composition|Portfolio|Top positions|Largest holdings)', re.I))
            for heading in headings:
                parent = heading.find_parent(['section', 'div', 'article'])
                if parent:
                    table = parent.find('table')
                    if table:
                        holdings_section = parent
                        break
        
        if holdings_section:
            table = holdings_section.find('table')
            if table:
                rows = table.find_all('tr')[1:]  # Skip header
                for row in rows[:10]:
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        # Enhanced name extraction - clean up HTML artifacts
                        name_cell = cells[0]
                        name = name_cell.get_text().strip()
                        
                        # Clean up name - remove HTML line breaks and extra whitespace
                        name = re.sub(r'\s+', ' ', name)
                        name = name.replace('\n', ' ').replace('\r', ' ').strip()
                        
                        # Try multiple cells for weight - sometimes it's not in the second column
                        weight = None
                        for cell in cells[1:4]:  # Check up to 3 cells for weight
                            weight_text = cell.get_text()
                            weight_matches = [
                                re.search(r'(\d+[.,]\d+)%', weight_text),
                                re.search(r'(\d+[.,]\d+)\s*%', weight_text),
                                re.search(r'(\d+[.,]\d+)', weight_text) if '%' in weight_text else None
                            ]
                            
                            for weight_match in weight_matches:
                                if weight_match:
                                    try:
                                        weight = float(weight_match.group(1).replace(',', '.'))
                                        break
                                    except ValueError:
                                        continue
                            if weight is not None:
                                break
                        
                        if weight is not None and name and len(name) > 1:
                            # Enhanced validation for different ETF types
                            if etf.category == 'Dluhopisy':
                                if self._is_bond_code(name) and 0.05 <= weight <= 50:
                                    holdings.append((name, weight))
                            elif etf.category == 'Komodity':
                                if 0.05 <= weight <= 100:  # Commodities can have high concentration
                                    holdings.append((name, weight))
                            else:  # Stocks and others
                                if len(name) > 2 and not self._is_bond_code(name) and 0.05 <= weight <= 30:
                                    holdings.append((name, weight))
        
        # Fallback pro akciové ETF
        if not holdings and etf.category == 'Akcie':
            text = soup.get_text()
            companies = [
                'Apple', 'Microsoft', 'Amazon', 'Nvidia', 'Meta', 'Alphabet', 'Tesla',
                'Berkshire Hathaway', 'UnitedHealth', 'Johnson & Johnson', 'JPMorgan',
                'Visa', 'Procter & Gamble', 'Mastercard', 'Home Depot', 'Coca-Cola'
            ]
            
            for company in companies:
                patterns = [
                    rf'{re.escape(company)}\s*(\d+[.,]\d+)%',
                    rf'{re.escape(company)}[^\d]*(\d+[.,]\d+)%'
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.I)
                    if match:
                        weight = float(match.group(1).replace(',', '.'))
                        if 0.5 <= weight <= 15:
                            holdings.append((company, weight))
                        break
        
        holdings.sort(key=lambda x: x[1], reverse=True)
        etf.holdings = holdings[:10]
    
    def _is_bond_code(self, name: str) -> bool:
        """Detekuje, zda je název kódem dluhopisu"""
        if not name or len(name) < 6:
            return False
        
        bond_patterns = [
            r'^[A-Z]{2}\d{10,12}$',  # BE6285455497
            r'^XS\d{10}$',           # XS1001749289
            r'^[A-Z]{2}\d{8,12}$',   # Obecný format
            r'^US\d{9}[A-Z]\d{2}$',  # US treasury format
        ]
        
        return any(re.match(pattern, name.upper()) for pattern in bond_patterns)
    
    def _extract_geographic_enhanced(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Geografické rozložení pro fyzické ETF"""
        if etf.is_synthetic():
            return
        
        countries = []
        text = soup.get_text()
        
        country_list = [
            'United States', 'USA', 'Germany', 'Japan', 'United Kingdom', 'UK',
            'France', 'China', 'Canada', 'Switzerland', 'Netherlands', 'Australia',
            'Other', 'Others', 'Bulgaria', 'Croatia', 'Czech Republic', 'Greece',
            'Hungary', 'Poland', 'Romania', 'Slovakia', 'Slovenia'
        ]
        
        for country in country_list:
            patterns = [
                rf'{re.escape(country)}\s*(\d+[.,]\d+)%',
                rf'{re.escape(country)}[^\d]*(\d+[.,]\d+)%'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, text, re.I)
                if match:
                    weight = float(match.group(1).replace(',', '.'))
                    if 0.5 <= weight <= 100:
                        countries.append((country, weight))
                    break
        
        countries.sort(key=lambda x: x[1], reverse=True)
        etf.countries = countries[:5]
    
    def _extract_sectors_enhanced(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Sektorové rozložení pro fyzické ETF"""
        if etf.is_synthetic():
            return
        
        sectors = []
        text = soup.get_text()
        
        sector_list = [
            'Technology', 'Information Technology', 'IT',
            'Financials', 'Financial Services', 'Health Care', 'Healthcare',
            'Consumer Discretionary', 'Consumer Staples', 'Industrials',
            'Energy', 'Materials', 'Real Estate', 'Utilities',
            'Communication Services', 'Telecommunications'
        ]
        
        for sector in sector_list:
            patterns = [
                rf'{re.escape(sector)}\s*(\d+[.,]\d+)%',
                rf'{re.escape(sector)}[^\d]*(\d+[.,]\d+)%'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, text, re.I)
                if match:
                    weight = float(match.group(1).replace(',', '.'))
                    if 1 <= weight <= 50:
                        sectors.append((sector, weight))
                    break
        
        sectors.sort(key=lambda x: x[1], reverse=True)
        etf.sectors = sectors[:5]

    def _find_exchange_section_improved(self, soup: BeautifulSoup):
        """Najde exchange sekci pomocí různých strategií"""
        
        # Strategie 1: Hledej nadpisy obsahující exchange/listing/trading
        exchange_keywords = [
            'stock exchange', 'exchanges', 'listing', 'listings', 
            'trading', 'where to buy', 'available on', 'traded on'
        ]
        
        for keyword in exchange_keywords:
            # Hledej nadpisy
            headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'], 
                                    string=re.compile(rf'{keyword}', re.I))
            
            for heading in headings:
                # Najdi parent sekci
                section = heading.find_parent(['section', 'div', 'article'])
                if section and section.find('table'):
                    return section
                
                # Nebo najdi následující sekci s tabulkou
                next_sibling = heading.find_next_sibling()
                while next_sibling:
                    if next_sibling.name in ['section', 'div'] and next_sibling.find('table'):
                        return next_sibling
                    next_sibling = next_sibling.find_next_sibling()
        
        # Strategie 2: Hledej tabulky s exchange sloupci
        tables = soup.find_all('table')
        for table in tables:
            headers = table.find_all(['th', 'td'])
            header_text = ' '.join([h.get_text().lower() for h in headers[:5]])  # První 5 buněk
            
            if any(keyword in header_text for keyword in ['exchange', 'listing', 'ticker', 'symbol']):
                return table.find_parent(['section', 'div']) or table
        
        # Strategie 3: Hledej podle CSS class/id
        exchange_containers = soup.find_all(['div', 'section'], 
                                          attrs={'class': re.compile(r'exchange|listing|trading', re.I)})
        for container in exchange_containers:
            if container.find('table'):
                return container
        
        return None

    def _parse_exchange_table_improved(self, section: BeautifulSoup, etf: ETFDataComplete):
        """VYLEPŠENÉ parsování tabulky s exchange daty"""
        table = section if section.name == 'table' else section.find('table')
        
        if not table:
            return
        
        rows = table.find_all('tr')
        if len(rows) < 2:  # Musí mít alespoň header + 1 data row
            return
        
        # Identifikuj sloupce
        header_row = rows[0]
        headers = [th.get_text().strip().lower() for th in header_row.find_all(['th', 'td'])]
        
        
        # OPRAVENO: Manuální mapování podle pozice, protože header text je vždy stejný
        # Headers: ['listing', 'trade currency', 'ticker', 'bloomberg / inav bloomberg code', 'reuters ric / inav reuters', 'market maker']
        col_mapping = {}
        
        # Based on observed header pattern from JustETF
        if len(headers) >= 6:
            col_mapping = {
                'exchange': 0,    # 'listing'
                'currency': 1,    # 'trade currency' 
                'ticker': 2,      # 'ticker' - OPRAVENO: index 2, ne 3!
                'bloomberg': 3,   # 'bloomberg / inav bloomberg code'
                'reuters': 4,     # 'reuters ric / inav reuters'
                'market_maker': 5 # 'market maker'
            }
        else:
            # Fallback - dynamic mapping
            for i, header in enumerate(headers):
                if any(keyword in header for keyword in ['ticker', 'symbol', 'code']) and 'trading' not in header:
                    col_mapping['ticker'] = i
                elif any(keyword in header for keyword in ['listing', 'exchange']) and 'market' not in header:
                    col_mapping['exchange'] = i
                elif any(keyword in header for keyword in ['currency', 'curr']) and 'trade' in header:
                    col_mapping['currency'] = i
                elif any(keyword in header for keyword in ['bloomberg', 'bbg']) and ('inav' in header or '/' in header):
                    col_mapping['bloomberg'] = i
                elif any(keyword in header for keyword in ['reuters', 'ric']) and ('inav' in header or '/' in header):
                    col_mapping['reuters'] = i
                elif any(keyword in header for keyword in ['market maker', 'maker']):
                    col_mapping['market_maker'] = i
        
        
        # Parsuj data řádky
        for row_idx, row in enumerate(rows[1:], 1):
            cells = row.find_all(['td', 'th'])
            if len(cells) < 2:
                continue
            
            listing = ExchangeListing()
            
            # OPRAVENO: Exchange je vždy v prvním sloupci (listing)
            if len(cells) > 0:
                exchange_text = cells[0].get_text().strip()
                # Vyčistí exchange název - odstraní zbytečné znaky
                exchange_clean = re.sub(r'\s+', ' ', exchange_text).strip()
                if exchange_clean and len(exchange_clean) > 3:  # Minimální délka pro exchange
                    listing.exchange_name = exchange_clean
            
            # Currency je ve druhém sloupci
            if 'currency' in col_mapping and col_mapping['currency'] < len(cells):
                listing.trade_currency = cells[col_mapping['currency']].get_text().strip()
            
            # OPRAVENO: Ticker je ve třetím sloupci (index 2)
            if 'ticker' in col_mapping and col_mapping['ticker'] < len(cells):
                ticker_text = cells[col_mapping['ticker']].get_text().strip()
                # Čištění ticker textu - zachová pouze alfanumerické znaky
                ticker_clean = re.sub(r'[^A-Z0-9]', '', ticker_text.upper())
                if ticker_clean and len(ticker_clean) >= 2 and ticker_clean not in ['-', '--', 'N/A', '']:
                    # Přijmeme jakýkoliv rozumný ticker bez přísné validace
                    if re.match(r'^[A-Z0-9]{2,8}$', ticker_clean):
                        listing.ticker = ticker_clean
            
            # Bloomberg kód
            if 'bloomberg' in col_mapping and col_mapping['bloomberg'] < len(cells):
                bloomberg_raw = cells[col_mapping['bloomberg']].get_text().strip()
                # Extrahuj pouze Bloomberg část před /
                if bloomberg_raw and bloomberg_raw not in ['--', '-', 'N/A', '']:
                    bloomberg_parts = bloomberg_raw.split('/')
                    if bloomberg_parts[0].strip():
                        listing.bloomberg_code = bloomberg_parts[0].strip()
            
            # Reuters kód  
            if 'reuters' in col_mapping and col_mapping['reuters'] < len(cells):
                reuters_raw = cells[col_mapping['reuters']].get_text().strip()
                # Extrahuj pouze Reuters část za /
                if reuters_raw and reuters_raw not in ['--', '-', 'N/A', '']:
                    reuters_parts = reuters_raw.split('/')
                    if len(reuters_parts) > 1 and reuters_parts[1].strip():
                        listing.reuters_code = reuters_parts[1].strip()
                    elif len(reuters_parts) == 1 and reuters_parts[0].strip():
                        listing.reuters_code = reuters_parts[0].strip()
            
            # Validace a přidání - přidej i když nemá ticker (může být užitečné pro fallback)
            if listing.exchange_name and len(listing.exchange_name) > 3:
                etf.add_exchange_listing(listing)
                ticker_info = listing.ticker if listing.ticker else "No ticker"

    def _extract_ticker_from_full_text(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """Fallback extrakce ticker z celého textu pomocí regex"""
        text = soup.get_text()
        
        # Regex patterns pro ticker hledání
        ticker_patterns = [
            # Pattern 1: "Ticker: XXXX" nebo "Symbol: XXXX"
            r'(?:ticker|symbol|trading symbol)[:\s]+([A-Z0-9]{2,8})',
            
            # Pattern 2: V závorkách za názvem ETF
            r'\(([A-Z0-9]{2,8})\)',
            
            # Pattern 3: "Available as XXXX on..."
            r'(?:available as|traded as)[:\s]+([A-Z0-9]{2,8})',
            
            # Pattern 4: "XXXX shares" (pro akciové ETF)
            r'([A-Z0-9]{2,8})\s+shares',
            
            # Pattern 5: "Quote XXXX"
            r'quote[:\s]+([A-Z0-9]{2,8})',
            
            # Pattern 6: "ISIN: XXX, Ticker: XXXX"
            rf'{re.escape(etf.isin)}[^a-zA-Z0-9]*(?:ticker|symbol)[:\s]*([A-Z0-9]{{2,8}})'
        ]
        
        for i, pattern in enumerate(ticker_patterns, 1):
            matches = re.findall(pattern, text, re.I)
            for match in matches:
                ticker_candidate = match.upper().strip()
                
                # Validace ticker kandidáta
                if self._is_valid_ticker(ticker_candidate, etf):
                    if not etf.primary_ticker:
                        etf.primary_ticker = ticker_candidate
                        etf.primary_exchange = f"Extracted (method {i})"
                        return

    def _is_valid_ticker(self, ticker: str, etf) -> bool:
        """Validuje, zda je ticker kandidát platný"""
        if not ticker or len(ticker) < 2 or len(ticker) > 8:
            return False
        
        # Vyloučí ISIN (12 znaků)
        if len(ticker) == 12:
            return False
        
        # Vyloučí common false positives
        false_positives = {
            # Měny
            'EUR', 'USD', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
            'JPY', 'AUD', 'CAD', 'NZD', 'SGD', 'HKD', 'CNY', 'INR', 'BRL', 'MXN',
            'GBX', 'USX', 'EUX',  # Currency codes variants
            
            # ETF/Fund related
            'ETF', 'UCITS', 'ACC', 'DIST', 'DIV', 'FUND', 'INDEX', 'MSCI', 'FTSE',
            'ETC', 'ETN', 'ETP', 'SICAV', 'OEIC', 'UNIT', 'SHARE', 'SHARES',
            
            # Market/Exchange related
            'NYSE', 'LSE', 'FSE', 'XETRA', 'NASDAQ', 'AMEX',
            
            # Common words  
            'THE', 'AND', 'FOR', 'WITH', 'FROM', 'INTO', 'UPON', 'OVER',
            'UNDER', 'ABOVE', 'BELOW', 'BETWEEN', 'AMONG', 'THROUGH',
            'OF', 'TO', 'IN', 'ON', 'AT', 'BY', 'AS', 'IS', 'ARE', 'BE',
            
            # Technical/Web related
            'HTML', 'HTTP', 'HTTPS', 'WWW', 'PDF', 'CSV', 'JSON', 'XML',
            'API', 'URL', 'URI', 'CSS', 'JS',
            
            # Platform specific
            'GETTEX', 'XETRA', 'TRADEGATE', 'LANG', 'SWISS',
            'AMSTERDAM', 'FRANKFURT', 'LONDON', 'MILAN', 'PARIS',
            'STUTTGART', 'EURONEXT', 'NYSE', 'NASDAQ',
            
            # Technical/Finance terms
            'AUM', 'TER', 'NAV', 'ISIN', 'WKN', 'CUSIP', 'SEDOL',
            'RIC', 'BLOOMBERG', 'REUTERS', 'MARKET', 'STOCK',
            'BOND', 'EQUITY', 'FIXED', 'INCOME', 'YIELD',
        }
        
        if ticker in false_positives:
            return False
        
        # Ticker by měl obsahovat alespoň jedno písmeno
        if not re.search(r'[A-Z]', ticker):
            return False
        
        return True
    
    def _is_obviously_invalid_ticker(self, ticker: str) -> bool:
        """Méně přísná validace - vyloučí pouze zjevně špatné tickery"""
        if not ticker or len(ticker) < 2 or len(ticker) > 8:
            return True
        
        # Vyloučí pouze zjevně neplatné tickery
        obviously_invalid = {
            # Měny
            'EUR', 'USD', 'GBP', 'CHF', 'GBX', 'USX', 'EUX',
            # ETF/Fund related základní
            'ETF', 'UCITS', 'ACC', 'DIST', 'FUND', 'INDEX',
            'ETC', 'ETN', 'ETP',
            # Burzy
            'NYSE', 'LSE', 'FSE', 'NASDAQ', 'AMEX',
            # Technické
            'HTML', 'HTTP', 'HTTPS', 'WWW', 'PDF', 'CSV', 'JSON',
            # Města/země
            'LONDON', 'FRANKFURT', 'STUTTGART', 'AMSTERDAM', 'MILAN', 'PARIS',
            # Časté chyby
            'ISIN', 'WKN', 'CUSIP', 'SEDOL', 'MARKET', 'STOCK'
        }
        
        return ticker in obviously_invalid
    
    def _is_preferred_ticker(self, new_ticker: str, current_ticker: str) -> bool:
        """Určuje, zda je nový ticker preferovanější než současný"""
        if not new_ticker or not current_ticker:
            return bool(new_ticker)  # Preferuj neprázdný ticker
        
        # Známé populární tickery (preferuj tyto)
        popular_tickers = {
            'CSPX', 'VWCE', 'IWDA', 'VUAA', 'SWDA', 'VEVE',  # Core ETFs
            'EIMI', 'VFEM', 'XMME',  # Emerging markets
            'VHYL', 'UDVD', 'WDIV',  # Dividend ETFs
            'INRG', 'IUSN'  # Sector ETFs
        }
        
        # Pokud nový ticker je populární a současný ne, preferuj nový
        if new_ticker in popular_tickers and current_ticker not in popular_tickers:
            return True
        
        # Pokud současný ticker je populární a nový ne, zůstaň u současného
        if current_ticker in popular_tickers and new_ticker not in popular_tickers:
            return False
        
        # Pokud oba jsou populární nebo oba nejsou, preferuj kratší ticker
        if len(new_ticker) < len(current_ticker):
            return True
        
        # Při stejné délce, preferuj alfabeticky první
        if len(new_ticker) == len(current_ticker):
            return new_ticker < current_ticker
        
        return False

    def _extract_exchange_from_text_improved(self, soup: BeautifulSoup, etf: ETFDataComplete):
        """VYLEPŠENÁ fallback extrakce exchange dat z textu"""
        text = soup.get_text()
        
        # Rozšířený seznam burz s jejich typickými tickery
        exchange_info = {
            'London Stock Exchange': {'currency': 'GBP', 'aliases': ['LSE', 'London']},
            'Frankfurt Stock Exchange': {'currency': 'EUR', 'aliases': ['Frankfurt', 'FSE']},
            'Stuttgart Stock Exchange': {'currency': 'EUR', 'aliases': ['Stuttgart']},
            'Euronext Amsterdam': {'currency': 'EUR', 'aliases': ['Amsterdam', 'Euronext']},
            'Six Swiss Exchange': {'currency': 'CHF', 'aliases': ['Swiss', 'SIX']},
            'XETRA': {'currency': 'EUR', 'aliases': ['Xetra']},
            'Borsa Italiana': {'currency': 'EUR', 'aliases': ['Milan', 'Milano']},
            'gettex': {'currency': 'EUR', 'aliases': ['Gettex']},
            'Tradegate': {'currency': 'EUR', 'aliases': ['Tradegate']},
            'NYSE': {'currency': 'USD', 'aliases': ['New York']},
            'NASDAQ': {'currency': 'USD', 'aliases': ['Nasdaq']},
            'Euronext Paris': {'currency': 'EUR', 'aliases': ['Paris']}
        }
        
        found_exchanges = []
        
        for exchange, info in exchange_info.items():
            # Hledej exchange + možné ticker patterns
            exchange_patterns = [exchange] + info['aliases']
            
            for pattern in exchange_patterns:
                if pattern.lower() in text.lower():
                    listing = ExchangeListing()
                    listing.exchange_name = exchange
                    listing.trade_currency = info['currency']
                    
                    # Pokus se najít ticker poblíž názvu burzy
                    exchange_context = self._extract_context_around_exchange(text, pattern)
                    ticker_candidate = self._find_ticker_in_context(exchange_context)
                    
                    if ticker_candidate:
                        listing.ticker = ticker_candidate
                    
                    found_exchanges.append(listing)
                    break
        
        # Přidej nalezené exchanges
        for listing in found_exchanges:
            etf.add_exchange_listing(listing)

    def _extract_context_around_exchange(self, text: str, exchange_name: str) -> str:
        """Extrahuje kontext kolem názvu burzy (±100 znaků)"""
        pattern = re.compile(re.escape(exchange_name), re.I)
        match = pattern.search(text)
        
        if match:
            start = max(0, match.start() - 100)
            end = min(len(text), match.end() + 100)
            return text[start:end]
        
        return ""

    def _find_ticker_in_context(self, context: str) -> str:
        """Najde ticker v kontextu kolem burzy"""
        # Hledej pattern "TICKER on EXCHANGE" nebo "EXCHANGE: TICKER"
        ticker_patterns = [
            r'([A-Z0-9]{2,8})\s+(?:on|at)\s+',  # "VWCE on London"
            r':\s*([A-Z0-9]{2,8})',              # "London: VWCE"
            r'\(([A-Z0-9]{2,8})\)',              # "(VWCE)"
            r'([A-Z0-9]{2,8})\s*-\s*',           # "VWCE - "
        ]
        
        for pattern in ticker_patterns:
            matches = re.findall(pattern, context, re.I)
            for match in matches:
                ticker = match.upper().strip()
                if self._is_valid_ticker(ticker, None):
                    return ticker
        
        return None

    def safe_numeric(self, value):
        """Convert empty strings to None for numeric fields with proper type handling"""
        if value == "" or value is None:
            return None
        try:
            if isinstance(value, (int, float)):
                return value
            if isinstance(value, str):
                # Try to convert to float first, then int if it's a whole number
                float_val = float(value)
                if float_val.is_integer():
                    return int(float_val)
                return float_val
            return None
        except (ValueError, TypeError):
            return None
    
    def safe_integer(self, value):
        """Convert values to integers with proper type handling"""
        if value == "" or value is None:
            return None
        try:
            if isinstance(value, int):
                return value
            if isinstance(value, (float, str)):
                return int(float(value))
            return None
        except (ValueError, TypeError):
            return None

    def transform_etf_for_database(self, etf: ETFDataComplete) -> Dict:
        """Transformuje ETF data do formátu pro databázi s optimalizovaným datovým typem"""
        # Použij built-in to_dict() metodu která správně transformuje exchange_listings
        etf_dict = etf.to_dict()
        
        return {
            'isin': etf.isin,
            'name': etf.name,
            'url': etf.url,
            'description_en': etf.description_en,
            'description_cs': etf.description_cs,
            'ter': etf.ter,
            'ter_numeric': self.safe_numeric(etf.ter_numeric),
            'fund_size': etf.fund_size,
            'fund_size_numeric': self.safe_numeric(etf.fund_size_numeric),
            'fund_size_currency': etf.fund_size_currency,
            'fund_currency': etf.fund_currency,
            'fund_domicile': etf.fund_domicile,
            'fund_provider': etf.fund_provider,
            'inception_date': etf.inception_date,
            'distribution_policy': etf.distribution_policy,
            'distribution_frequency': etf.distribution_frequency,
            'replication': etf.replication,
            'legal_structure': etf.legal_structure,
            'index_name': etf.index_name,
            'investment_focus': etf.investment_focus,
            'sustainability': etf.sustainability,
            'currency_risk': etf.currency_risk,
            'strategy_risk': etf.strategy_risk,
            'category': etf.category,
            'is_leveraged': etf.is_leveraged,
            'region': etf.region,
            'total_holdings': self.safe_integer(etf.total_holdings),
            # Performance - krátká období
            'return_1m': self.safe_numeric(etf.return_1m),
            'return_3m': self.safe_numeric(etf.return_3m),
            'return_6m': self.safe_numeric(etf.return_6m),
            'return_ytd': self.safe_numeric(etf.return_ytd),
            'return_1y': self.safe_numeric(etf.return_1y),
            'return_3y': self.safe_numeric(etf.return_3y),
            'return_5y': self.safe_numeric(etf.return_5y),
            # Performance - roční výnosy
            'return_2021': self.safe_numeric(etf.return_2021),
            'return_2022': self.safe_numeric(etf.return_2022),
            'return_2023': self.safe_numeric(etf.return_2023),
            'return_2024': self.safe_numeric(etf.return_2024),
            'return_2025': self.safe_numeric(etf.return_2025),
            # Performance - inception
            'return_inception': self.safe_numeric(etf.return_inception),
            'performance_last_updated': etf.performance_last_updated,
            'volatility_1y': self.safe_numeric(etf.volatility_1y),
            'volatility_3y': self.safe_numeric(etf.volatility_3y),
            'volatility_5y': self.safe_numeric(etf.volatility_5y),
            'return_per_risk_1y': self.safe_numeric(etf.return_per_risk_1y),
            'return_per_risk_3y': self.safe_numeric(etf.return_per_risk_3y),
            'return_per_risk_5y': self.safe_numeric(etf.return_per_risk_5y),
            'max_drawdown_1y': self.safe_numeric(etf.max_drawdown_1y),
            'max_drawdown_3y': self.safe_numeric(etf.max_drawdown_3y),
            'max_drawdown_5y': self.safe_numeric(etf.max_drawdown_5y),
            'max_drawdown_inception': self.safe_numeric(etf.max_drawdown_inception),
            'beta': self.safe_numeric(etf.beta),
            'correlation': self.safe_numeric(etf.correlation),
            'tracking_error': self.safe_numeric(etf.tracking_error),
            'information_ratio': self.safe_numeric(etf.information_ratio),
            'primary_exchange': etf_dict.get('exchange_1_name', etf.primary_exchange),
            'primary_ticker': etf_dict.get('exchange_1_ticker', etf.primary_ticker),
            'total_exchanges': self.safe_integer(etf.total_exchanges),
            # Dividend fields
            'current_dividend_yield': etf.current_dividend_yield,
            'current_dividend_yield_numeric': self.safe_numeric(etf.current_dividend_yield_numeric),
            'dividends_12m': etf.dividends_12m,
            'dividends_12m_numeric': self.safe_numeric(etf.dividends_12m_numeric),
            'dividends_12m_currency': etf.dividends_12m_currency,
            
            # Metadata
            'scraping_date': etf.scraping_date,
            'scraping_status': etf.scraping_status,
            'retry_count': self.safe_integer(etf.retry_count),
            
            # Rating fields (the key addition!)
            'rating': self.safe_integer(etf_dict.get('rating')),
            'rating_score': self.safe_integer(etf_dict.get('rating_score')),
            'rating_ter_score': self.safe_integer(etf_dict.get('rating_ter_score')),
            'rating_size_score': self.safe_integer(etf_dict.get('rating_size_score')),
            'rating_track_record_score': self.safe_integer(etf_dict.get('rating_track_record_score')),
            'rating_provider_score': self.safe_integer(etf_dict.get('rating_provider_score')),
            'rating_performance_score': self.safe_integer(etf_dict.get('rating_performance_score')),
            # Holdings - použij to_dict() transformaci
            'holding_1_name': etf_dict.get('holding_1_name', ''),
            'holding_1_weight': etf_dict.get('holding_1_weight', 0) or 0,
            'holding_2_name': etf_dict.get('holding_2_name', ''),
            'holding_2_weight': etf_dict.get('holding_2_weight', 0) or 0,
            'holding_3_name': etf_dict.get('holding_3_name', ''),
            'holding_3_weight': etf_dict.get('holding_3_weight', 0) or 0,
            'holding_4_name': etf_dict.get('holding_4_name', ''),
            'holding_4_weight': etf_dict.get('holding_4_weight', 0) or 0,
            'holding_5_name': etf_dict.get('holding_5_name', ''),
            'holding_5_weight': etf_dict.get('holding_5_weight', 0) or 0,
            'holding_6_name': etf_dict.get('holding_6_name', ''),
            'holding_6_weight': etf_dict.get('holding_6_weight', 0) or 0,
            'holding_7_name': etf_dict.get('holding_7_name', ''),
            'holding_7_weight': etf_dict.get('holding_7_weight', 0) or 0,
            'holding_8_name': etf_dict.get('holding_8_name', ''),
            'holding_8_weight': etf_dict.get('holding_8_weight', 0) or 0,
            'holding_9_name': etf_dict.get('holding_9_name', ''),
            'holding_9_weight': etf_dict.get('holding_9_weight', 0) or 0,
            'holding_10_name': etf_dict.get('holding_10_name', ''),
            'holding_10_weight': etf_dict.get('holding_10_weight', 0) or 0,
            # Countries - použij to_dict() transformaci  
            'country_1_name': etf_dict.get('country_1_name', ''),
            'country_1_weight': etf_dict.get('country_1_weight', 0) or 0,
            'country_2_name': etf_dict.get('country_2_name', ''),
            'country_2_weight': etf_dict.get('country_2_weight', 0) or 0,
            'country_3_name': etf_dict.get('country_3_name', ''),
            'country_3_weight': etf_dict.get('country_3_weight', 0) or 0,
            'country_4_name': etf_dict.get('country_4_name', ''),
            'country_4_weight': etf_dict.get('country_4_weight', 0) or 0,
            'country_5_name': etf_dict.get('country_5_name', ''),
            'country_5_weight': etf_dict.get('country_5_weight', 0) or 0,
            # Sectors - použij to_dict() transformaci
            'sector_1_name': etf_dict.get('sector_1_name', ''),
            'sector_1_weight': etf_dict.get('sector_1_weight', 0) or 0,
            'sector_2_name': etf_dict.get('sector_2_name', ''),
            'sector_2_weight': etf_dict.get('sector_2_weight', 0) or 0,
            'sector_3_name': etf_dict.get('sector_3_name', ''),
            'sector_3_weight': etf_dict.get('sector_3_weight', 0) or 0,
            'sector_4_name': etf_dict.get('sector_4_name', ''),
            'sector_4_weight': etf_dict.get('sector_4_weight', 0) or 0,
            'sector_5_name': etf_dict.get('sector_5_name', ''),
            'sector_5_weight': etf_dict.get('sector_5_weight', 0) or 0,
            # Exchanges - použij to_dict() transformaci (KLÍČOVÁ OPRAVA!)
            'exchange_1_name': etf_dict.get('exchange_1_name', ''),
            'exchange_1_currency': etf_dict.get('exchange_1_currency', ''),
            'exchange_1_ticker': etf_dict.get('exchange_1_ticker', ''),
            'exchange_1_bloomberg': etf_dict.get('exchange_1_bloomberg', ''),
            'exchange_1_reuters': etf_dict.get('exchange_1_reuters', ''),
            'exchange_1_market_maker': etf_dict.get('exchange_1_market_maker', ''),
            'exchange_2_name': etf_dict.get('exchange_2_name', ''),
            'exchange_2_currency': etf_dict.get('exchange_2_currency', ''),
            'exchange_2_ticker': etf_dict.get('exchange_2_ticker', ''),
            'exchange_2_bloomberg': etf_dict.get('exchange_2_bloomberg', ''),
            'exchange_2_reuters': etf_dict.get('exchange_2_reuters', ''),
            'exchange_2_market_maker': etf_dict.get('exchange_2_market_maker', ''),
            'exchange_3_name': etf_dict.get('exchange_3_name', ''),
            'exchange_3_currency': etf_dict.get('exchange_3_currency', ''),
            'exchange_3_ticker': etf_dict.get('exchange_3_ticker', ''),
            'exchange_3_bloomberg': etf_dict.get('exchange_3_bloomberg', ''),
            'exchange_3_reuters': etf_dict.get('exchange_3_reuters', ''),
            'exchange_3_market_maker': etf_dict.get('exchange_3_market_maker', ''),
            'exchange_4_name': etf_dict.get('exchange_4_name', ''),
            'exchange_4_currency': etf_dict.get('exchange_4_currency', ''),
            'exchange_4_ticker': etf_dict.get('exchange_4_ticker', ''),
            'exchange_4_bloomberg': etf_dict.get('exchange_4_bloomberg', ''),
            'exchange_4_reuters': etf_dict.get('exchange_4_reuters', ''),
            'exchange_4_market_maker': etf_dict.get('exchange_4_market_maker', ''),
            'exchange_5_name': etf_dict.get('exchange_5_name', ''),
            'exchange_5_currency': etf_dict.get('exchange_5_currency', ''),
            'exchange_5_ticker': etf_dict.get('exchange_5_ticker', ''),
            'exchange_5_bloomberg': etf_dict.get('exchange_5_bloomberg', ''),
            'exchange_5_reuters': etf_dict.get('exchange_5_reuters', ''),
            'exchange_5_market_maker': etf_dict.get('exchange_5_market_maker', ''),
            # NOVÁ POLE exchanges 6-10
            'exchange_6_name': etf_dict.get('exchange_6_name', ''),
            'exchange_6_currency': etf_dict.get('exchange_6_currency', ''),
            'exchange_6_ticker': etf_dict.get('exchange_6_ticker', ''),
            'exchange_6_bloomberg': etf_dict.get('exchange_6_bloomberg', ''),
            'exchange_6_reuters': etf_dict.get('exchange_6_reuters', ''),
            'exchange_6_market_maker': etf_dict.get('exchange_6_market_maker', ''),
            'exchange_7_name': etf_dict.get('exchange_7_name', ''),
            'exchange_7_currency': etf_dict.get('exchange_7_currency', ''),
            'exchange_7_ticker': etf_dict.get('exchange_7_ticker', ''),
            'exchange_7_bloomberg': etf_dict.get('exchange_7_bloomberg', ''),
            'exchange_7_reuters': etf_dict.get('exchange_7_reuters', ''),
            'exchange_7_market_maker': etf_dict.get('exchange_7_market_maker', ''),
            'exchange_8_name': etf_dict.get('exchange_8_name', ''),
            'exchange_8_currency': etf_dict.get('exchange_8_currency', ''),
            'exchange_8_ticker': etf_dict.get('exchange_8_ticker', ''),
            'exchange_8_bloomberg': etf_dict.get('exchange_8_bloomberg', ''),
            'exchange_8_reuters': etf_dict.get('exchange_8_reuters', ''),
            'exchange_8_market_maker': etf_dict.get('exchange_8_market_maker', ''),
            'exchange_9_name': etf_dict.get('exchange_9_name', ''),
            'exchange_9_currency': etf_dict.get('exchange_9_currency', ''),
            'exchange_9_ticker': etf_dict.get('exchange_9_ticker', ''),
            'exchange_9_bloomberg': etf_dict.get('exchange_9_bloomberg', ''),
            'exchange_9_reuters': etf_dict.get('exchange_9_reuters', ''),
            'exchange_9_market_maker': etf_dict.get('exchange_9_market_maker', ''),
            'exchange_10_name': etf_dict.get('exchange_10_name', ''),
            'exchange_10_currency': etf_dict.get('exchange_10_currency', ''),
            'exchange_10_ticker': etf_dict.get('exchange_10_ticker', ''),
            'exchange_10_bloomberg': etf_dict.get('exchange_10_bloomberg', ''),
            'exchange_10_reuters': etf_dict.get('exchange_10_reuters', ''),
            'exchange_10_market_maker': etf_dict.get('exchange_10_market_maker', ''),
            
            # Currency Performance - CZK
            'return_1m_czk': self.safe_numeric(etf_dict.get('return_1m_czk')),
            'return_3m_czk': self.safe_numeric(etf_dict.get('return_3m_czk')),
            'return_6m_czk': self.safe_numeric(etf_dict.get('return_6m_czk')),
            'return_ytd_czk': self.safe_numeric(etf_dict.get('return_ytd_czk')),
            'return_1y_czk': self.safe_numeric(etf_dict.get('return_1y_czk')),
            'return_3y_czk': self.safe_numeric(etf_dict.get('return_3y_czk')),
            'return_5y_czk': self.safe_numeric(etf_dict.get('return_5y_czk')),
            'return_2021_czk': self.safe_numeric(etf_dict.get('return_2021_czk')),
            'return_2022_czk': self.safe_numeric(etf_dict.get('return_2022_czk')),
            'return_2023_czk': self.safe_numeric(etf_dict.get('return_2023_czk')),
            'return_2024_czk': self.safe_numeric(etf_dict.get('return_2024_czk')),
            'return_2025_czk': self.safe_numeric(etf_dict.get('return_2025_czk')),

            # Currency Performance - USD
            'return_1m_usd': self.safe_numeric(etf_dict.get('return_1m_usd')),
            'return_3m_usd': self.safe_numeric(etf_dict.get('return_3m_usd')),
            'return_6m_usd': self.safe_numeric(etf_dict.get('return_6m_usd')),
            'return_ytd_usd': self.safe_numeric(etf_dict.get('return_ytd_usd')),
            'return_1y_usd': self.safe_numeric(etf_dict.get('return_1y_usd')),
            'return_3y_usd': self.safe_numeric(etf_dict.get('return_3y_usd')),
            'return_5y_usd': self.safe_numeric(etf_dict.get('return_5y_usd')),
            'return_2021_usd': self.safe_numeric(etf_dict.get('return_2021_usd')),
            'return_2022_usd': self.safe_numeric(etf_dict.get('return_2022_usd')),
            'return_2023_usd': self.safe_numeric(etf_dict.get('return_2023_usd')),
            'return_2024_usd': self.safe_numeric(etf_dict.get('return_2024_usd')),
            'return_2025_usd': self.safe_numeric(etf_dict.get('return_2025_usd')),

            # Currency Metadata
            'currency_performance_updated_at': etf_dict.get('currency_performance_updated_at'),
        }

    def transform_etf_for_database_no_rating(self, etf: ETFDataComplete):
        """Transformuje ETF data pro databázi BEZ rating polí"""
        etf_dict = etf.to_dict()
        # Stejná logika jako transform_etf_for_database ale bez rating polí
        return {
            'isin': etf_dict.get('isin', ''),
            'name': etf_dict.get('name', ''),
            'url': etf_dict.get('url', ''),
            'description_en': etf_dict.get('description_en', ''),
            'description_cs': etf_dict.get('description_cs', ''),
            'ter': etf_dict.get('ter', ''),
            'ter_numeric': etf_dict.get('ter_numeric', 0) or 0,
            'fund_size': etf_dict.get('fund_size', ''),
            'fund_size_numeric': etf_dict.get('fund_size_numeric', 0) or 0,
            'fund_size_currency': etf_dict.get('fund_size_currency', ''),
            'fund_currency': etf_dict.get('fund_currency', ''),
            'fund_domicile': etf_dict.get('fund_domicile', ''),
            'fund_provider': etf_dict.get('fund_provider', ''),
            'inception_date': etf_dict.get('inception_date', ''),
            'distribution_policy': etf_dict.get('distribution_policy', ''),
            'distribution_frequency': etf_dict.get('distribution_frequency', ''),
            'replication': etf_dict.get('replication', ''),
            'legal_structure': etf_dict.get('legal_structure', ''),
            'index_name': etf_dict.get('index_name', ''),
            'investment_focus': etf_dict.get('investment_focus', ''),
            'sustainability': etf_dict.get('sustainability', ''),
            'category': etf_dict.get('category', ''),
            'is_leveraged': etf_dict.get('is_leveraged', False),
            'region': etf_dict.get('region', ''),
            'total_holdings': etf_dict.get('total_holdings', 0) or 0,
            # Performance - krátká období
            'return_1m': etf_dict.get('return_1m', 0) or 0,
            'return_3m': etf_dict.get('return_3m', 0) or 0,
            'return_6m': etf_dict.get('return_6m', 0) or 0,
            'return_ytd': etf_dict.get('return_ytd', 0) or 0,
            'return_1y': etf_dict.get('return_1y', 0) or 0,
            'return_3y': etf_dict.get('return_3y', 0) or 0,
            'return_5y': etf_dict.get('return_5y', 0) or 0,
            # Performance - roční výnosy
            'return_2021': etf_dict.get('return_2021', 0) or 0,
            'return_2022': etf_dict.get('return_2022', 0) or 0,
            'return_2023': etf_dict.get('return_2023', 0) or 0,
            'return_2024': etf_dict.get('return_2024', 0) or 0,
            # Performance - inception
            'return_inception': etf_dict.get('return_inception', 0) or 0,
            'performance_last_updated': etf_dict.get('performance_last_updated') or None,
            
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
            
            # Metadata
            'currency_performance_updated_at': etf_dict.get('currency_performance_updated_at') or None,
            
            'volatility_1y': etf_dict.get('volatility_1y', 0) or 0,
            'volatility_3y': etf_dict.get('volatility_3y', 0) or 0,
            'volatility_5y': etf_dict.get('volatility_5y', 0) or 0,
            'return_per_risk_1y': etf_dict.get('return_per_risk_1y', 0) or 0,
            'return_per_risk_3y': etf_dict.get('return_per_risk_3y', 0) or 0,
            'return_per_risk_5y': etf_dict.get('return_per_risk_5y', 0) or 0,
            'max_drawdown_1y': etf_dict.get('max_drawdown_1y', 0) or 0,
            'max_drawdown_3y': etf_dict.get('max_drawdown_3y', 0) or 0,
            'max_drawdown_5y': etf_dict.get('max_drawdown_5y', 0) or 0,
            'max_drawdown_inception': etf_dict.get('max_drawdown_inception', 0) or 0,
            'beta': etf_dict.get('beta', 0) or 0,
            'correlation': etf_dict.get('correlation', 0) or 0,
            'tracking_error': etf_dict.get('tracking_error', 0) or 0,
            'information_ratio': etf_dict.get('information_ratio', 0) or 0,
            'primary_exchange': etf_dict.get('primary_exchange', ''),
            'primary_ticker': etf_dict.get('primary_ticker', ''),
            'total_exchanges': etf_dict.get('total_exchanges', 0) or 0,
            'current_dividend_yield': etf_dict.get('current_dividend_yield', ''),
            'current_dividend_yield_numeric': etf_dict.get('current_dividend_yield_numeric', 0) or 0,
            'dividends_12m': etf_dict.get('dividends_12m', ''),
            'dividends_12m_numeric': etf_dict.get('dividends_12m_numeric', 0) or 0,
            'dividends_12m_currency': etf_dict.get('dividends_12m_currency', ''),
            'dividend_extraction_method': etf_dict.get('dividend_extraction_method', ''),
            'scraping_date': datetime.now().isoformat(),
            'scraping_status': 'success',
            'retry_count': 0,
            'degiro_free': etf_dict.get('degiro_free', False),
            # Holdings
            'holding_1_name': etf_dict.get('holding_1_name', ''),
            'holding_1_weight': etf_dict.get('holding_1_weight', 0) or 0,
            'holding_2_name': etf_dict.get('holding_2_name', ''),
            'holding_2_weight': etf_dict.get('holding_2_weight', 0) or 0,
            'holding_3_name': etf_dict.get('holding_3_name', ''),
            'holding_3_weight': etf_dict.get('holding_3_weight', 0) or 0,
            'holding_4_name': etf_dict.get('holding_4_name', ''),
            'holding_4_weight': etf_dict.get('holding_4_weight', 0) or 0,
            'holding_5_name': etf_dict.get('holding_5_name', ''),
            'holding_5_weight': etf_dict.get('holding_5_weight', 0) or 0,
            'holding_6_name': etf_dict.get('holding_6_name', ''),
            'holding_6_weight': etf_dict.get('holding_6_weight', 0) or 0,
            'holding_7_name': etf_dict.get('holding_7_name', ''),
            'holding_7_weight': etf_dict.get('holding_7_weight', 0) or 0,
            'holding_8_name': etf_dict.get('holding_8_name', ''),
            'holding_8_weight': etf_dict.get('holding_8_weight', 0) or 0,
            'holding_9_name': etf_dict.get('holding_9_name', ''),
            'holding_9_weight': etf_dict.get('holding_9_weight', 0) or 0,
            'holding_10_name': etf_dict.get('holding_10_name', ''),
            'holding_10_weight': etf_dict.get('holding_10_weight', 0) or 0,
            # Countries  
            'country_1_name': etf_dict.get('country_1_name', ''),
            'country_1_weight': etf_dict.get('country_1_weight', 0) or 0,
            'country_2_name': etf_dict.get('country_2_name', ''),
            'country_2_weight': etf_dict.get('country_2_weight', 0) or 0,
            'country_3_name': etf_dict.get('country_3_name', ''),
            'country_3_weight': etf_dict.get('country_3_weight', 0) or 0,
            'country_4_name': etf_dict.get('country_4_name', ''),
            'country_4_weight': etf_dict.get('country_4_weight', 0) or 0,
            'country_5_name': etf_dict.get('country_5_name', ''),
            'country_5_weight': etf_dict.get('country_5_weight', 0) or 0,
            # Sectors
            'sector_1_name': etf_dict.get('sector_1_name', ''),
            'sector_1_weight': etf_dict.get('sector_1_weight', 0) or 0,
            'sector_2_name': etf_dict.get('sector_2_name', ''),
            'sector_2_weight': etf_dict.get('sector_2_weight', 0) or 0,
            'sector_3_name': etf_dict.get('sector_3_name', ''),
            'sector_3_weight': etf_dict.get('sector_3_weight', 0) or 0,
            'sector_4_name': etf_dict.get('sector_4_name', ''),
            'sector_4_weight': etf_dict.get('sector_4_weight', 0) or 0,
            'sector_5_name': etf_dict.get('sector_5_name', ''),
            'sector_5_weight': etf_dict.get('sector_5_weight', 0) or 0,
            # Exchanges
            'exchange_1_name': etf_dict.get('exchange_1_name', ''),
            'exchange_1_currency': etf_dict.get('exchange_1_currency', ''),
            'exchange_1_ticker': etf_dict.get('exchange_1_ticker', ''),
            'exchange_1_bloomberg': etf_dict.get('exchange_1_bloomberg', ''),
            'exchange_1_reuters': etf_dict.get('exchange_1_reuters', ''),
            'exchange_1_market_maker': etf_dict.get('exchange_1_market_maker', ''),
            'exchange_2_name': etf_dict.get('exchange_2_name', ''),
            'exchange_2_currency': etf_dict.get('exchange_2_currency', ''),
            'exchange_2_ticker': etf_dict.get('exchange_2_ticker', ''),
            'exchange_2_bloomberg': etf_dict.get('exchange_2_bloomberg', ''),
            'exchange_2_reuters': etf_dict.get('exchange_2_reuters', ''),
            'exchange_2_market_maker': etf_dict.get('exchange_2_market_maker', ''),
            'exchange_3_name': etf_dict.get('exchange_3_name', ''),
            'exchange_3_currency': etf_dict.get('exchange_3_currency', ''),
            'exchange_3_ticker': etf_dict.get('exchange_3_ticker', ''),
            'exchange_3_bloomberg': etf_dict.get('exchange_3_bloomberg', ''),
            'exchange_3_reuters': etf_dict.get('exchange_3_reuters', ''),
            'exchange_3_market_maker': etf_dict.get('exchange_3_market_maker', ''),
            'exchange_4_name': etf_dict.get('exchange_4_name', ''),
            'exchange_4_currency': etf_dict.get('exchange_4_currency', ''),
            'exchange_4_ticker': etf_dict.get('exchange_4_ticker', ''),
            'exchange_4_bloomberg': etf_dict.get('exchange_4_bloomberg', ''),
            'exchange_4_reuters': etf_dict.get('exchange_4_reuters', ''),
            'exchange_4_market_maker': etf_dict.get('exchange_4_market_maker', ''),
            'exchange_5_name': etf_dict.get('exchange_5_name', ''),
            'exchange_5_currency': etf_dict.get('exchange_5_currency', ''),
            'exchange_5_ticker': etf_dict.get('exchange_5_ticker', ''),
            'exchange_5_bloomberg': etf_dict.get('exchange_5_bloomberg', ''),
            'exchange_5_reuters': etf_dict.get('exchange_5_reuters', ''),
            'exchange_5_market_maker': etf_dict.get('exchange_5_market_maker', ''),
            # NOVÁ POLE exchanges 6-10 (no_rating version)
            'exchange_6_name': etf_dict.get('exchange_6_name', ''),
            'exchange_6_currency': etf_dict.get('exchange_6_currency', ''),
            'exchange_6_ticker': etf_dict.get('exchange_6_ticker', ''),
            'exchange_6_bloomberg': etf_dict.get('exchange_6_bloomberg', ''),
            'exchange_6_reuters': etf_dict.get('exchange_6_reuters', ''),
            'exchange_6_market_maker': etf_dict.get('exchange_6_market_maker', ''),
            'exchange_7_name': etf_dict.get('exchange_7_name', ''),
            'exchange_7_currency': etf_dict.get('exchange_7_currency', ''),
            'exchange_7_ticker': etf_dict.get('exchange_7_ticker', ''),
            'exchange_7_bloomberg': etf_dict.get('exchange_7_bloomberg', ''),
            'exchange_7_reuters': etf_dict.get('exchange_7_reuters', ''),
            'exchange_7_market_maker': etf_dict.get('exchange_7_market_maker', ''),
            'exchange_8_name': etf_dict.get('exchange_8_name', ''),
            'exchange_8_currency': etf_dict.get('exchange_8_currency', ''),
            'exchange_8_ticker': etf_dict.get('exchange_8_ticker', ''),
            'exchange_8_bloomberg': etf_dict.get('exchange_8_bloomberg', ''),
            'exchange_8_reuters': etf_dict.get('exchange_8_reuters', ''),
            'exchange_8_market_maker': etf_dict.get('exchange_8_market_maker', ''),
            'exchange_9_name': etf_dict.get('exchange_9_name', ''),
            'exchange_9_currency': etf_dict.get('exchange_9_currency', ''),
            'exchange_9_ticker': etf_dict.get('exchange_9_ticker', ''),
            'exchange_9_bloomberg': etf_dict.get('exchange_9_bloomberg', ''),
            'exchange_9_reuters': etf_dict.get('exchange_9_reuters', ''),
            'exchange_9_market_maker': etf_dict.get('exchange_9_market_maker', ''),
            'exchange_10_name': etf_dict.get('exchange_10_name', ''),
            'exchange_10_currency': etf_dict.get('exchange_10_currency', ''),
            'exchange_10_ticker': etf_dict.get('exchange_10_ticker', ''),
            'exchange_10_bloomberg': etf_dict.get('exchange_10_bloomberg', ''),
            'exchange_10_reuters': etf_dict.get('exchange_10_reuters', ''),
            'exchange_10_market_maker': etf_dict.get('exchange_10_market_maker', '')
            # NO rating fields here intentionally
        }

    def upload_etfs_to_database(self, etfs: List[ETFDataComplete]) -> bool:
        """Nahraje ETF data do Supabase databáze pomocí optimalizovaného chunked uploadu"""
        if not self.supabase:
            safe_log("warning", "WARNING: Supabase klient není inicializovaný, přeskakuji nahrávání do DB")
            return False
            
        return self._upload_chunk_to_database(etfs, chunk_size=5)
    
    def _upload_chunk_to_database(self, etfs: List[ETFDataComplete], chunk_size: int = 5) -> bool:
        """Upload ETFs to database in smaller chunks to avoid timeout"""
        success_count = 0
        total_etfs = len(etfs)
        
        safe_log("info", f"📤 Uploading {total_etfs} ETFs in chunks of {chunk_size}...")
        
        for i in range(0, total_etfs, chunk_size):
            chunk = etfs[i:i + chunk_size]
            chunk_num = (i // chunk_size) + 1
            total_chunks = (total_etfs + chunk_size - 1) // chunk_size
            
            try:
                safe_log("info", f"📦 Chunk {chunk_num}/{total_chunks}: Uploading {len(chunk)} ETFs...")
                
                # Transform data for database
                transformed_chunk = [self.transform_etf_for_database(etf) for etf in chunk]
                
                # Try upload with rating fields first
                try:
                    response = self.supabase.table('etf_funds').upsert(
                        transformed_chunk,
                        on_conflict='isin'
                    ).execute()
                    
                    if response.data:
                        success_count += len(chunk)
                        safe_log("info", f"✅ Chunk {chunk_num}: Successfully uploaded {len(chunk)} ETFs with rating fields")
                    else:
                        safe_log("warning", f"⚠️ Chunk {chunk_num}: No data returned from upload")
                        
                except Exception as rating_error:
                    safe_log("warning", f"⚠️ Chunk {chunk_num}: Rating fields failed: {rating_error}")
                    safe_log("info", f"🔄 Chunk {chunk_num}: Retrying without rating fields...")
                    
                    # Remove rating fields and retry
                    transformed_chunk_no_rating = []
                    for etf_data in transformed_chunk:
                        etf_copy = etf_data.copy()
                        etf_copy.pop('rating', None)
                        etf_copy.pop('rating_score', None)
                        transformed_chunk_no_rating.append(etf_copy)
                    
                    response = self.supabase.table('etf_funds').upsert(
                        transformed_chunk_no_rating,
                        on_conflict='isin'
                    ).execute()
                    
                    if response.data:
                        success_count += len(chunk)
                        safe_log("info", f"✅ Chunk {chunk_num}: Successfully uploaded {len(chunk)} ETFs without rating fields")
                    else:
                        safe_log("error", f"❌ Chunk {chunk_num}: Failed to upload even without rating fields")
                
                # Small delay between chunks to be respectful to the database
                time.sleep(0.5)
                
            except Exception as e:
                safe_log("error", f"❌ Chunk {chunk_num}: Failed to upload: {e}")
                
        safe_log("info", f"🎯 Upload complete: {success_count}/{total_etfs} ETFs uploaded successfully")
        return success_count == total_etfs
    
    def _ensure_rating_columns_exist(self):
        """Zajistí, že rating sloupce existují v databázi"""
        try:
            # Zkusíme jednoduchý test query s rating sloupci
            test_response = self.supabase.table('etf_funds').select('isin, rating, rating_score').limit(1).execute()
            # Pokud to prošlo, sloupce existují
            safe_log("info", "INFO: Rating sloupce již existují v databázi")
        except Exception as e:
            # Pokud se to nepovedlo, sloupce pravděpodobně neexistují
            safe_log("info", "INFO: Rating sloupce neexistují, zkouším je vytvořit...")
            try:
                # Pokusíme se vytvořit sloupce přes dummy update
                # Vezmeme první existující ISIN a zkusíme ho aktualizovat s rating daty
                existing = self.supabase.table('etf_funds').select('isin').limit(1).execute()
                if existing.data:
                    test_isin = existing.data[0]['isin']
                    # Pokusíme se aktualizovat s rating daty - to automaticky vytvoří sloupce
                    self.supabase.table('etf_funds').update({
                        'rating': 0,
                        'rating_score': 0
                    }).eq('isin', test_isin).execute()
                    safe_log("info", "SUCCESS: Rating sloupce byly automaticky vytvořeny")
                else:
                    safe_log("warning", "WARNING: Žádné existující záznamy pro vytvoření sloupců")
            except Exception as e2:
                safe_log("warning", f"WARNING: Nepodařilo se vytvořit rating sloupce: {e2}")


def main():
    parser = argparse.ArgumentParser(description='JustETF Complete Scraper with Dividends - KOMPLETNÍ VERZE')
    parser.add_argument('--csv', required=False, help='Cesta k CSV souboru s ISIN kódy (povinné kromě --backtest-only)')
    parser.add_argument('--batch-size', type=int, default=50, help='Velikost batch (default: 50)')
    parser.add_argument('--resume', action='store_true', help='Pokračovat v přerušeném scrapingu')
    parser.add_argument('--start-batch', type=int, default=0, help='Začít od konkrétního batch')
    parser.add_argument('--update-backtest', action='store_true', help='Aktualizovat historická data pro backtest (indexy z Yahoo Finance)')
    parser.add_argument('--backtest-only', action='store_true', help='Pouze aktualizovat backtest data (přeskočit ETF scraping)')

    args = parser.parse_args()
    
    # Startup info jen ve verbose módu
    if VERBOSE_MODE:
        print("="*80)
        print("JustETF COMPLETE Production Scraper - VERZE S DIVIDENDY")
        print("="*80)
        print("KOMPLETNÍ FUNKCIONALITA:")
        print("   ✅ Stock exchange data (burzy, tickery, Bloomberg/Reuters)")
        print("   ✅ Holdings, performance, risk metrics")
        print("   ✅ České překlady s finančním slovníkem")
        print("   ✅ Kategorizace ETF (Akcie/Dluhopisy/Krypto/Komodity)")
        print("   ✅ Automatické určení regionu (US/Evropa/Čína/Rozvíjející se země atd.)")
        print("   ✅ DIVIDENDOVÉ INFORMACE (Current yield, Last 12 months)")
        print("   ✅ MARKET HEATMAP generování (Yahoo Finance API)")
        print("   ✅ Batch processing s checkpointy")
        print("   ✅ Resume capability")
        print("   ✅ Unicode/emoji problémů pro Windows (FIX)")
        print("   ✅ Export do Excel, JSON a CSV formátů")
        print("="*80)
        print(f"CSV soubor: {args.csv}")
        print(f"Batch size: {args.batch_size}")
        print(f"Resume mode: {args.resume}")
        print(f"Exchange data: {EXTRACT_EXCHANGE_DATA}")
        print(f"Dividend data: {EXTRACT_DIVIDEND_DATA}")
        print(f"Překlady: {TRANSLATE_DESCRIPTIONS}")
        print(f"Automatické nahrávání do DB: {AUTO_UPLOAD_TO_DB}")
        print(f"Market heatmap generování: {GENERATE_MARKET_HEATMAP}")
        print(f"Market heatmap upload na server: {UPLOAD_HEATMAP_TO_SERVER and FTP_AVAILABLE}")
        print(f"Výstupní složka: {OUTPUT_DIR}")
        print(f"Export formáty: Excel (.xlsx), JSON (.json), CSV (.csv)")
        print("="*80)
    else:
        print(f"🚀 ETF Scraper started - processing {args.csv} with batch size {args.batch_size}")
    
    # Log info o server konfiguraci jen ve verbose módu
    if VERBOSE_MODE:
        if SERVER_CONFIG_LOADED:
            print(f"📁 CONFIG: Načtena konfigurace serveru ze server_config.py")
        else:
            print(f"⚠️ CONFIG: Používám výchozí konfiguraci serveru. Vytvořte server_config.py pro vlastní nastavení.")
            print(f"   Example config: server_config_example.py")
    
    # Backtest-only mode - pouze aktualizace historických dat pro backtest
    if args.backtest_only:
        print("=" * 60)
        print("BACKTEST DATA UPDATE (--backtest-only mode)")
        print("=" * 60)
        update_backtest_data()
        print("\n✅ Backtest data update completed!")
        return

    # Validace --csv pro normální režim
    if not args.csv:
        print("❌ ERROR: --csv je povinný parametr pro ETF scraping!")
        print("   Použití: python final_scraper.py --csv ISIN.csv")
        print("   Nebo pro pouze backtest data: python final_scraper.py --backtest-only")
        return

    # Normální ETF scraping
    scraper = CompleteProductionScraper(batch_size=args.batch_size)
    scraper.run_complete_production_scraping(
        csv_file=args.csv,
        resume=args.resume,
        start_batch=args.start_batch
    )

    # Volitelně aktualizovat backtest data po ETF scrapingu
    if args.update_backtest:
        print("\n" + "=" * 60)
        print("BACKTEST DATA UPDATE (--update-backtest)")
        print("=" * 60)
        update_backtest_data()
        print("\n✅ Backtest data update completed!")


def update_backtest_data():
    """
    Aktualizuje historická data pro backtest - stahuje indexy z Yahoo Finance.
    Volá fetch_index_data_yahoo.py jako modul.
    """
    try:
        # Importuj a spusť fetch_index_data_yahoo
        import fetch_index_data_yahoo
        fetch_index_data_yahoo.main()
    except ImportError:
        print("❌ ERROR: fetch_index_data_yahoo.py nebyl nalezen!")
        print("   Ujistěte se, že soubor je ve stejné složce jako final_scraper.py")
    except Exception as e:
        print(f"❌ ERROR při aktualizaci backtest dat: {e}")


if __name__ == "__main__":
    main()