#!/usr/bin/env python3
"""
refresh_isin_list.py — udržuje ISIN.csv v souladu s justETF.

Zdroj pravdy = justETF sitemapy (oficiální, stabilní, určené k procházení).
Z profilů ETF (etf-profile.html?isin=...) vytáhne kompletní aktuální seznam
ISINů a synchronizuje s ISIN.csv:
  • PŘIDÁ nové fondy (jsou na justETF, chybí u nás),
  • ODEBERE delistované (máme je, justETF už je nemá).

Pojistky:
  • sanity threshold — když sitemapa vrátí míň než MIN_EXPECTED ISINů
    (typicky výpadek stažení), skript NIC nezmění a skončí chybou,
  • před zápisem udělá časově-razítkovanou zálohu ISIN.csv,
  • --dry-run jen vypíše, co by se stalo; --add-only nemaže delistované.

Použití:
  python refresh_isin_list.py --dry-run     # náhled, nic nezapíše
  python refresh_isin_list.py               # plná synchronizace (add + remove)
  python refresh_isin_list.py --add-only    # jen doplní nové, nic nemaže

Doporučeno spouštět 1× měsíčně PŘED hlavním scrapem (viz cron níže).
"""

import argparse
import csv
import os
import re
import shutil
import sys
from datetime import datetime

import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ISIN_CSV = os.path.join(SCRIPT_DIR, "ISIN.csv")
SITEMAP_INDEX = "https://www.justetf.com/sitemap_index.xml"
MIN_EXPECTED = 4000  # pod tímto počtem považujeme stažení za neúplné → neměníme nic

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

ISIN_RE = re.compile(r"isin=([A-Z0-9]{12})", re.IGNORECASE)
LOC_RE = re.compile(r"<loc>([^<]+)</loc>", re.IGNORECASE)


def log(msg: str) -> None:
    print(f"[{datetime.now():%H:%M:%S}] {msg}", flush=True)


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept": "application/xml,text/xml,*/*"})
    return s


def fetch_sub_sitemaps(session: requests.Session) -> list[str]:
    r = session.get(SITEMAP_INDEX, timeout=30)
    r.raise_for_status()
    subs = LOC_RE.findall(r.text)
    log(f"sitemap index: {len(subs)} podsitemap")
    return subs


def isins_from_sitemap(session: requests.Session, url: str) -> set[str]:
    """Stáhne podsitemapu (streamovaně kvůli velikosti) a vytáhne unikátní ISINy."""
    found: set[str] = set()
    with session.get(url, timeout=180, stream=True) as r:
        r.raise_for_status()
        tail = ""  # přesah mezi chunky, aby se ISIN nerozdělil na hranici
        for chunk in r.iter_content(chunk_size=1 << 20):
            if not chunk:
                continue
            text = tail + chunk.decode("utf-8", errors="ignore")
            for m in ISIN_RE.findall(text):
                found.add(m.upper())
            tail = text[-32:]  # ISIN má 12 znaků + "isin=" → 32 je bezpečná rezerva
    return found


def collect_justetf_isins(session: requests.Session) -> set[str]:
    all_isins: set[str] = set()
    for sub in fetch_sub_sitemaps(session):
        try:
            got = isins_from_sitemap(session, sub)
        except Exception as e:  # noqa: BLE001
            log(f"  ! {sub}: {e}")
            continue
        if got:
            log(f"  {sub.rsplit('/', 1)[-1]}: {len(got)} ISINů")
            all_isins |= got
    return all_isins


def load_current() -> list[str]:
    if not os.path.exists(ISIN_CSV):
        return []
    out: list[str] = []
    with open(ISIN_CSV, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            v = (row.get("ISIN") or "").strip().upper()
            if len(v) == 12:
                out.append(v)
    return out


def write_isins(isins: list[str]) -> None:
    with open(ISIN_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["ISIN"])
        for i in isins:
            w.writerow([i])


def main() -> int:
    ap = argparse.ArgumentParser(description="Synchronizuje ISIN.csv s justETF sitemapou.")
    ap.add_argument("--dry-run", action="store_true", help="jen vypíše změny, nic nezapíše")
    ap.add_argument("--add-only", action="store_true", help="jen doplní nové, delistované nemaže")
    args = ap.parse_args()

    session = make_session()
    log("Stahuji aktuální seznam ISINů z justETF sitemap…")
    live = collect_justetf_isins(session)
    log(f"justETF sitemap: {len(live)} unikátních ISINů")

    if len(live) < MIN_EXPECTED:
        log(f"CHYBA: staženo jen {len(live)} ISINů (< {MIN_EXPECTED}). "
            "Vypadá to na neúplné stažení – NIC neměním.")
        return 2

    current = set(load_current())
    to_add = sorted(live - current)
    to_remove = sorted(current - live)

    log(f"Náš seznam: {len(current)} ISINů")
    log(f"  + přibude nových: {len(to_add)}")
    log(f"  - delistovaných:  {len(to_remove)}"
        + (" (ponecháno, --add-only)" if args.add_only else ""))
    if to_add:
        log("    nové (ukázka): " + ", ".join(to_add[:8]) + (" …" if len(to_add) > 8 else ""))
    if to_remove:
        log("    delistované (ukázka): " + ", ".join(to_remove[:8]) + (" …" if len(to_remove) > 8 else ""))

    if args.add_only:
        final = current | set(to_add)
    else:
        final = set(live)  # plná synchronizace

    if final == current:
        log("Seznam je už aktuální, není co měnit.")
        return 0

    if args.dry_run:
        log(f"DRY-RUN: neměním. Výsledný seznam by měl {len(final)} ISINů.")
        return 0

    backup = f"{ISIN_CSV}.{datetime.now():%Y%m%d_%H%M%S}.bak"
    shutil.copy2(ISIN_CSV, backup)
    log(f"Záloha: {os.path.basename(backup)}")
    write_isins(sorted(final))
    log(f"HOTOVO: ISIN.csv má nyní {len(final)} ISINů "
        f"(+{len(to_add)}"
        + ("" if args.add_only else f", -{len(to_remove)}") + ").")
    return 0


if __name__ == "__main__":
    sys.exit(main())
