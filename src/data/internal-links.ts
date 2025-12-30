// Predefined link sets for different page types

interface RelatedLink {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

export const ETFGuideRelatedLinks: RelatedLink[] = [
  {
    title: "Srovnání ETF fondů",
    description: "Porovnejte více než 4300 ETF fondů podle kategorií, poplatků a výkonnosti",
    href: "/srovnani-etf",
    icon: "📈"
  },
  {
    title: "Kde koupit ETF",
    description: "Najděte nejlepšího brokera pro investování do ETF fondů",
    href: "/kde-koupit-etf",
    icon: "📖"
  },
  {
    title: "Investiční kalkulačky",
    description: "Spočítejte si potenciální výnosy a poplatky u ETF investic",
    href: "/kalkulacky",
    icon: "🧮"
  }
];

export const BrokerGuideRelatedLinks: RelatedLink[] = [
  {
    title: "Co jsou ETF fondy?",
    description: "Kompletní průvodce ETF fondy pro začátečníky",
    href: "/co-jsou-etf",
    icon: "📖"
  },
  {
    title: "Srovnání ETF fondů",
    description: "Najděte nejlepší ETF fondy pro vaši investiční strategii",
    href: "/srovnani-etf",
    icon: "📈"
  },
  {
    title: "DEGIRO recenze",
    description: "Detailní recenze populárního nizozemského brokera",
    href: "/degiro-recenze",
    icon: "🏦"
  },
  {
    title: "Portu recenze",
    description: "Recenze českého robo-advisora pro automatizované investování",
    href: "/portu-recenze",
    icon: "🤖"
  },
  {
    title: "Investiční kalkulačka",
    description: "Spočítejte si budoucí hodnotu vašich investic",
    href: "/kalkulacky/investicni-kalkulacka",
    icon: "🧮"
  },
  {
    title: "Úvěrová kalkulačka",
    description: "Kalkulačka splátek spotřebitelského úvěru",
    href: "/kalkulacky/uverova-kalkulacka",
    icon: "💳"
  }
];

export const ToolsRelatedLinks: RelatedLink[] = [
  {
    title: "Návod pro začátečníky",
    description: "Kompletní průvodce jak začít investovat do ETF",
    href: "/co-jsou-etf/jak-zacit-investovat",
    icon: "📖"
  },
  {
    title: "Srovnání ETF fondů",
    description: "Porovnejte ETF fondy podle různých kritérií",
    href: "/srovnani-etf",
    icon: "📈"
  },
  {
    title: "Investiční tipy",
    description: "Užitečné články o investování do ETF fondů",
    href: "/tipy",
    icon: "💡"
  }
];
