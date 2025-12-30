import React from 'react';

interface RatingCategory {
  name: string;
  score: number;
  description?: string;
}

interface BrokerRatingGridProps {
  overallRating: number;
  overallDescription?: string;
  categories: RatingCategory[];
}

const getScoreColor = (score: number) => {
  if (score >= 91) return 'bg-green-500';
  if (score >= 81) return 'bg-blue-500';
  if (score >= 66) return 'bg-yellow-500';
  if (score >= 41) return 'bg-orange-500';
  return 'bg-red-500';
};

const getScoreLabel = (score: number) => {
  if (score >= 91) return 'Vynikající';
  if (score >= 81) return 'Velmi dobré';
  if (score >= 66) return 'Dobré';
  if (score >= 41) return 'Průměrné';
  return 'Slabé';
};

const BrokerRatingGrid: React.FC<BrokerRatingGridProps> = ({
  overallRating,
  overallDescription,
  categories
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profesionální karta s glassmorphism efektem - horizontální layout */}
      <div className="relative bg-gradient-to-br from-white/90 to-gray-50/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl shadow-gray-900/10">
        
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          
          {/* Levá strana - Celkové hodnocení */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              
              {/* Hlavní kruh */}
              <div className="relative">
                <div className="relative w-24 h-24">
                  {/* Gradient background circle */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
                  
                  {/* SVG progress circle */}
                  <svg className="w-24 h-24 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-gray-200/50"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#gradient)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${overallRating * 2.64} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={
                          overallRating >= 91 ? '#10b981' :
                          overallRating >= 81 ? '#3b82f6' :
                          overallRating >= 66 ? '#f59e0b' :
                          overallRating >= 41 ? '#f97316' : '#ef4444'
                        } />
                        <stop offset="100%" stopColor={
                          overallRating >= 91 ? '#059669' :
                          overallRating >= 81 ? '#1d4ed8' :
                          overallRating >= 66 ? '#d97706' :
                          overallRating >= 41 ? '#ea580c' : '#dc2626'
                        } />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Středový text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {overallRating}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      bodů
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Info o celkovém hodnocení */}
              <div className="flex flex-col items-center lg:items-start">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Celkové hodnocení</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg mb-2 ${
                  overallRating >= 91 ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                  overallRating >= 81 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                  overallRating >= 66 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' :
                  overallRating >= 41 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 
                  'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                }`}>
                  {getScoreLabel(overallRating)}
                </div>
                {overallDescription && (
                  <div className="text-sm text-gray-600 max-w-xs leading-relaxed">
                    {overallDescription}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertikální dělítko */}
          <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
          
          {/* Horizontální dělítko pro mobily */}
          <div className="lg:hidden w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500 font-medium">Detailní hodnocení</span>
              </div>
            </div>
          </div>

          {/* Pravá strana - Kategorie */}
          <div className="flex-1 w-full">
            
            {/* Grid kategorií - 2 sloupce na větších obrazovkách */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{category.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      category.score >= 91 ? 'text-emerald-600' :
                      category.score >= 81 ? 'text-blue-600' :
                      category.score >= 66 ? 'text-amber-600' :
                      category.score >= 41 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {category.score}%
                    </span>
                  </div>
                  
                  {/* Moderní progress bar */}
                  <div className="relative">
                    <div className="overflow-hidden h-2.5 bg-gray-100 rounded-full shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                          category.score >= 91 ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500' :
                          category.score >= 81 ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500' :
                          category.score >= 66 ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500' :
                          category.score >= 41 ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-red-500' : 
                          'bg-gradient-to-r from-red-400 via-red-500 to-rose-500'
                        }`}
                        style={{ 
                          width: `${category.score}%`,
                          transform: 'translateZ(0)' // GPU acceleration
                        }}
                      ></div>
                    </div>
                    
                    {/* Subtle glow effect */}
                    <div 
                      className={`absolute inset-y-0 left-0 rounded-full opacity-20 blur-sm transition-all duration-1000 ${
                        category.score >= 91 ? 'bg-emerald-300' :
                        category.score >= 81 ? 'bg-blue-300' :
                        category.score >= 66 ? 'bg-yellow-300' :
                        category.score >= 41 ? 'bg-orange-300' : 'bg-red-300'
                      }`}
                      style={{ width: `${Math.min(category.score, 100)}%` }}
                    ></div>
                  </div>
                  
                  {/* Popis kategorie */}
                  {category.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {category.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default BrokerRatingGrid;