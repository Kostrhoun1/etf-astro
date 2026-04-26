"""
Scraper config — CI-friendly version.

Secrets (Supabase URL/key) are NEVER stored in this file. They come from
environment variables in GitHub Actions: VITE_SUPABASE_URL and
SUPABASE_SERVICE_ROLE_KEY. Locally, you can put them in a .env file at the
project root and python-dotenv will load them.

FTP/legacy upload is disabled — heatmap data is published directly to
Supabase via the Supabase client.
"""

import os

# --- Supabase credentials (read from env, never hardcoded) ---
# Re-exported with a couple of names so legacy imports keep working:
#   - fetch_historical_exchange_rates.py imports SUPABASE_URL, SUPABASE_SERVICE_KEY
#   - final_scraper.py reads VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY directly
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_SERVICE_KEY", "")
)

# --- FTP / legacy heatmap upload (disabled) ---
# The FTP/git-commit upload pipeline below is dead code. UPLOAD_HEATMAP_TO_SERVER
# is False so the FTP branch is skipped entirely; these placeholders just keep
# `from server_config import ...` from crashing.
FTP_SERVER = "disabled.invalid"
FTP_USERNAME = "disabled"
FTP_PASSWORD = None
FTP_REMOTE_PATH = "/disabled/"
UPLOAD_METHOD = "ftp"
UPLOAD_HEATMAP_TO_SERVER = False
