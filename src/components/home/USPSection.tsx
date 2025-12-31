import React from "react";
import { BarChartIcon, BookOpenIcon, CalculatorIcon, DollarSignIcon } from "../ui/icons";
import { Card } from "../ui/card";

const usp = [
  {
    icon: DollarSignIcon,
    title: "Výkonnost v CZK",
    description: "Jako jediní zobrazujeme reálné výnosy ETF přepočítané do českých korun.",
  },
  {
    icon: BarChartIcon,
    title: "4 300+ ETF fondů",
    description: "Kompletní databáze ETF z celého světa se srovnáním výnosů a poplatků.",
  },
  {
    icon: CalculatorIcon,
    title: "Srovnání brokerů",
    description: "Přehledný výběr brokerů podle poplatků a nabídky ETF zdarma.",
  },
  {
    icon: BookOpenIcon,
    title: "Investiční nástroje",
    description: "Kalkulačky, simulace portfolia a tipy na nejlepší ETF fondy.",
  },
];

const USPSection: React.FC = () => (
  <section className="bg-white py-6 md:py-8">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {usp.map((item) =>
          <Card key={item.title} className="flex flex-col items-center text-center py-4 md:py-5 px-3 border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
            <div className="mb-3 flex items-center justify-center rounded-full bg-violet-100 w-12 h-12 group-hover:bg-violet-200 transition-colors">
              <item.icon className="h-6 w-6 text-violet-700" aria-hidden="true" />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
          </Card>
        )}
      </div>
    </div>
  </section>
);

export default USPSection;