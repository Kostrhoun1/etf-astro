import React from 'react';

interface StructuredDataProps {
  data: object;
  id?: string;
}

const StructuredData: React.FC<StructuredDataProps> = ({ data, id }) => {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
};

// Specific structured data components for different page types
export const OrganizationStructuredData: React.FC = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "ETF průvodce.cz",
    "description": "Komplexní průvodce ETF fondy pro české investory",
    "url": "https://www.etfpruvodce.cz",
    "logo": "https://www.etfpruvodce.cz/og-image.jpg",
    "foundingDate": "2024",
    "areaServed": {
      "@type": "Country",
      "name": "Czech Republic"
    },
    "serviceType": "Financial Information Service",
    "knowsLanguage": "cs",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@etfpruvodce.cz"
    },
    "sameAs": [
      "https://www.etfpruvodce.cz"
    ]
  };

  return <StructuredData data={organizationData} id="organization-data" />;
};

export const FAQStructuredData: React.FC<{ faqs: Array<{ question: string; answer: string }> }> = ({ faqs }) => {
  const faqData = {
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
  };

  return <StructuredData data={faqData} id="faq-data" />;
};

export const HowToStructuredData: React.FC<{
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>
}> = ({ name, description, steps }) => {
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.image && {
        "image": {
          "@type": "ImageObject",
          "url": step.image
        }
      })
    }))
  };

  return <StructuredData data={howToData} id="howto-data" />;
};

export const FinancialProductStructuredData: React.FC<{
  name: string;
  description: string;
  provider: string;
  category: string;
  url?: string;
}> = ({ name, description, provider, category, url }) => {
  const productData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": name,
    "description": description,
    "category": category,
    "provider": {
      "@type": "Organization",
      "name": provider
    },
    "url": url || ''
  };

  return <StructuredData data={productData} id="financial-product-data" />;
};

export default StructuredData;