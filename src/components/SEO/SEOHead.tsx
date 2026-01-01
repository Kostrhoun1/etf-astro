'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  schema?: object;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonical,
  keywords,
  ogImage = 'https://www.etfpruvodce.cz/og-image.jpg',
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  schema,
  structuredData
}) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Helper function to set link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    // Basic meta tags
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    if (author) setMetaTag('author', author);

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:type', ogType, true);
    // Always use www variant for canonical URL
    const currentUrl = canonical || `https://www.etfpruvodce.cz${window.location.pathname}`;
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:site_name', 'ETF průvodce.cz', true);

    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', ogImage, true);
    setMetaTag('twitter:site', '@ETFPruvodce', true);
    setMetaTag('twitter:creator', '@ETFPruvodce', true);
    
    // Facebook/LinkedIn specific tags
    setMetaTag('fb:app_id', '1234567890', true);
    setMetaTag('og:locale', 'cs_CZ', true);
    setMetaTag('og:locale:alternate', 'en_US', true);
    
    // Additional meta tags for better SEO
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('language', 'cs');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('distribution', 'global');
    setMetaTag('rating', 'general');
    setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Article specific tags
    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime, true);
    }
    if (author) {
      setMetaTag('article:author', author, true);
    }

    // Canonical URL
    if (canonical) {
      setLinkTag('canonical', canonical);
    }

    // JSON-LD structured data
    if (schema) {
      let scriptTag = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
      
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.setAttribute('data-seo', 'true');
        document.head.appendChild(scriptTag);
      }
      
      scriptTag.textContent = JSON.stringify(schema);
    }

  }, [title, description, canonical, keywords, ogImage, ogType, publishedTime, modifiedTime, author, schema]);

  return null;
};

export default SEOHead;