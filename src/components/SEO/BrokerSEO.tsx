import React from 'react';

interface BrokerSEOProps {
  brokerName?: string;
  year?: number;
}

const generateBrokerSchema = (brokerName?: string) => {
  const currentYear = new Date().getFullYear();
  
  if (brokerName) {
    // Get rating value based on broker
    const getRatingValue = (name: string) => {
      const ratings: { [key: string]: string } = {
        "Trading212": "4.6",
        "XTB": "4.4", 
        "DEGIRO": "4.5",
        "Interactive Brokers": "4.2",
        "Fio e-Broker": "3.9"
      };
      return ratings[name] || "4.0";
    };

    // Individual broker review schema
    return {
      "@context": "https://schema.org",
      "@type": "Review",
      "name": `${brokerName} recenze ${currentYear}`,
      "description": `Detailní recenze brokera ${brokerName} pro české investory. Poplatky, nabídka ETF, zkušenosti uživatelů a hodnocení.`,
      "author": {
        "@type": "Organization",
        "name": "ETF průvodce.cz",
        "url": "https://etfpruvodce.cz"
      },
      "itemReviewed": {
        "@type": "Service",
        "@id": `https://etfpruvodce.cz/${brokerName.toLowerCase().replace(/\s+/g, '-').replace('interactive-brokers', 'interactive-brokers').replace('fio-e-broker', 'fio-ebroker').replace('trading-212', 'trading212')}-recenze`,
        "name": brokerName,
        "category": "Financial Service",
        "serviceType": "Investment Broker",
        "description": `${brokerName} - online broker pro investování do ETF fondů`
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": getRatingValue(brokerName),
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewCount": 1,
      "datePublished": `${currentYear}-01-01`,
      "dateModified": new Date().toISOString().split('T')[0],
      "publisher": {
        "@type": "Organization",
        "name": "ETF průvodce.cz",
        "url": "https://etfpruvodce.cz"
      }
    };
  }
  
  // Broker comparison schema
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Srovnání brokerů pro ETF ${currentYear}`,
    "description": "Komplexní srovnání nejlepších brokerů pro investování do ETF fondů v České republice",
    "url": "https://etfpruvodce.cz/kde-koupit-etf",
    "numberOfItems": 5,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "DEGIRO",
        "description": "Populární broker s nízkými poplatky a širokou nabídkou ETF",
        "url": "https://etfpruvodce.cz/degiro-recenze"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "XTB",
        "description": "Polský broker s výbornou českou podporou a vzdělávacími materiály",
        "url": "https://etfpruvodce.cz/xtb-recenze"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Trading 212",
        "description": "Zcela bezpoplatkový broker s moderní aplikací a frakčním investováním",
        "url": "https://etfpruvodce.cz/trading212-recenze"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Interactive Brokers",
        "description": "Globální broker s nejširší nabídkou trhů a pokročilými nástroji",
        "url": "https://etfpruvodce.cz/interactive-brokers-recenze"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Fio e-Broker",
        "description": "Český broker s lokální podporou a optimálním zdaněním českých dividend",
        "url": "https://etfpruvodce.cz/fio-ebroker-recenze"
      }
    ]
  };
};

const generateFAQSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Který broker je nejlepší pro začátečníky?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pro začátečníky doporučujeme Trading 212 (pro uživatele ovládající angličtinu) nebo XTB (pro preferenci české podpory). Oba nabízejí nulové poplatky za ETF, intuitivní platformy a vzdělávací materiály."
        }
      },
      {
        "@type": "Question",
        "name": "Kolik stojí investování do ETF přes brokery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Náklady se liší podle brokera. Trading 212 a XTB nabízejí nulové poplatky za ETF obchody, DEGIRO účtuje 1-3 EUR za transakci, Interactive Brokers má velmi nízké poplatky a Fio e-Broker účtuje 0,29-0,35% z objemu."
        }
      },
      {
        "@type": "Question",
        "name": "Je investování přes zahraniční brokery bezpečné?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ano, pokud je broker regulován v EU. Všichni naši doporučení brokeři jsou regulováni (DEGIRO - Nizozemsko/Německo, XTB - Kypr/ČR, Trading 212 - UK/EU, Interactive Brokers - Irsko/USA) a nabízejí ochranu investorů podle evropských standardů."
        }
      },
      {
        "@type": "Question",
        "name": "Mohu investovat do amerických ETF přes evropské brokery?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evropští retailoví investoři nemohou přímo nakupovat americké ETF kvůli regulaci PRIIPS. Alternativou jsou evropské UCITS ETF, které často sledují stejné indexy jako americké protějšky."
        }
      },
      {
        "@type": "Question",
        "name": "Jak se daní zisky z ETF investic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "V ČR se kapitálové zisky z prodeje ETF daní 15% (nebo jsou osvobozené při držení nad 3 roky nebo do 100 000 Kč ročně). Dividendy z ETF se zdaňují podle země domicilu fondu, obvykle 15-35%."
        }
      }
    ]
  };
};

const generateBreadcrumbSchema = (brokerName?: string) => {
  const items = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Domů",
      "item": "https://etfpruvodce.cz"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Kde koupit ETF",
      "item": "https://etfpruvodce.cz/kde-koupit-etf"
    }
  ];

  if (brokerName) {
    items.push({
      "@type": "ListItem",
      "position": 3,
      "name": `${brokerName} recenze`,
      "item": `https://etfpruvodce.cz/${brokerName.toLowerCase().replace(/\s+/g, '-').replace('interactive-brokers', 'interactive-brokers').replace('fio-e-broker', 'fio-ebroker').replace('trading-212', 'trading212')}-recenze`
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
};

const BrokerSEO: React.FC<BrokerSEOProps> = ({ brokerName, year = new Date().getFullYear() }) => {
  return null; // This component only provides utility functions
};

export { generateBrokerSchema, generateFAQSchema, generateBreadcrumbSchema };
export default BrokerSEO;