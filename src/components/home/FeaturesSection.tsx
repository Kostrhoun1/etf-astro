import React from "react";

import { BarChartIcon, SearchIcon, BookOpenIcon, CalculatorIcon, FileTextIcon, TrendingUpIcon } from "../ui/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

const features = [
  {
    icon: SearchIcon,
    title: "Srovnávač ETF fondů",
    description: "Porovnejte více než 4 300 ETF fondů podle nákladovosti, výkonnosti nebo strategie. Nejkomplexnější český srovnávač ETF.",
    link: "/srovnani-etf",
    cta: "Porovnat ETF"
  },
  {
    icon: BarChartIcon,
    title: "Srovnání brokerů",
    description: "Detailní srovnání 6 hlavních brokerů z pohledu českého investora. Přehled poplatků, platformy a vhodnosti pro ETF investování.",
    link: "/kde-koupit-etf",
    cta: "Srovnat brokery"
  },
  {
    icon: CalculatorIcon,
    title: "Investiční nástroje a kalkulačky",
    description: "Zkuste investiční kalkulačku, vizualizaci složeného úročení, porovnejte náklady a simulujte vývoj portfolia pomocí Monte Carlo.",
    link: "/kalkulacky",
    cta: "Otevřít nástroje"
  },
  {
    icon: BookOpenIcon,
    title: "Vzdělávací obsah a blog",
    description: "Tipy pro začátečníky i pokročilé. Průvodci, srovnávací články a odpovědi na nejčastější otázky o ETF investování.",
    link: "/tipy",
    cta: "Číst články"
  },
  {
    icon: FileTextIcon,
    title: "Nejlepší ETF v roce 2026",
    description: "Pravidelně aktualizovaný žebříček nejlepších českých ETF podle různých kritérií - zařaďte se mezi úspěšné investory.",
    link: "/nejlepsi-etf/nejlepsi-etf-2026",
    cta: "Zjistit více"
  },
  {
    icon: TrendingUpIcon,
    title: "Newsletter & novinky",
    description: "Získejte aktuální investiční tipy, novinky a nejnovější články pohodlně do e-mailu. Jednou měsíčně, bez spamu.",
    link: "#newsletter",
    cta: "Přihlásit se"
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-violet-50 to-indigo-100 py-16" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="features-heading" className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
          Co všechno u nás najdete?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, link, cta }) => (
            <Card key={title} className="flex flex-col items-center text-center p-7 rounded-xl shadow hover:shadow-xl transition-shadow h-full bg-white">
              <div className="flex items-center justify-center mb-5">
                <span className="p-4 bg-violet-100 rounded-full">
                  <Icon className="h-8 w-8 text-violet-600" aria-hidden="true" />
                </span>
              </div>
              <CardHeader className="p-0 mb-2">
                <CardTitle>
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mb-6">
                <p className="text-gray-600">{description}</p>
              </CardContent>
              <Button asChild size="sm" className="bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors">
                <a href={link}>{cta}</a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;