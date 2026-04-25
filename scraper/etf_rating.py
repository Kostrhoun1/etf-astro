"""
ETF Rating Calculator - Python version
Translates the TypeScript rating algorithm for use in scraping pipeline
"""

from datetime import datetime
from typing import Dict, Any, Optional

# Top-tier fund providers (get bonus points)
TOP_PROVIDERS = [
    'iShares', 'Vanguard', 'Xtrackers', 'Amundi', 'SPDR', 'Invesco'
]

def get_years_since_inception(inception_date_str: Optional[str]) -> float:
    """Calculate years since inception"""
    if not inception_date_str:
        return 0.0
    
    try:
        # Try multiple date formats that JustETF might use
        date_formats = [
            '%Y-%m-%d',              # 2010-05-19
            '%d %B %Y',              # 19 May 2010
            '%d %b %Y',              # 19 May 2010 (short month)
            '%B %d, %Y',             # May 19, 2010
            '%b %d, %Y',             # May 19, 2010 (short month)
            '%d/%m/%Y',              # 19/05/2010
            '%m/%d/%Y',              # 05/19/2010
        ]
        
        for date_format in date_formats:
            try:
                inception = datetime.strptime(inception_date_str, date_format)
                now = datetime.now()
                return (now - inception).days / 365.25
            except ValueError:
                continue
        
        # If none of the formats work, return 0
        return 0.0
    except:
        return 0.0

def score_ter(ter: float) -> int:
    """Score TER (0-30 points): Lower TER is better - most important factor
    Input: TER as percentage (0.07 for 0.07%, not 0.0007)
    """
    if ter <= 0.05:  # <= 0.05%
        return 30      # Excellent
    elif ter <= 0.10:  # <= 0.10%
        return 26      # Very Good
    elif ter <= 0.15:  # <= 0.15%
        return 22      # Good
    elif ter <= 0.25:  # <= 0.25%
        return 17      # Above Average
    elif ter <= 0.50:  # <= 0.50%
        return 12      # Average
    elif ter <= 0.75:  # <= 0.75%
        return 6       # Below Average
    else:  # > 0.75%
        return 1       # Poor

def score_fund_size(size_in_million: float) -> int:
    """Score Fund Size (0-25 points): Larger funds are more stable - expanded for 100-point scale
    Input: size in millions EUR (as stored in database)
    """
    size_in_billion = size_in_million / 1000.0  # Convert to billions
    
    if size_in_billion >= 50:
        return 25    # >= 50B = Excellent
    elif size_in_billion >= 20:
        return 22    # >= 20B = Very Good
    elif size_in_billion >= 10:
        return 19    # >= 10B = Good
    elif size_in_billion >= 5:
        return 16    # >= 5B = Above Average
    elif size_in_billion >= 1:
        return 13    # >= 1B = Average
    elif size_in_billion >= 0.5:
        return 10    # >= 500M = Below Average
    elif size_in_billion >= 0.1:
        return 5     # >= 100M = Poor
    else:
        return 1     # < 100M = Very Poor

def score_track_record(years: float) -> int:
    """Score Track Record (0-15 points): Longer history is better"""
    if years >= 15:
        return 15    # >= 15 years = Excellent
    elif years >= 10:
        return 13    # >= 10 years = Very Good
    elif years >= 7:
        return 11    # >= 7 years = Good
    elif years >= 5:
        return 8     # >= 5 years = Above Average
    elif years >= 3:
        return 6     # >= 3 years = Average
    elif years >= 1:
        return 3     # >= 1 year = Below Average
    else:
        return 1     # < 1 year = Poor

def score_provider(provider: str) -> int:
    """Score Fund Provider (0-10 points): Top providers get bonus"""
    if not provider:
        return 5
    
    provider_lower = provider.lower()
    
    for top_provider in TOP_PROVIDERS:
        if top_provider.lower() in provider_lower:
            return 10  # Top provider bonus
    
    return 5  # Standard provider

def score_performance(etf_data: Dict[str, Any]) -> int:
    """Score Performance (0-20 points): Risk-adjusted returns and consistency - expanded for 100-point scale"""
    return_3y = etf_data.get('return_3y', 0) or 0
    return_per_risk_3y = etf_data.get('return_per_risk_3y', 0) or 0
    
    score = 8  # Base score
    
    # Bonus for good 3-year returns (convert from decimal to percentage for comparison)
    return_3y_pct = return_3y * 100 if return_3y and return_3y < 1 else return_3y
    
    if return_3y_pct > 15:
        score += 9      # > 15% = Excellent
    elif return_3y_pct > 10:
        score += 7      # > 10% = Very Good
    elif return_3y_pct > 7:
        score += 5      # > 7% = Good
    elif return_3y_pct > 5:
        score += 3      # > 5% = Average
    elif return_3y_pct > 0:
        score += 1      # > 0% = Positive
    
    # Bonus for good risk-adjusted returns - but only if data exists
    # Since 99.9% of ETFs have no return_per_risk_3y data, we give smaller bonus
    if return_per_risk_3y > 0.5:
        score += 3      # Excellent risk-adjusted return
    elif return_per_risk_3y > 0.3:
        score += 2      # Good risk-adjusted return
    elif return_per_risk_3y > 0.1:
        score += 1      # Average risk-adjusted return
    
    return min(score, 20)

# REMOVED: score_tracking - tracking error not available for most ETFs on JustETF

def calculate_etf_rating(etf_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate comprehensive ETF rating based on database data
    Returns dict with rating (1-5), score (0-100), and breakdown
    Rating is only awarded to ETFs with minimum 3 years of track record
    """
    
    # Extract data with safe defaults
    ter = etf_data.get('ter_numeric', 0) or 0
    fund_size_numeric = etf_data.get('fund_size_numeric', 0) or 0
    provider = etf_data.get('fund_provider', '') or ''
    inception_date = etf_data.get('inception_date', '')
    tracking_error = etf_data.get('tracking_error', 0)
    
    years = get_years_since_inception(inception_date)
    
    # Minimum age requirement: 3 years for rating
    if years < 3.0:
        return {
            'rating': None,
            'rating_score': None,
            'rating_breakdown': None,
            'rating_note': f'Fond je příliš mladý ({years:.1f} let). Rating je dostupný po 3 letech existence.'
        }
    
    # Calculate individual scores
    ter_score = score_ter(ter)
    size_score = score_fund_size(fund_size_numeric)
    track_record_score = score_track_record(years)
    provider_score = score_provider(provider)
    performance_score = score_performance(etf_data)
    # tracking_score removed - data not available for most ETFs
    
    # Total score (exactly 100) - TER:30 + Size:25 + Track Record:15 + Provider:10 + Performance:20 = 100
    total_score = (
        ter_score + size_score + track_record_score + 
        provider_score + performance_score
    )
    
    # Convert score to star rating - will be adjusted based on actual distribution
    # Maximum score: 100 points (TER:30 + Size:25 + Track:15 + Provider:10 + Performance:20)
    if total_score >= 75:
        rating = 5      # 75+ = 5 stars (Excellent) - was 85+
    elif total_score >= 65:
        rating = 4      # 65-74 = 4 stars (Very Good) - was 70-84
    elif total_score >= 50:
        rating = 3      # 50-64 = 3 stars (Good) - was 55-69
    elif total_score >= 35:
        rating = 2      # 35-49 = 2 stars (Average) - was 40-54
    else:
        rating = 1      # < 35 = 1 star (Poor) - was < 40
    
    return {
        'rating': rating,
        'rating_score': total_score,
        'rating_breakdown': {
            'ter': ter_score,
            'fund_size': size_score,
            'track_record': track_record_score,
            'provider': provider_score,
            'performance': performance_score
            # tracking removed - not available for most ETFs
        },
        # Individual components for database storage
        'rating_ter_score': ter_score,
        'rating_size_score': size_score, 
        'rating_track_record_score': track_record_score,
        'rating_provider_score': provider_score,
        'rating_performance_score': performance_score
    }

def get_rating_category(rating: int) -> str:
    """Get rating category description"""
    categories = {
        5: 'excellent',
        4: 'very-good', 
        3: 'good',
        2: 'average',
        1: 'poor'
    }
    return categories.get(rating, 'unknown')

def get_rating_description(rating: int) -> str:
    """Get rating description in Czech"""
    descriptions = {
        5: 'Vynikající - TOP volba pro portfolia',
        4: 'Velmi dobrý - Kvalitní fond s dobrými parametry',
        3: 'Dobrý - Solidní volba s mírnými kompromisy',
        2: 'Průměrný - Vhodný pro specifické potřeby',
        1: 'Slabý - Zvážit alternativy'
    }
    return descriptions.get(rating, 'Nehodnoceno')

if __name__ == "__main__":
    # Test the rating system
    test_etf = {
        'name': 'iShares Core S&P 500 UCITS ETF',
        'ter_numeric': 0.0007,  # 0.07%
        'fund_size_numeric': 74800,  # 74.8B EUR in millions
        'fund_provider': 'iShares',
        'inception_date': '2010-09-19',
        'return_3y': 0.12,  # 12%
        'return_per_risk_3y': 0.6,
        'tracking_error': 0.0005  # 0.05%
    }
    
    result = calculate_etf_rating(test_etf)
    print(f"Test ETF Rating: {result['rating']}/5 stars")
    print(f"Score: {result['rating_score']}/100")
    print(f"Description: {get_rating_description(result['rating'])}")
    print(f"Breakdown: {result['rating_breakdown']}")