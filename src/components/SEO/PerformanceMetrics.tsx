import React from 'react';

interface PerformanceMetricsProps {
  pageName: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ pageName }) => {
  React.useEffect(() => {
    // Measure and report Core Web Vitals
    const reportWebVitals = () => {
      // Track page load time
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          
          // Report to Google Analytics if available
          if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
              page_title: pageName,
              value: Math.round(loadTime),
              custom_parameter: 'page_performance'
            });
          }
        }
      }

      // Track Largest Contentful Paint (LCP)
      if ('web-vital' in window || 'PerformanceObserver' in window) {
        try {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (entry.entryType === 'largest-contentful-paint') {
                if (typeof gtag !== 'undefined') {
                  gtag('event', 'largest_contentful_paint', {
                    page_title: pageName,
                    value: Math.round(entry.startTime),
                    custom_parameter: 'core_web_vitals'
                  });
                }
              }
            });
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.log('LCP measurement not supported');
        }
      }
    };

    // Run after page is fully loaded
    if (document.readyState === 'complete') {
      reportWebVitals();
    } else {
      window.addEventListener('load', reportWebVitals);
    }

    return () => {
      window.removeEventListener('load', reportWebVitals);
    };
  }, [pageName]);

  return null;
};

declare global {
  function gtag(...args: any[]): void;
}

export default PerformanceMetrics;