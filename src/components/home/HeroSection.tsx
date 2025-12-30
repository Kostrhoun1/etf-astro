import React from 'react';


interface HeroSectionProps {
  totalCount: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ totalCount }) => {
  const displayCount = 4300; // Konzistentní zobrazení napříč celou aplikací

  return (
    <section className="bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 opacity-80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight animate-fade-in">
            ETF fondy - Kompletní průvodce
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-slate-300 animate-fade-in max-w-3xl">
            Co je ETF a jak investovat? Srovnání {displayCount.toLocaleString()}+ ETF fondů pro české investory.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <a
              href="/srovnani-etf"
              className="inline-flex items-center justify-center hover-scale bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-lg font-medium rounded-md transition-colors"
            >
              Porovnat ETF fondy
            </a>
            <a
              href="/co-jsou-etf"
              className="inline-flex items-center justify-center border-white/70 text-gray-900 bg-white hover:bg-gray-100 hover:text-gray-900 hover-scale px-8 py-3 text-lg font-medium rounded-md transition-colors"
            >
              Co jsou ETF?
            </a>
            <a
              href="/portfolio-strategie"
              className="inline-flex items-center justify-center hover-scale bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3 text-lg rounded-md transition-colors"
            >
              <span className="mr-2">📊</span>
              Vytvořit portfolio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;