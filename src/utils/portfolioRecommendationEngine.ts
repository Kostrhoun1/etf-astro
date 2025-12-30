// import { supabase } from '@/integrations/supabase/client'; // Unused for now

export interface InvestorProfile {
  age: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  timeHorizon: 'short' | 'medium' | 'long'; // <5, 5-15, 15+ years
  experience: 'beginner' | 'intermediate' | 'advanced';
  goals: ('retirement' | 'house' | 'general_wealth' | 'education')[];
}

export interface PortfolioAllocation {
  stocks: number;      // % akcie
  bonds: number;       // % dluhopisy
  commodities: number; // % komodity
  reits: number;       // % nemovitosti
}

export interface AllocationEntry {
  asset: string;
  percentage: number;
}

export interface ETFRecommendation {
  isin: string;
  name: string;
  category: 'stocks' | 'bonds' | 'commodities' | 'reits';
  allocation: number;  // % v portfoliu
  reason: string;
  region?: string;
}

export interface PortfolioRecommendation {
  name: string;
  description: string;
  allocation: PortfolioAllocation;
  etfs: ETFRecommendation[];
  expectedReturn: string;
  expectedReturnNumeric: number; // Číselná hodnota v procentech
  volatility: string;
  riskLevel: number; // 1-10
  rebalanceFrequency: string;
  explanation: {
    strategy: string;
    pros: string[];
    cons: string[];
    suitableFor: string[];
  };
  strategyId?: string;
  detailUrl?: string;
}

export class PortfolioRecommendationEngine {
  
  // 5 core portfolio strategies (matching PortfolioStrategies component with final allocations)
  private portfolioModels = {
    permanent: {
      name: "Permanentní Portfolio",
      description: "Stabilita ve všech ekonomických podmínkách s rovnoměrnou alokací",
      strategyId: "permanent",
      riskLevel: 3,
      expectedReturn: "4% ročně",
      expectedReturnNumeric: 4,
      allocations: [
        { asset: 'Akcie', percentage: 25, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World' },
        { asset: 'Dluhopisy', percentage: 25, isin: 'IE00BDBRDM35', etfName: 'iShares Core Global Aggregate Bond UCITS ETF EUR Hedged (Acc)' },
        { asset: 'Nemovitosti', percentage: 25, isin: 'IE00B0M63284', etfName: 'iShares European Property Yield UCITS ETF' },
        { asset: 'Komodity', percentage: 25, isin: 'IE00BD6FTQ80', etfName: 'Invesco Bloomberg Commodity UCITS ETF Acc' },
      ],
      detailUrl: '/portfolio-strategie/permanentni-portfolio'
    },
    
    nobel: {
      name: "Nobelovo Portfolio",
      description: "Vyváženost mezi rizikem a výnosem založená na moderní portfoliové teorii",
      strategyId: "nobel",
      riskLevel: 6,
      expectedReturn: "6% ročně",
      expectedReturnNumeric: 6,
      allocations: [
        { asset: 'Akcie', percentage: 55, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World' },
        { asset: 'Dluhopisy', percentage: 25, isin: 'IE00BDBRDM35', etfName: 'iShares Core Global Aggregate Bond UCITS ETF EUR Hedged (Acc)' },
        { asset: 'Nemovitosti', percentage: 20, isin: 'IE00B0M63284', etfName: 'iShares European Property Yield UCITS ETF' },
      ],
      detailUrl: '/portfolio-strategie/nobel-portfolio'
    },
    
    stock: {
      name: "Akciové Portfolio",
      description: "Maximální růstový potenciál pro dlouhodobé investory",
      strategyId: "stock",
      riskLevel: 8,
      expectedReturn: "7-8% ročně",
      expectedReturnNumeric: 7.5,
      allocations: [
        { asset: 'Světové akcie', percentage: 80, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World UCITS ETF' },
        { asset: 'Nemovitosti (REITs)', percentage: 20, isin: 'IE00B0M63284', etfName: 'iShares European Property Yield UCITS ETF' },
      ],
      detailUrl: '/portfolio-strategie/akciove-portfolio'
    },
    
    allweather: {
      name: "Ray Dalio All-Weather",
      description: "Funguje ve všech ekonomických prostředích podle Ray Dalia",
      strategyId: "allweather",
      riskLevel: 4,
      expectedReturn: "5-8% ročně",
      expectedReturnNumeric: 6.5,
      allocations: [
        { asset: 'Dlouhodobé dluhopisy', percentage: 40, isin: 'IE00BFM6TC58', etfName: 'iShares USD Treasury Bond 20+yr UCITS ETF USD (Acc)' },
        { asset: 'Akcie', percentage: 30, isin: 'IE00BK5BQT80', etfName: 'Vanguard FTSE All-World' },
        { asset: 'Střednědobé dluhopisy', percentage: 15, isin: 'IE00B3VWN518', etfName: 'iShares USD Treasury Bond 7-10yr UCITS ETF (Acc)' },
        { asset: 'Komodity', percentage: 7.5, isin: 'IE00BD6FTQ80', etfName: 'Invesco Bloomberg Commodity UCITS ETF Acc' },
        { asset: 'Zlato', percentage: 7.5, isin: 'IE00B4ND3602', etfName: 'iShares Physical Gold ETC' },
      ],
      detailUrl: '/portfolio-strategie/ray-dalio-all-weather'
    },
    
    dividend: {
      name: "Dividendové Portfolio",
      description: "Kvalitní dividendové akcie s růstem výplat a pasivním příjmem",
      strategyId: "dividend",
      riskLevel: 5,
      expectedReturn: "4% dividendy + růst",
      expectedReturnNumeric: 5,
      allocations: [
        { asset: 'Dividendové akcie', percentage: 95, isin: 'IE00B9CQXS71', etfName: 'SPDR S&P Global Dividend Aristocrats UCITS ETF' },
        { asset: 'Nemovitosti (REITs)', percentage: 5, isin: 'IE00B1FZS350', etfName: 'iShares Developed Markets Property Yield UCITS ETF' },
      ],
      detailUrl: '/portfolio-strategie/dividendove-portfolio'
    }
  };


  async getPortfolioRecommendation(profile: InvestorProfile): Promise<PortfolioRecommendation> {
    // 1. Determine which of the 5 strategies might be suitable for this profile
    const strategyKey = this.determineStrategy(profile);
    const strategy = this.portfolioModels[strategyKey];
    
    // 2. Convert strategy allocations to ETF examples
    const etfRecommendations = strategy.allocations.map(allocation => ({
      isin: allocation.isin,
      name: allocation.etfName,
      category: this.getCategoryFromAsset(allocation.asset),
      allocation: allocation.percentage,
      reason: allocation.asset
    }));
    
    // 3. Generate explanation for the model strategy
    const explanation = this.generateExplanation(strategyKey, profile);

    // 4. Calculate allocation summary for backwards compatibility
    const allocationSummary = this.calculateAllocationSummary(strategy.allocations);

    return {
      name: strategy.name,
      description: strategy.description,
      allocation: allocationSummary,
      etfs: etfRecommendations,
      expectedReturn: strategy.expectedReturn,
      expectedReturnNumeric: strategy.expectedReturnNumeric,
      volatility: "Střední", // Default for compatibility
      riskLevel: strategy.riskLevel,
      rebalanceFrequency: "Podle strategie", // Default for compatibility
      explanation,
      strategyId: strategy.strategyId,
      detailUrl: strategy.detailUrl
    };
  }

  private determineStrategy(profile: InvestorProfile): keyof typeof this.portfolioModels {
    // Strategy recommendation logic based on user profile
    
    // Very aggressive young investors -> Stock Portfolio
    if (profile.age <= 35 && profile.riskTolerance === 'aggressive' && profile.timeHorizon === 'long') {
      return 'stock';
    }
    
    // Conservative or older investors -> Permanent Portfolio or All-Weather
    if (profile.riskTolerance === 'conservative' || profile.age >= 50) {
      // Prefer All-Weather for slightly higher risk tolerance, Permanent for ultra-conservative
      return profile.age >= 55 || profile.timeHorizon === 'short' ? 'permanent' : 'allweather';
    }
    
    // Dividend seekers -> Dividend Portfolio (new strategy)
    if ((profile.goals.includes('retirement') || profile.goals.includes('general_wealth')) && 
        profile.age >= 35 && profile.age <= 50 && 
        profile.riskTolerance === 'moderate') {
      return 'dividend';
    }
    
    // Academic-minded or experienced investors -> Nobel Portfolio
    if (profile.experience === 'advanced' || 
        (profile.goals.includes('general_wealth') && profile.riskTolerance === 'moderate' && profile.age < 35)) {
      return 'nobel';
    }
    
    // Young moderate investors -> Nobel Portfolio (scientific approach)
    if (profile.age <= 40 && profile.riskTolerance === 'moderate' && profile.timeHorizon === 'long') {
      return 'nobel';
    }
    
    // Default fallback based on age and risk tolerance
    if (profile.age <= 35 && profile.riskTolerance === 'aggressive') {
      return 'stock';
    } else if (profile.age >= 45 || profile.riskTolerance === 'conservative') {
      return 'allweather';
    } else if (profile.age >= 35 && profile.age <= 50) {
      return 'dividend'; // Middle-aged investors get dividend portfolio
    } else {
      return 'nobel'; // Balanced default choice with scientific backing
    }
  }

  private getCategoryFromAsset(asset: string): 'stocks' | 'bonds' | 'commodities' | 'reits' {
    const assetLower = asset.toLowerCase();
    if (assetLower.includes('akcie') || assetLower.includes('stock') || assetLower.includes('equity') || assetLower.includes('dividend')) {
      return 'stocks';
    } else if (assetLower.includes('dluhopis') || assetLower.includes('bond')) {
      return 'bonds';
    } else if (assetLower.includes('komodit') || assetLower.includes('zlato') || assetLower.includes('gold') || assetLower.includes('commodity')) {
      return 'commodities';
    } else if (assetLower.includes('nemovit') || assetLower.includes('reit')) {
      return 'reits';
    }
    return 'stocks'; // Default fallback
  }

  private calculateAllocationSummary(allocations: AllocationEntry[]): PortfolioAllocation {
    const summary: PortfolioAllocation = { stocks: 0, bonds: 0, commodities: 0, reits: 0 };
    
    for (const allocation of allocations) {
      const category = this.getCategoryFromAsset(allocation.asset);
      summary[category] += allocation.percentage;
    }
    
    return summary;
  }


  private generateExplanation(strategyType: string, profile: InvestorProfile) {
    const explanations = {
      permanent: {
        strategy: "Rovnoměrné 25% rozdělení mezi všechny ekonomické scénáře zajišťuje stabilní výkonnost bez ohledu na tržní podmínky",
        pros: [
          "Maximální jednoduchost implementace",
          "Ochrana proti všem ekonomickým scénářům",
          "Velmi nízká volatilita a stabilní výkonnost",
          "Historicky ověřená strategie (50+ let)"
        ],
        cons: [
          "Nižší výnosy během bull trhů",
          "Vysoké náklady na komodity",
          "Může významně zaostávat za akciovými portfolii"
        ],
        suitableFor: [
          "Velmi konzervativní investoři",
          "Investoři blížící se nebo v důchodu",
          "Lidé hledající \"fire-and-forget\" řešení"
        ]
      },
      
      nobel: {
        strategy: "Vědecky podložený přístup založený na moderní portfoliové teorii s optimálním poměrem rizika a výnosu",
        pros: [
          "Založeno na akademickém výzkumu",
          "Optimální poměr rizika a výnosu",
          "Vyvážená diverzifikace",
          "Snadná implementace se 3 fondy"
        ],
        cons: [
          "Střední volatilita",
          "Závislost na akciovém trhu",
          "Vyžaduje pravidelné rebalancování"
        ],
        suitableFor: [
          "Investory s umírněnou tolerancí rizika",
          "Investory s delším horizontem (10+ let)",
          "Ty, kteří chtějí vyvážený přístup"
        ]
      },
      
      stock: {
        strategy: "80% akcie + 20% nemovitosti pro maximální dlouhodobý růst s mírnou diverzifikací",
        pros: [
          "Nejvyšší dlouhodobý růstový potenciál",
          "Historicky nejlepší výnosy",
          "Jednoduchost s jen 2 fondy",
          "Nemovitosti poskytují diverzifikaci"
        ],
        cons: [
          "Vysoká volatilita a riziko",
          "Může klesat o 30-40% v krizích",
          "Psychicky náročné při poklesech",
          "Minimální ochrana kapitálu"
        ],
        suitableFor: [
          "Mladí agresivní investoři",
          "Horizont 15+ let",
          "Vysoká tolerance rizika",
          "Maximální růst s mírnou diverzifikací"
        ]
      },
      
      allweather: {
        strategy: "Risk-parity přístup navržený pro stabilní výkonnost ve všech ekonomických podmínkách podle Ray Dalia",
        pros: [
          "Stabilní výkonnost ve všech tržních podmínkách",
          "Ochrana proti inflaci prostřednictvím zlata a komodit",
          "Nízká korelace mezi třídami aktiv",
          "Vědecký risk-parity přístup"
        ],
        cons: [
          "Nižší výnos v bull trzích",
          "Složitější rebalancování (5 fondů)",
          "Vyšší náklady kvůli komoditám a zlatu",
          "Citlivost na úrokové sazby"
        ],
        suitableFor: [
          "Konzervativní investoři",
          "Investoři očekávající nejistotu",
          "Diverzifikace od tradičních portfolií"
        ]
      },
      
      dividend: {
        strategy: "95% dividend aristocrats + 5% REITs pro kombinaci dividendového příjmu a dlouhodobého růstu",
        pros: [
          "Pravidelný dividendový příjem (~4% ročně)",
          "Dividend aristocrats mají tradici růstu výplat",
          "Jednoduchost s jen 2 fondy",
          "Kvalitní defensivní společnosti"
        ],
        cons: [
          "Nižší růstový potenciál než akciová portfolia",
          "Závislost na dividendových akciích",
          "Může zaostávat v růstových periodách",
          "Koncentrace do vyspělých trhů"
        ],
        suitableFor: [
          "Investory hledající pasivní příjem",
          "Střední věk (35-50 let)",
          "Přípravu na důchod",
          "Ty, kteří preferují stabilní společnosti"
        ]
      }
    };
    
    return explanations[strategyType as keyof typeof explanations] || explanations.nobel;
  }

  // Get all available portfolio strategies for comparison
  getAvailablePortfolios() {
    return Object.entries(this.portfolioModels).map(([key, strategy]) => ({
      key,
      ...strategy
    }));
  }
}

export const portfolioEngine = new PortfolioRecommendationEngine();