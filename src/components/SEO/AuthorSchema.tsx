/**
 * Author Schema Component
 *
 * Provides structured data about the author (Tomáš Kostrhoun) and organization (ETF průvodce.cz)
 * Critical for E-E-A-T (Expertise, Experience, Authoritativeness, Trust) signals in Google
 *
 * Used for:
 * - Financial content authority
 * - Author attribution on articles
 * - Trust signals for YMYL (Your Money Your Life) content
 */

export default function AuthorSchema() {
  // Person schema - Tomáš Kostrhoun
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://www.etfpruvodce.cz/o-nas#tomas-kostrhoun",
    "name": "Tomáš Kostrhoun",
    "givenName": "Tomáš",
    "familyName": "Kostrhoun",
    "jobTitle": "Fintech Expert & Founder",
    "description": "Former Head of Loans & Mortgages at MONETA Money Bank with 12+ years in financial services. Led team of 30+ FTE, managed loan portfolio worth 150+ billion CZK, and launched first end-to-end online mortgage in Czech Republic. Currently building fintech platforms focused on personal finance, mortgages and ETF investing across CEE/EU regions.",

    // Work experience and credentials
    "alumniOf": {
      "@type": "Organization",
      "name": "MONETA Money Bank",
      "url": "https://www.moneta.cz",
      "sameAs": "https://en.wikipedia.org/wiki/Moneta_Money_Bank"
    },

    "worksFor": {
      "@type": "Organization",
      "@id": "https://www.etfpruvodce.cz#organization",
      "name": "ETF průvodce.cz",
      "url": "https://www.etfpruvodce.cz"
    },

    // Credentials and expertise
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "professional experience",
        "competencyRequired": "12+ years in banking and financial services",
        "educationalLevel": "Head of Loans & Mortgages at MONETA Money Bank"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "achievement",
        "competencyRequired": "Portfolio management",
        "educationalLevel": "Managed 150+ billion CZK loan portfolio"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "achievement",
        "competencyRequired": "Digital innovation",
        "educationalLevel": "Launched first end-to-end online mortgage in Czech Republic"
      },
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "leadership",
        "competencyRequired": "Team management",
        "educationalLevel": "Led team of 30+ FTE"
      }
    ],

    // Areas of expertise (important for topic authority)
    "knowsAbout": [
      "ETF investing",
      "Exchange Traded Funds",
      "Financial planning",
      "Czech financial markets",
      "Investment strategy",
      "Portfolio management",
      "Personal finance",
      "Asset allocation",
      "Index investing",
      "Banking",
      "Mortgage lending",
      "Consumer credit",
      "Financial products",
      "Risk management",
      "Digital banking",
      "Fintech innovation"
    ],

    // Contact and social proof
    "email": "info@etfpruvodce.cz",
    "url": "https://www.etfpruvodce.cz/o-nas",
    "sameAs": [
      "https://www.linkedin.com/in/tomas-kostrhoun-b34a6831",
      "https://x.com/ETFpruvodce"
    ],

    // Additional trust signals
    "nationality": {
      "@type": "Country",
      "name": "Czech Republic"
    },
    "workLocation": {
      "@type": "Place",
      "name": "Prague, Czech Republic"
    }
  };

  // Organization schema - ETF průvodce.cz
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "WebSite"],
    "@id": "https://www.etfpruvodce.cz#organization",
    "name": "ETF průvodce.cz",
    "legalName": "ETF průvodce.cz",
    "url": "https://www.etfpruvodce.cz",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.etfpruvodce.cz/logo.png",
      "width": 200,
      "height": 60,
      "caption": "ETF průvodce.cz logo"
    },
    "description": "Největší český průvodce ETF fondy. Srovnání 4300+ ETF fondů, aktuální výkonnost přepočítaná do českých korun, nezávislé recenze brokerů. Jedinečná databáze ETF pro české investory.",
    "foundingDate": "2024",
    "founder": {
      "@id": "https://www.etfpruvodce.cz/o-nas#tomas-kostrhoun"
    },
    "sameAs": [
      "https://x.com/ETFpruvodce"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "info@etfpruvodce.cz"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Czech Republic"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Czech investors",
      "geographicArea": {
        "@type": "Country",
        "name": "Czech Republic"
      }
    },
    // What the organization offers
    "knowsAbout": [
      "ETF funds comparison",
      "Investment education",
      "Broker reviews",
      "Financial calculators",
      "Portfolio strategies",
      "Czech market focus"
    ],
    "slogan": "Největší český průvodce ETF fondy"
  };

  return (
    <>
      {/* Author/Person schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      {/* Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
