'use client';

import React from 'react';

interface ETFCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const ETFCategoryTabs: React.FC<ETFCategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="mb-6">
      {/* Dropdown pro mobily */}
      <div className="block md:hidden">
        <select
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          aria-label="Vyberte kategorii ETF"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Taby pro větší obrazovky */}
      <div className="hidden md:block">
        <div
          role="tablist"
          aria-label="Kategorie ETF"
          className="grid w-full grid-cols-4 lg:grid-cols-5 gap-1 bg-gray-100 p-1 rounded-lg"
        >
          {categories.map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls={`tabpanel-${category.replace(/\s+/g, '-')}`}
              onClick={() => onCategoryChange(category)}
              className={`text-sm px-3 py-2 rounded-md font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ETFCategoryTabs;
