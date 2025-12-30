'use client';

import React from 'react';
import { TrendingUpIcon, DollarSignIcon, BuildingIcon, GlobeIcon } from '@/components/ui/icons';
import FilteredETFList from '@/components/blog/FilteredETFList';

// Icon mapping to avoid passing React components as props
const iconMap = {
  DollarSign: DollarSignIcon,
  Building: BuildingIcon,
  TrendingUp: TrendingUpIcon,
  Globe: GlobeIcon
};

// Color scheme mappings
const colorSchemes = {
  red: {
    icon: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200"
  },
  orange: {
    icon: "text-orange-600", 
    bg: "bg-orange-50",
    border: "border-orange-200"
  },
  yellow: {
    icon: "text-yellow-600",
    bg: "bg-yellow-50", 
    border: "border-yellow-200"
  },
  green: {
    icon: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200"
  },
  blue: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200"
  },
  purple: {
    icon: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200"
  },
  indigo: {
    icon: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200"
  },
  gray: {
    icon: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200"
  },
  slate: {
    icon: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200"
  },
  zinc: {
    icon: "text-zinc-600",
    bg: "bg-zinc-50",
    border: "border-zinc-200"
  },
  teal: {
    icon: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200"
  },
  cyan: {
    icon: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200"
  },
  pink: {
    icon: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200"
  },
  rose: {
    icon: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200"
  }
};

interface Section {
  title: string;
  description: string;
  icon: string; // Icon name as string
  colorScheme: keyof typeof colorSchemes;
  filter: any;
}

interface FilteredETFSectionsProps {
  sectionId?: string;
  sections?: Section[];
  // Legacy props for backward compatibility
  indexKeywords?: string[];
  excludeKeywords?: string[];
}

export default function FilteredETFSections({ 
  sectionId = "srovnani", 
  sections, 
  indexKeywords, 
  excludeKeywords = ["China", "KraneShares", "Sector"] 
}: FilteredETFSectionsProps) {
  
  // Legacy fallback - if no sections provided, use the old API
  if (!sections && indexKeywords) {
    return (
      <section id={sectionId} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* TOP 10 podle TER */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <DollarSignIcon className="w-8 h-8 text-green-600" />
                Nejnižší poplatky
              </h3>
              <p className="text-gray-600 text-lg">ETF seřazené podle nejnižšího TER - ideální pro minimalizaci nákladů</p>
            </div>
            <FilteredETFList 
              filter={{
                nameKeywords: indexKeywords,
                excludeNameKeywords: excludeKeywords,
                excludeLeveraged: true,
                top: 10,
                sortBy: "ter_numeric",
                sortOrder: "asc",
                minFundSize: 1
              }}
            />
          </div>

          {/* TOP 10 podle velikosti */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <BuildingIcon className="w-8 h-8 text-blue-600" />
                Největší fondy
              </h3>
              <p className="text-gray-600 text-lg">ETF seřazené podle velikosti fondu - nejvyšší likvidita a nejnižší spread</p>
            </div>
            <FilteredETFList 
              filter={{
                nameKeywords: indexKeywords,
                excludeNameKeywords: excludeKeywords,
                excludeLeveraged: true,
                top: 10,
                sortBy: "fund_size_numeric",
                sortOrder: "desc",
                minFundSize: 1
              }}
            />
          </div>

          {/* TOP 10 podle 1Y výkonnosti */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <TrendingUpIcon className="w-8 h-8 text-purple-600" />
                Nejlepší 1Y výkonnost
              </h3>
              <p className="text-gray-600 text-lg">ETF seřazené podle 1-ročního výnosu - nejlepší recent performance</p>
            </div>
            <FilteredETFList 
              filter={{
                nameKeywords: indexKeywords,
                excludeNameKeywords: excludeKeywords,
                excludeLeveraged: true,
                top: 10,
                sortBy: "return_1y",
                sortOrder: "desc",
                minFundSize: 1
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  // New API - render sections dynamically
  return (
    <section id={sectionId} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sections?.map((section, index) => {
          // Get icon component by name
          const IconComponent = iconMap[section.icon as keyof typeof iconMap] || DollarSignIcon;
          const colors = colorSchemes[section.colorScheme] || colorSchemes.blue;
          
          return (
            <div key={index} className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                  <IconComponent className={`w-8 h-8 ${colors.icon}`} />
                  {section.title}
                </h3>
                <p className="text-gray-600 text-lg">{section.description}</p>
              </div>
              <FilteredETFList filter={section.filter} />
            </div>
          );
        })}
      </div>
    </section>
  );
}