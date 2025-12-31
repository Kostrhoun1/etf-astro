import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface RelatedLink {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

interface InternalLinkingProps {
  relatedLinks?: RelatedLink[];
  title?: string;
  className?: string;
  currentPage?: string;
  links?: RelatedLink[];
}

const InternalLinking: React.FC<InternalLinkingProps> = ({ 
  relatedLinks, 
  title = "Související články a nástroje",
  className = "",
  currentPage,
  links
}) => {
  // Use links prop as fallback for relatedLinks
  const linksToRender = relatedLinks || links;
  
  if (!linksToRender || linksToRender.length === 0) return null;

  return (
    <section className={`bg-gray-50 rounded-lg p-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {linksToRender.map((link, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                {link.icon}
                <CardTitle className="text-lg">{link.title}</CardTitle>
              </div>
              <CardDescription className="text-sm">
                {link.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <a
                href={link.href}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm group"
              >
                Přečíst více
                <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Predefined link sets for different page types
export const ETFGuideRelatedLinks: RelatedLink[] = [
  {
    title: "Srovnání ETF fondů",
    description: "Porovnejte více než 4300 ETF fondů podle kategorií, poplatků a výkonnosti",
    href: "/srovnani-etf",
    icon: <span className="text-blue-600">📈</span>
  },
  {
    title: "Kde koupit ETF",
    description: "Najděte nejlepšího brokera pro investování do ETF fondů",
    href: "/kde-koupit-etf",
    icon: <span className="text-green-600">📖</span>
  },
  {
    title: "Investiční kalkulačky",
    description: "Spočítejte si potenciální výnosy a poplatky u ETF investic",
    href: "/kalkulacky",
    icon: <span className="text-purple-600">🧮</span>
  }
];

export const BrokerGuideRelatedLinks: RelatedLink[] = [
  {
    title: "Co jsou ETF fondy?",
    description: "Kompletní průvodce ETF fondy pro začátečníky",
    href: "/co-jsou-etf",
    icon: <span className="text-blue-600">📖</span>
  },
  {
    title: "Srovnání ETF fondů",
    description: "Najděte nejlepší ETF fondy pro vaši investiční strategii",
    href: "/srovnani-etf",
    icon: <span className="text-green-600">📈</span>
  },
  {
    title: "DEGIRO recenze",
    description: "Detailní recenze populárního nizozemského brokera",
    href: "/degiro-recenze",
    icon: <span className="text-orange-600">🏦</span>
  },
  {
    title: "Portu recenze",
    description: "Recenze českého robo-advisora pro automatizované investování",
    href: "/portu-recenze",
    icon: <span className="text-blue-600">🤖</span>
  },
  {
    title: "Investiční kalkulačka",
    description: "Spočítejte si budoucí hodnotu vašich investic",
    href: "/kalkulacky/investicni-kalkulacka",
    icon: <span className="text-purple-600">🧮</span>
  },
  {
    title: "Úvěrová kalkulačka",
    description: "Kalkulačka splátek spotřebitelského úvěru",
    href: "/kalkulacky/uverova-kalkulacka",
    icon: <span className="text-emerald-600">💳</span>
  }
];

export const ToolsRelatedLinks: RelatedLink[] = [
  {
    title: "Návod pro začátečníky",
    description: "Kompletní průvodce jak začít investovat do ETF",
    href: "/co-jsou-etf/jak-zacit-investovat",
    icon: <span className="text-blue-600">📖</span>
  },
  {
    title: "Srovnání ETF fondů",
    description: "Porovnejte ETF fondy podle různých kritérií",
    href: "/srovnani-etf",
    icon: <span className="text-green-600">📈</span>
  },
  {
    title: "Nejlepší ETF 2026",
    description: "Doporučené ETF fondy pro české investory",
    href: "/nejlepsi-etf/nejlepsi-etf-2026",
    icon: <span className="text-purple-600">💡</span>
  }
];

export default InternalLinking;