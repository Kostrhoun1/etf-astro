'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ETFSearchResult {
  isin: string;
  name: string;
  primary_ticker?: string;
  fund_provider?: string;
}

interface GlobalETFSearchProps {
  className?: string;
  placeholder?: string;
}

const GlobalETFSearch: React.FC<GlobalETFSearchProps> = ({
  className = "",
  placeholder = "Hledat ETF podle ISIN, nazvu nebo tickeru..."
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ETFSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search ETFs
  const searchETFs = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/etf/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(data.results?.length > 0);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchETFs(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Navigate to ETF detail
  const handleSelectETF = (etf: ETFSearchResult) => {
    setQuery('');
    setIsOpen(false);
    window.location.href = `/etf/${etf.isin}`;
  };

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev < results.length - 1 ? prev + 1 : prev;
          // Scroll selected item into view
          const buttons = resultsRef.current?.querySelectorAll('button[role="option"]');
          buttons?.[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev > 0 ? prev - 1 : -1;
          if (next >= 0) {
            const buttons = resultsRef.current?.querySelectorAll('button[role="option"]');
            buttons?.[next]?.scrollIntoView({ block: 'nearest' });
          }
          return next;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectETF(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelectETF(results[0]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-3 md:py-2 min-h-[44px] md:min-h-0 bg-white/90 border border-gray-200 rounded-md text-base md:text-sm focus:border-violet-300 focus:ring-2 focus:ring-violet-200 focus:outline-none"
          aria-label="Vyhledávání ETF fondů"
          aria-autocomplete="list"
          aria-controls="etf-search-results"
          aria-expanded={isOpen && results.length > 0}
          role="combobox"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown with results */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          id="etf-search-results"
          role="listbox"
          aria-label="Výsledky vyhledávání ETF"
          aria-activedescendant={selectedIndex >= 0 ? `etf-option-${selectedIndex}` : undefined}
          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto min-w-full w-max max-w-2xl"
        >
          {results.map((etf, index) => (
            <button
              key={etf.isin}
              id={`etf-option-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelectETF(etf)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex
                  ? 'bg-violet-50 border-l-2 border-l-violet-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-medium text-gray-900 line-clamp-2 leading-5 mb-1">
                    {etf.name}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {etf.isin}
                    </span>
                    {etf.primary_ticker && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        {etf.primary_ticker}
                      </span>
                    )}
                    {etf.fund_provider && (
                      <span className="text-gray-600 text-xs">
                        {etf.fund_provider}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Footer for more results */}
          {results.length >= 10 && (
            <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t">
              Zobrazeno {results.length} vysledku.
              <a
                href={`/srovnani-etf?search=${encodeURIComponent(query)}`}
                className="ml-2 text-violet-600 hover:text-violet-700"
              >
                Pokrocile vyhledavani
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalETFSearch;
