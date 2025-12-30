import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'growth' | 'income' | 'balanced';
  amount: 'small' | 'medium' | 'large';
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface Recommendation {
  etfs: Array<{
    isin: string;
    name: string;
    reason: string;
    allocation: number; // percentage
    priority: number;
  }>;
  brokers: Array<{
    name: string;
    reason: string;
    pros: string[];
    cons: string[];
  }>;
  strategy: {
    title: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    expectedReturn: string;
    tips: string[];
  };
}

export class InvestmentRecommendationEngine {
  
  async getRecommendations(profile: UserProfile): Promise<Recommendation> {
    // Fetch relevant ETFs from database
    const etfPool = await this.fetchETFPool(profile);
    
    // Score and select ETFs based on profile
    const recommendedETFs = this.scoreAndSelectETFs(etfPool, profile);
    
    // Select brokers based on amount and preferences
    const recommendedBrokers = this.selectBrokers(profile);
    
    // Generate investment strategy
    const strategy = this.generateStrategy(profile);
    
    return {
      etfs: recommendedETFs,
      brokers: recommendedBrokers,
      strategy
    };
  }

  private async fetchETFPool(profile: UserProfile) {
    try {
      let query = supabase
        .from('etf_funds')
        .select(`
          isin, name, category, ter_numeric, fund_size_numeric,
          return_1y_percent, return_3y_percent, volatility_1y,
          degiro_free, current_dividend_yield_numeric,
          region, investment_focus
        `)
        .not('name', 'is', null)
        .not('ter_numeric', 'is', null)
;

      // Filter based on user profile
      if (profile.experience === 'beginner') {
        // Pro začátečníky - pouze populární a bezpečné ETF
        query = query
          .gte('fund_size_numeric', 1000) // Min 1B AUM
          .lte('ter_numeric', 0.5); // Max 0.5% TER
      }

      if (profile.goal === 'income') {
        // Pro dividend investory
        query = query.gte('current_dividend_yield_numeric', 1.5);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('Error fetching ETF pool:', error);
      return this.getFallbackETFs();
    }
  }

  private scoreAndSelectETFs(etfs: any[], profile: UserProfile) {
    const scoredETFs = etfs.map(etf => ({
      ...etf,
      score: this.calculateETFScore(etf, profile)
    }));

    // Sort by score and select top ones
    const topETFs = scoredETFs
      .sort((a, b) => b.score - a.score)
      .slice(0, this.getETFCount(profile));

    return this.formatETFRecommendations(topETFs, profile);
  }

  private calculateETFScore(etf: any, profile: UserProfile): number {
    let score = 0;

    // Base score from fundamentals
    score += this.scoreFundamentals(etf);
    
    // Profile-specific scoring
    score += this.scoreForExperience(etf, profile.experience);
    score += this.scoreForGoal(etf, profile.goal);
    score += this.scoreForAmount(etf, profile.amount);
    score += this.scoreForTimeHorizon(etf, profile.timeHorizon);

    return Math.round(score * 100) / 100;
  }

  private scoreFundamentals(etf: any): number {
    let score = 0;

    // TER scoring (lower is better)
    if (etf.ter_numeric <= 0.1) score += 20;
    else if (etf.ter_numeric <= 0.2) score += 15;
    else if (etf.ter_numeric <= 0.5) score += 10;
    else score += 5;

    // Fund size scoring (bigger is better for liquidity)
    if (etf.fund_size_numeric >= 10000) score += 15; // 10B+
    else if (etf.fund_size_numeric >= 5000) score += 12; // 5B+
    else if (etf.fund_size_numeric >= 1000) score += 10; // 1B+
    else score += 5;

    // Performance scoring (if available)
    if (etf.return_1y_percent > 15) score += 10;
    else if (etf.return_1y_percent > 8) score += 8;
    else if (etf.return_1y_percent > 0) score += 5;

    return score;
  }

  private scoreForExperience(etf: any, experience: string): number {
    let score = 0;

    if (experience === 'beginner') {
      // Začátečníci preferují jednoduché, široké ETF
      if (etf.category?.includes('World') || etf.category?.includes('Global')) score += 15;
      if (etf.investment_focus?.includes('Broad') || etf.name?.includes('All-World')) score += 10;
      if (etf.degiro_free) score += 8; // Důležité pro malé investice
    }
    
    if (experience === 'advanced') {
      // Pokročilí mohou zvládnout složitější strategie
      if (etf.category?.includes('Sector') || etf.category?.includes('Factor')) score += 10;
      if (etf.volatility_1y > 20) score += 5; // Tolerují vyšší volatilitu
    }

    return score;
  }

  private scoreForGoal(etf: any, goal: string): number {
    let score = 0;

    if (goal === 'growth') {
      // Růstové investování
      if (etf.region?.includes('North America') || etf.category?.includes('Technology')) score += 12;
      if (etf.category?.includes('Growth') || etf.category?.includes('Small Cap')) score += 10;
      if (etf.current_dividend_yield_numeric < 2) score += 5; // Preferuje reinvestice
    }

    if (goal === 'income') {
      // Dividendové investování
      if (etf.current_dividend_yield_numeric > 3) score += 15;
      else if (etf.current_dividend_yield_numeric > 2) score += 10;
      if (etf.category?.includes('Dividend') || etf.category?.includes('REIT')) score += 12;
      if (etf.name?.includes('High Dividend') || etf.name?.includes('Yield')) score += 8;
    }

    if (goal === 'balanced') {
      // Vyvážené portfolio
      if (etf.category?.includes('World') || etf.category?.includes('Balanced')) score += 12;
      if (etf.current_dividend_yield_numeric >= 1.5 && etf.current_dividend_yield_numeric <= 3) score += 8;
      if (etf.volatility_1y <= 15) score += 5; // Nižší volatilita
    }

    return score;
  }

  private scoreForAmount(etf: any, amount: string): number {
    let score = 0;

    if (amount === 'small') {
      // Malé investice - důležité jsou nízké poplatky
      if (etf.degiro_free) score += 15;
      if (etf.ter_numeric <= 0.15) score += 10;
    }

    if (amount === 'large') {
      // Velké investice - můžou si dovolit placené ETF s lepší performancí
      if (etf.fund_size_numeric >= 5000) score += 8;
      if (etf.return_3y_percent > 10) score += 6;
    }

    return score;
  }

  private scoreForTimeHorizon(etf: any, timeHorizon: string): number {
    let score = 0;

    if (timeHorizon === 'long') {
      // Dlouhodobé investování - může tolerovat volatilitu
      if (etf.category?.includes('Growth') || etf.category?.includes('Technology')) score += 10;
      if (etf.region?.includes('Emerging')) score += 8;
    }

    if (timeHorizon === 'short') {
      // Krátkodobé - konzervativní přístup
      if (etf.category?.includes('Bond') || etf.category?.includes('Government')) score += 12;
      if (etf.volatility_1y <= 10) score += 8;
    }

    return score;
  }

  private getETFCount(profile: UserProfile): number {
    if (profile.experience === 'beginner') return 2; // Jednoduché portfolio
    if (profile.experience === 'intermediate') return 3;
    return 4; // Pokročilí mohou zvládnout více ETF
  }

  private formatETFRecommendations(etfs: any[], profile: UserProfile) {
    return etfs.map((etf, index) => {
      const allocation = this.calculateAllocation(etfs, index, profile);
      const reason = this.generateETFReason(etf, profile);
      
      return {
        isin: etf.isin,
        name: etf.name,
        reason,
        allocation,
        priority: index + 1
      };
    });
  }

  private calculateAllocation(etfs: any[], index: number, profile: UserProfile): number {
    const count = etfs.length;
    
    if (profile.experience === 'beginner') {
      // Jednoduchá alokace pro začátečníky
      return index === 0 ? 70 : 30;
    }
    
    // Více sofistikovaná alokace
    const baseAllocation = 100 / count;
    const adjustments = [10, 5, -5, -10]; // První ETF dostane více
    
    return Math.max(10, baseAllocation + (adjustments[index] || 0));
  }

  private generateETFReason(etf: any, profile: UserProfile): string {
    const reasons = [];

    if (etf.ter_numeric <= 0.2) reasons.push('nízké poplatky');
    if (etf.degiro_free) reasons.push('zdarma na DEGIRO');
    if (etf.fund_size_numeric >= 5000) reasons.push('velký fond');
    if (etf.return_1y_percent > 10) reasons.push('dobrá výkonnost');

    if (profile.goal === 'income' && etf.current_dividend_yield_numeric > 2) {
      reasons.push(`${etf.current_dividend_yield_numeric.toFixed(1)}% dividendový výnos`);
    }

    if (profile.experience === 'beginner' && etf.category?.includes('World')) {
      reasons.push('široká diverzifikace vhodná pro začátečníky');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'vhodný pro váš profil';
  }

  private selectBrokers(profile: UserProfile) {
    const allBrokers = [
      {
        name: 'DEGIRO',
        pros: ['Zdarma vybrané ETF', 'Nízké poplatky', 'Regulace EU'],
        cons: ['Omezená customer podpora česky'],
        goodFor: ['small', 'medium']
      },
      {
        name: 'XTB',
        pros: ['0% poplatky do 100k EUR', 'Česká podpora', 'Profesionální platforma'],
        cons: ['Poplatky nad 100k EUR'],
        goodFor: ['medium', 'large']
      },
      {
        name: 'Trading212',
        pros: ['Kompletně zdarma', 'Jednoduchá aplikace', 'PIE portfolia'],
        cons: ['Mladší broker', 'Omezený výběr ETF'],
        goodFor: ['small', 'medium']
      },
      {
        name: 'Interactive Brokers',
        pros: ['Nejvíce ETF', 'Profesionální nástroje', 'Globální přístup'],
        cons: ['Vyšší minimální vklad', 'Složitější pro začátečníky'],
        goodFor: ['large']
      }
    ];

    return allBrokers
      .filter(broker => broker.goodFor.includes(profile.amount))
      .slice(0, 2)
      .map(broker => ({
        name: broker.name,
        reason: this.generateBrokerReason(broker, profile),
        pros: broker.pros,
        cons: broker.cons
      }));
  }

  private generateBrokerReason(broker: any, profile: UserProfile): string {
    if (broker.name === 'DEGIRO' && profile.amount === 'small') {
      return 'Ideální pro začátečníky díky bezplatným ETF';
    }
    if (broker.name === 'XTB' && profile.amount === 'medium') {
      return 'Nejvýhodnější pro střední investice';
    }
    return 'Vhodný pro váš typ investování';
  }

  private generateStrategy(profile: UserProfile) {
    const strategies = {
      'beginner-growth-long': {
        title: 'Začátečník - Dlouhodobý růst',
        description: 'Jednoduché portfolio se 2 ETF pro dlouhodobé zhodnocení. Ideální začátek do světa ETF investování.',
        riskLevel: 'medium' as const,
        expectedReturn: '7-10% ročně',
        tips: [
          'Investujte pravidelně každý měsíc',
          'Nereagujte na krátkodobé výkyvy trhů',
          'Reinvestujte dividendy pro složené úročení',
          'Zvažte zvýšení investic s rostoucími příjmy'
        ]
      },
      'advanced-income-medium': {
        title: 'Pokročilý - Dividendové příjmy',
        description: 'Diverzifikované portfolio zaměřené na generování pasivního příjmu prostřednictvím dividend.',
        riskLevel: 'low' as const,
        expectedReturn: '4-7% ročně + dividendy',
        tips: [
          'Sledujte ex-dividend data pro optimální nákupy',
          'Diverzifikujte mezi regiony a sektory',
          'Zvažte reinvestice vs. výběr dividend',
          'Monitorujte udržitelnost dividendových výnosů'
        ]
      }
    };

    const key = `${profile.experience}-${profile.goal}-${profile.timeHorizon}`;
    
    return strategies[key as keyof typeof strategies] || {
      title: 'Vyvážená strategie',
      description: 'Kombinace růstu a stability pro dlouhodobé budování bohatství.',
      riskLevel: 'medium' as const,
      expectedReturn: '6-9% ročně',
      tips: [
        'Pravidelné investice snižují riziko',
        'Diverzifikace je klíčová',
        'Mějte dlouhodobý horizont',
        'Přizpůsobte strategii změnám v životě'
      ]
    };
  }

  private getFallbackETFs() {
    // Fallback pro případ chyby API
    return [
      { isin: 'IE00B4L5Y983', name: 'Vanguard FTSE All-World UCITS ETF', category: 'World', ter_numeric: 0.22 },
      { isin: 'IE00B5BMR087', name: 'iShares Core S&P 500 UCITS ETF', category: 'US Large Cap', ter_numeric: 0.07 },
      { isin: 'IE00B4K48X80', name: 'iShares Core MSCI Europe UCITS ETF', category: 'Europe', ter_numeric: 0.12 }
    ];
  }
}

// Singleton instance
export const recommendationEngine = new InvestmentRecommendationEngine();