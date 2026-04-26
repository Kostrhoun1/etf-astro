"""
Fetch historical index data from Yahoo Finance and upload to Supabase.
All data is converted from USD to EUR using historical exchange rates.
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from supabase import create_client
import time
import os
import sys

# Supabase connection — credentials come from environment variables in CI
# (GitHub Actions: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) or local .env.
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    sys.exit(
        "ERROR: Missing Supabase credentials. Set env vars VITE_SUPABASE_URL "
        "and SUPABASE_SERVICE_ROLE_KEY (in GitHub Secrets, or in a local .env)."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ETFs to download - using USD versions for longer history
# Will be converted to EUR using historical exchange rates
ETF_INDEX_MAPPING = {
    # AKCIE
    'SPY': {
        'index_code': 'sp500',
        'index_name': 'S&P 500',
        'currency': 'USD',
        'category': 'Akcie'
    },
    'VTI': {
        'index_code': 'us_total_market',
        'index_name': 'US Total Stock Market',
        'currency': 'USD',
        'category': 'Akcie'
    },
    'EFA': {
        'index_code': 'msci_eafe',
        'index_name': 'MSCI EAFE (Developed ex-US)',
        'currency': 'USD',
        'category': 'Akcie'
    },
    'VGK': {
        'index_code': 'ftse_europe',
        'index_name': 'FTSE Developed Europe',
        'currency': 'USD',
        'category': 'Akcie'
    },
    'EEM': {
        'index_code': 'msci_em',
        'index_name': 'MSCI Emerging Markets',
        'currency': 'USD',
        'category': 'Akcie'
    },
    'VT': {
        'index_code': 'ftse_all_world',
        'index_name': 'FTSE All-World',
        'currency': 'USD',
        'category': 'Akcie'
    },
    
    # EUR DLUHOPISY (London listed, will convert GBP->EUR)
    'IEAG.L': {
        'index_code': 'eur_govt_bond',
        'index_name': 'EUR Government Bond',
        'currency': 'EUR',  # Listed in EUR on LSE
        'category': 'Dluhopisy EUR'
    },
    'IBGS.L': {
        'index_code': 'eur_govt_bond_1_3y',
        'index_name': 'EUR Government Bond 1-3Y',
        'currency': 'GBP',  # Listed in GBP
        'category': 'Dluhopisy EUR'
    },
    'IBGM.L': {
        'index_code': 'eur_govt_bond_3_7y',
        'index_name': 'EUR Government Bond 3-7Y',
        'currency': 'GBP',
        'category': 'Dluhopisy EUR'
    },
    'IBGL.L': {
        'index_code': 'eur_govt_bond_15_30y',
        'index_name': 'EUR Government Bond 15-30Y',
        'currency': 'GBP',
        'category': 'Dluhopisy EUR'
    },
    'IEAC.L': {
        'index_code': 'eur_corp_bond',
        'index_name': 'EUR Corporate Bond',
        'currency': 'EUR',
        'category': 'Dluhopisy EUR'
    },
    
    # US DLUHOPISY
    'SHY': {
        'index_code': 'us_treasury_1_3y',
        'index_name': 'US Treasury Bond 1-3Y',
        'currency': 'USD',
        'category': 'Dluhopisy USD'
    },
    'IEF': {
        'index_code': 'us_treasury_7_10y',
        'index_name': 'US Treasury Bond 7-10Y',
        'currency': 'USD',
        'category': 'Dluhopisy USD'
    },
    'TLT': {
        'index_code': 'us_treasury_20y',
        'index_name': 'US Treasury Bond 20+Y',
        'currency': 'USD',
        'category': 'Dluhopisy USD'
    },
    'AGG': {
        'index_code': 'us_aggregate_bond',
        'index_name': 'US Aggregate Bond',
        'currency': 'USD',
        'category': 'Dluhopisy USD'
    },
    'LQD': {
        'index_code': 'us_corp_bond_ig',
        'index_name': 'US Corporate Bond Investment Grade',
        'currency': 'USD',
        'category': 'Dluhopisy USD'
    },
    
    # ZLATO & KOMODITY
    'GLD': {
        'index_code': 'gold',
        'index_name': 'Gold',
        'currency': 'USD',
        'category': 'Komodity'
    },
    'DBC': {
        'index_code': 'commodities',
        'index_name': 'Commodities Diversified',
        'currency': 'USD',
        'category': 'Komodity'
    },
}


def load_exchange_rates():
    """Load EUR/USD exchange rates from Supabase"""
    print("Loading exchange rates from database...")
    
    response = supabase.table('exchange_rates_historical') \
        .select('date, eur_usd') \
        .order('date') \
        .execute()
    
    if not response.data:
        raise Exception("No exchange rates found in database!")
    
    # Convert to dict for fast lookup
    rates = {}
    for row in response.data:
        rates[row['date']] = float(row['eur_usd'])
    
    print(f"  Loaded {len(rates)} exchange rates")
    return rates


def get_eur_usd_rate(rates: dict, date_str: str) -> float:
    """Get EUR/USD rate for a date, with fallback to nearest date"""
    if date_str in rates:
        return rates[date_str]
    
    # Find nearest date
    target = datetime.strptime(date_str, '%Y-%m-%d')
    min_diff = timedelta(days=365)
    nearest_rate = None
    
    for d, r in rates.items():
        diff = abs(datetime.strptime(d, '%Y-%m-%d') - target)
        if diff < min_diff:
            min_diff = diff
            nearest_rate = r
    
    return nearest_rate if nearest_rate else 1.0


def fetch_and_convert_data(ticker: str, info: dict, exchange_rates: dict):
    """Fetch ETF data from Yahoo Finance and convert to EUR"""
    print(f"\nFetching {ticker} ({info['index_name']})...")
    
    try:
        etf = yf.Ticker(ticker)
        hist = etf.history(period="max")
        
        if len(hist) == 0:
            print(f"  ERROR: No data for {ticker}")
            return None
        
        print(f"  Downloaded {len(hist)} data points from {hist.index[0].strftime('%Y-%m-%d')}")
        
        # Prepare data
        data_points = []
        source_currency = info['currency']
        
        for date, row in hist.iterrows():
            date_str = date.strftime('%Y-%m-%d')
            price_original = row['Close']
            
            # Convert to EUR
            if source_currency == 'USD':
                eur_usd = get_eur_usd_rate(exchange_rates, date_str)
                price_eur = price_original / eur_usd  # USD to EUR
            elif source_currency == 'GBP':
                # GBP to EUR - use approximate rate (we don't have GBP/EUR in DB)
                # For GBP-listed EUR bond ETFs, the underlying is EUR so we use ~0.85
                eur_usd = get_eur_usd_rate(exchange_rates, date_str)
                gbp_eur = 1.15  # Approximate GBP/EUR
                price_eur = price_original * gbp_eur
            else:
                # Already EUR
                price_eur = price_original
            
            data_points.append({
                'index_code': info['index_code'],
                'date': date_str,
                'close_price': round(price_eur, 4),
                'original_currency': source_currency,
                'original_price': round(price_original, 4)
            })
        
        print(f"  Converted {len(data_points)} points to EUR")
        return data_points
        
    except Exception as e:
        print(f"  ERROR: {e}")
        return None


def upload_to_supabase(data_points: list, index_code: str):
    """Upload data to Supabase, replacing existing data for this index"""
    if not data_points:
        return
    
    print(f"  Uploading {len(data_points)} points to Supabase...")
    
    # Delete existing data for this index
    supabase.table('index_historical_data') \
        .delete() \
        .eq('index_code', index_code) \
        .execute()
    
    # Upload in batches
    batch_size = 500
    for i in range(0, len(data_points), batch_size):
        batch = data_points[i:i+batch_size]
        # Only upload required fields
        upload_data = [
            {
                'index_code': p['index_code'],
                'date': p['date'],
                'close_price': p['close_price']
            }
            for p in batch
        ]
        supabase.table('index_historical_data').insert(upload_data).execute()
        print(f"    Uploaded batch {i//batch_size + 1}")
    
    print(f"  ✅ Done")


def update_index_mapping(index_code: str, index_name: str, ticker: str):
    """Add or update index mapping"""
    # Check if exists
    existing = supabase.table('index_mapping') \
        .select('*') \
        .eq('index_code', index_code) \
        .execute()
    
    if existing.data:
        # Update
        supabase.table('index_mapping') \
            .update({'index_name': index_name, 'yahoo_ticker': ticker}) \
            .eq('index_code', index_code) \
            .execute()
    else:
        # Insert
        supabase.table('index_mapping').insert({
            'index_code': index_code,
            'index_name': index_name,
            'yahoo_ticker': ticker,
            'is_total_return': False
        }).execute()


def main():
    print("=" * 60)
    print("FETCHING INDEX DATA FROM YAHOO FINANCE")
    print("All data will be converted to EUR")
    print("=" * 60)
    
    # Load exchange rates
    exchange_rates = load_exchange_rates()
    
    # Process each ETF
    results = []
    for ticker, info in ETF_INDEX_MAPPING.items():
        data = fetch_and_convert_data(ticker, info, exchange_rates)
        
        if data:
            upload_to_supabase(data, info['index_code'])
            update_index_mapping(info['index_code'], info['index_name'], ticker)
            
            results.append({
                'ticker': ticker,
                'index': info['index_name'],
                'points': len(data),
                'start': data[0]['date'],
                'end': data[-1]['date']
            })
        
        time.sleep(1)  # Rate limiting
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for r in results:
        years = (datetime.strptime(r['end'], '%Y-%m-%d') - datetime.strptime(r['start'], '%Y-%m-%d')).days / 365.25
        print(f"{r['index']:<40} {r['start']} - {r['end']} ({years:.1f} let, {r['points']} bodů)")
    
    print(f"\nTotal: {len(results)} indexes uploaded")


if __name__ == "__main__":
    main()

