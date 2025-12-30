/**
 * Universal Category Page Template
 * Server-side component for nejlepsi-etf/* pages with SSG
 */
import React from 'react';

import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { StarIcon, BarChart3Icon, TargetIcon, TrendingUpIcon, GlobeIcon, ShieldIcon, DollarSignIcon, UsersIcon, BuildingIcon, RocketIcon, FlagIcon } from '@/components/ui/icons';
import InternalLinking from '@/components/SEO/InternalLinking';
import Top3ETFServer from '@/components/etf/Top3ETFServer';
import ETFTableServer from '@/components/etf/ETFTableServer';
import type { ETFBasicInfo } from '@/lib/etf-data';

interface CategoryPageTemplateProps {
  // Page content
  title: string;
  subtitle: string;
  description: string;
  categorySlug: string;

  // Data (server-side fetched)
  etfs: ETFBasicInfo[];
  totalCount: number;
  lastModified: string;

  // Stats for hero section (optional customization)
  stats?: {
    icon: React.FC<{ className?: string }>;
    title: string;
    value: string;
    description: string;
    color: 'green' | 'blue' | 'purple' | 'indigo';
  }[];

  // Internal links
  relatedLinks: {
    href: string;
    text: string;
    description: string;
  }[];

  // FAQs for structured data and display
  faqs?: {
    question: string;
    answer: string;
  }[];

  // Guide sections (optional)
  guides?: {
    icon: React.FC<{ className?: string }>;
    title: string;
    color: 'green' | 'blue' | 'purple';
    recommendations: string[];
  }[];
}

export default function CategoryPageTemplate({
  title,
  subtitle,
  description,
  categorySlug,
  etfs,
  totalCount,
  lastModified,
  stats,
  relatedLinks,
  faqs = [],
  guides,
}: CategoryPageTemplateProps) {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Default stats if not provided
  const defaultStats = [
    { icon: DollarSignIcon, title: "Nejnižší TER", value: etfs[0]?.ter_numeric ? `${etfs[0].ter_numeric.toFixed(2)}%` : "0.03%", description: "Nejlevnější dostupné ETF", color: "green" as const },
    { icon: GlobeIcon, title: "Počet ETF", value: `${etfs.length}+`, description: "ETF v této kategorii", color: "blue" as const },
    { icon: ShieldIcon, title: "Největší fond", value: etfs[0]?.fund_size_numeric ? `${Math.round(etfs[0].fund_size_numeric / 1000)}B EUR` : "N/A", description: "Nejvyšší likvidita", color: "purple" as const },
    { icon: TrendingUpIcon, title: "Top výnos 1R", value: etfs.reduce((max, e) => Math.max(max, e.return_1y || 0), 0).toFixed(1) + "%", description: "Nejlepší roční výnos", color: "indigo" as const },
  ];

  const displayStats = stats || defaultStats;

  // FAQ structured data
  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Domů", "item": "https://www.etfpruvodce.cz" },
      { "@type": "ListItem", "position": 2, "name": "Nejlepší ETF", "item": "https://www.etfpruvodce.cz/nejlepsi-etf" },
      { "@type": "ListItem", "position": 3, "name": title, "item": `https://www.etfpruvodce.cz/nejlepsi-etf/${categorySlug}` }
    ]
  };

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${title} ${currentYear}`,
    "description": description,
    "image": `https://www.etfpruvodce.cz/og-${categorySlug}.jpg`,
    "author": { "@type": "Person", "name": "Tomáš Kostrhoun", "url": "https://www.etfpruvodce.cz/o-nas" },
    "publisher": { "@type": "Organization", "name": "ETF průvodce.cz", "logo": { "@type": "ImageObject", "url": "https://www.etfpruvodce.cz/logo.png" } },
    "datePublished": `${currentYear}-01-01`,
    "dateModified": lastModified,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://www.etfpruvodce.cz/nejlepsi-etf/${categorySlug}` },
    "about": etfs.slice(0, 5).map(etf => ({
      "@type": "FinancialProduct",
      "name": etf.name,
      "identifier": etf.isin
    }))
  };

  const colorMap = {
    green: "from-green-500 to-emerald-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-violet-500",
    indigo: "from-indigo-500 to-blue-500"
  };

  const guideColorMap = {
    green: "from-green-500 to-emerald-600",
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-violet-600"
  };

  return (
    <Layout>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50"></div>
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium border border-blue-200/50">
                <FlagIcon className="w-4 h-4 mr-2" />
                Aktuální k {currentDate}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {title}{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {currentYear}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>Autor: </span>
                <a href="/o-nas" className="text-violet-600 hover:text-violet-700 font-medium hover:underline">
                  Tomáš Kostrhoun
                </a>
                <span className="text-gray-400">|</span>
                <span>Aktualizováno: {new Date(lastModified).toLocaleDateString('cs-CZ')}</span>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                {subtitle}. Databáze obsahuje {totalCount.toLocaleString('cs-CZ')} ETF fondů.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg h-12">
                  <a href="#top3">
                    <StarIcon className="w-5 h-5 mr-2" />
                    Top 3 doporučení
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold h-12">
                  <a href="#srovnani">
                    <BarChart3Icon className="w-5 h-5 mr-2" />
                    Srovnání ETF
                  </a>
                </Button>
              </div>
            </div>

            {/* Right Content - Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {displayStats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`flex items-center justify-center rounded-full bg-gradient-to-r ${colorMap[item.color]} w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{item.title}</h3>
                    <p className="text-2xl font-bold text-center mb-1 text-gray-800">{item.value}</p>
                    <p className="text-gray-600 text-center text-sm">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Section */}
      <section id="top3" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top 3 {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Naše doporučení na základě analýzy {etfs.length} ETF fondů
            </p>
          </div>
          <Top3ETFServer etfs={etfs} currency="EUR" />
        </div>
      </section>

      {/* Full ETF Table */}
      <section id="srovnani" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kompletní srovnání {title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Top {Math.min(50, etfs.length)} ETF fondů seřazených podle velikosti a ratingu
            </p>
          </div>
          <ETFTableServer etfs={etfs} showRank={true} currency="EUR" maxRows={50} />
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-2">
              <a href="/srovnani-etf">
                Zobrazit všech {totalCount.toLocaleString('cs-CZ')} ETF fondů
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Guide Section (optional) */}
      {guides && guides.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-12 border border-blue-100 shadow-xl">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 w-20 h-20 mx-auto mb-6">
                  <TargetIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Jak vybrat {title.toLowerCase()}?
                </h3>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {guides.map((guide, index) => {
                  const Icon = guide.icon;
                  return (
                    <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${guideColorMap[guide.color]} flex items-center justify-center mb-6 mx-auto`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 text-center mb-6">{guide.title}</h4>
                      <ul className="space-y-3">
                        {guide.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section (if FAQs provided) */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Často kladené otázky
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internal Linking */}
      <InternalLinking
        links={relatedLinks.map(link => ({
          href: link.href,
          text: link.text,
          description: link.description
        }))}
      />
    </Layout>
  );
}
