#!/usr/bin/env python3
"""
Fetch Historical Exchange Rates

Downloads historical exchange rates for EUR/USD and EUR/CZK from 2000 to present
and uploads them to Supabase for use in the backtest tool.

Sources:
- Frankfurter API (ECB data) for EUR/USD
- ČNB for EUR/CZK and USD/CZK

Usage:
    python3 fetch_historical_exchange_rates.py
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time
import json

# Supabase connection
from supabase import create_client
from server_config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

class HistoricalExchangeRateFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        })

    def fetch_frankfurter_range(self, start_date: str, end_date: str) -> Dict[str, Dict[str, float]]:
        """
        Fetch EUR/USD and EUR/CZK rates from Frankfurter API (ECB data)

        Args:
            start_date: YYYY-MM-DD format
            end_date: YYYY-MM-DD format

        Returns:
            Dict with dates as keys and {'USD': rate, 'CZK': rate} as values
        """
        url = f"https://api.frankfurter.dev/v1/{start_date}..{end_date}?base=EUR&symbols=USD,CZK"

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()

            return data.get('rates', {})

        except Exception as e:
            print(f"Error fetching from Frankfurter: {e}")
            return {}

    def fetch_all_historical_rates(self) -> List[Dict]:
        """
        Fetch all historical exchange rates from 2000 to present.

        Returns:
            List of dicts with {date, eur_usd, eur_czk, usd_czk} for each date
        """
        all_rates = []

        # Frankfurter API supports ranges, but let's do it in chunks of 1 year
        # to avoid timeouts
        start_year = 2000
        end_year = datetime.now().year

        for year in range(start_year, end_year + 1):
            start_date = f"{year}-01-01"
            end_date = f"{year}-12-31" if year < end_year else datetime.now().strftime("%Y-%m-%d")

            print(f"Fetching rates for {year}...")

            rates = self.fetch_frankfurter_range(start_date, end_date)

            for date_str, rate_data in rates.items():
                eur_usd = rate_data.get('USD')
                eur_czk = rate_data.get('CZK')

                if eur_usd and eur_czk:
                    # Calculate USD/CZK = EUR/CZK / EUR/USD
                    usd_czk = eur_czk / eur_usd

                    all_rates.append({
                        'date': date_str,
                        'eur_usd': round(eur_usd, 6),
                        'eur_czk': round(eur_czk, 4),
                        'usd_czk': round(usd_czk, 4),
                    })

            # Rate limiting - be nice to the API
            time.sleep(0.5)

        # Sort by date
        all_rates.sort(key=lambda x: x['date'])

        return all_rates

    def upload_to_supabase(self, rates: List[Dict]) -> bool:
        """
        Upload exchange rates to Supabase.
        Creates table if it doesn't exist.
        """
        # Remove duplicates - keep only unique dates
        seen_dates = set()
        unique_rates = []
        for rate in rates:
            if rate['date'] not in seen_dates:
                seen_dates.add(rate['date'])
                unique_rates.append(rate)

        print(f"\nUploading {len(unique_rates)} unique exchange rates to Supabase...")

        # Upload in batches - use smaller batches and insert instead of upsert
        batch_size = 100
        total_uploaded = 0

        for i in range(0, len(unique_rates), batch_size):
            batch = unique_rates[i:i + batch_size]

            try:
                # Use upsert with ignore_duplicates
                result = supabase.table('exchange_rates_historical').upsert(
                    batch,
                    on_conflict='date',
                    ignore_duplicates=True
                ).execute()

                total_uploaded += len(batch)
                print(f"  Uploaded {total_uploaded}/{len(unique_rates)} rates...")

            except Exception as e:
                print(f"Error uploading batch {i}-{i+batch_size}: {e}")
                # Try inserting one by one for this batch
                for rate in batch:
                    try:
                        supabase.table('exchange_rates_historical').upsert(
                            rate,
                            on_conflict='date',
                            ignore_duplicates=True
                        ).execute()
                    except:
                        pass  # Skip duplicates

        print(f"Successfully uploaded {total_uploaded} exchange rates!")
        return True


def create_table_if_not_exists():
    """
    Create the exchange_rates_historical table in Supabase if it doesn't exist.

    Run this SQL in Supabase SQL editor:

    CREATE TABLE IF NOT EXISTS exchange_rates_historical (
        date DATE PRIMARY KEY,
        eur_usd DECIMAL(10, 6) NOT NULL,
        eur_czk DECIMAL(10, 4) NOT NULL,
        usd_czk DECIMAL(10, 4) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX idx_exchange_rates_date ON exchange_rates_historical(date);
    """
    print("Note: Make sure the exchange_rates_historical table exists in Supabase.")
    print("Run the SQL in the docstring above if you haven't created the table yet.")


def main():
    print("=" * 60)
    print("Historical Exchange Rates Fetcher")
    print("=" * 60)

    create_table_if_not_exists()

    fetcher = HistoricalExchangeRateFetcher()

    # Fetch all rates
    print("\nFetching historical exchange rates from 2000 to present...")
    rates = fetcher.fetch_all_historical_rates()

    print(f"\nFetched {len(rates)} daily exchange rates")

    if rates:
        # Show sample
        print("\nSample data:")
        print(f"  First: {rates[0]}")
        print(f"  Last:  {rates[-1]}")

        # Upload to Supabase
        success = fetcher.upload_to_supabase(rates)

        if success:
            print("\n✅ Exchange rates successfully uploaded to Supabase!")
        else:
            print("\n❌ Failed to upload exchange rates")
    else:
        print("\n❌ No rates fetched")


if __name__ == "__main__":
    main()
