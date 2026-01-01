'use client';

import React, { useEffect } from 'react';

const GlobalSEO: React.FC = () => {
  useEffect(() => {
    // Add critical performance and SEO meta tags
    const addMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Critical performance tags
    addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    addMetaTag('theme-color', '#7c3aed');
    addMetaTag('color-scheme', 'light dark');
    
    // Enhanced SEO tags
    addMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    addMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    addMetaTag('bingbot', 'index, follow');
    
    // Language and location
    addMetaTag('language', 'cs');
    addMetaTag('geo.region', 'CZ');
    addMetaTag('geo.country', 'Czech Republic');
    
    // Content classification
    addMetaTag('content-language', 'cs');
    addMetaTag('distribution', 'global');
    addMetaTag('rating', 'general');
    addMetaTag('revisit-after', '3 days');
    
    // Social media optimization
    addMetaTag('twitter:card', 'summary_large_image', true);
    addMetaTag('twitter:site', '@etfpruvodce', true);
    addMetaTag('twitter:creator', '@etfpruvodce', true);
    
    // Open Graph enhancements
    addMetaTag('og:site_name', 'ETF průvodce.cz', true);
    addMetaTag('og:locale', 'cs_CZ', true);
    addMetaTag('og:locale:alternate', 'en_US', true);
    
    // Performance hints
    addMetaTag('dns-prefetch-control', 'on');
    
    // Add preconnect links for external domains
    const addPreconnectLink = (href: string) => {
      let link = document.querySelector(`link[rel="preconnect"][href="${href}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'preconnect');
        link.setAttribute('href', href);
        document.head.appendChild(link);
      }
    };

    addPreconnectLink('https://fonts.googleapis.com');
    addPreconnectLink('https://fonts.gstatic.com');
    addPreconnectLink('https://www.googletagmanager.com');
    addPreconnectLink('https://www.google-analytics.com');
    
    // Add structured data for organization
    let organizationScript = document.querySelector('script[type="application/ld+json"][data-organization="true"]');
    if (!organizationScript) {
      organizationScript = document.createElement('script');
      organizationScript.setAttribute('type', 'application/ld+json');
      organizationScript.setAttribute('data-organization', 'true');
      document.head.appendChild(organizationScript);
      
      const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "ETF průvodce.cz",
        "url": "https://etfpruvodce.cz",
        "logo": {
          "@type": "ImageObject",
          "url": "https://etfpruvodce.cz/og-image.jpg"
        },
        "description": "Komplexní průvodce ETF fondy pro české investory. Srovnání, analýza a vzdělávací obsah o investování.",
        "foundingDate": "2024",
        "areaServed": {
          "@type": "Country",
          "name": "Czech Republic"
        },
        "knowsAbout": [
          "ETF fondy",
          "Investování",
          "Finanční trhy",
          "Brokeři",
          "Pasivní investování",
          "Index fondy"
        ],
        "sameAs": [
          "https://etfpruvodce.cz"
        ]
      };
      
      organizationScript.textContent = JSON.stringify(organizationData);
    }

  }, []);

  return null;
};

export default GlobalSEO;