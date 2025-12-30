import React from 'react';

import { Button } from '../ui/button';

interface CTASectionProps {
  totalCount: number;
}

const CTASection: React.FC<CTASectionProps> = ({ totalCount }) => {
  const displayCount = totalCount > 0 ? Math.floor(totalCount / 100) * 100 : 4300;

  return (
    <section className="py-16 bg-violet-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4 tracking-tight">
          Jste připraveni začít investovat?
        </h2>
        <p className="text-lg text-violet-200 mb-8 max-w-2xl mx-auto">
          Srovnejte si přes {displayCount.toLocaleString()}+ ETF a vytvořte si ideální portfolio ještě dnes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary" className="bg-white text-violet-700 hover:bg-gray-100 hover:text-violet-700 font-semibold">
            <a href="/srovnani-etf">Srovnat ETF fondy</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-white border-white/70 bg-transparent hover:bg-white hover:text-violet-700">
            <a href="/co-jsou-etf">Zjistit více o ETF</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;