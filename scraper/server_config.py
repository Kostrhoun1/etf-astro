# Scraper config — CI-friendly version.
#
# Secrets (Supabase URL/key) are NOT in this file. They come from environment
# variables in GitHub Actions: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
# See .github/workflows/scrape.yml.
#
# FTP/legacy upload is disabled — heatmap data is published directly to Supabase
# via Supabase client; the FTP/git-commit upload pipeline below is dead code.

# Placeholders so `from server_config import ...` doesn't crash. These values
# are never used in production: UPLOAD_HEATMAP_TO_SERVER is False so the FTP
# code path is skipped entirely.
FTP_SERVER = "disabled.invalid"
FTP_USERNAME = "disabled"
FTP_PASSWORD = None
FTP_REMOTE_PATH = "/disabled/"
UPLOAD_METHOD = "ftp"

# Disable the FTP/git-commit heatmap upload pipeline. Heatmap data is written
# locally during scrape but the upload step is skipped.
UPLOAD_HEATMAP_TO_SERVER = False
