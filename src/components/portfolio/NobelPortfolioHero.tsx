import React from 'react';

import { Badge } from '../ui/badge';
import { BarChart3Icon, TargetIcon, AwardIcon } from '../ui/icons';

export default function NobelPortfolioHero() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-blue-50/50"></div>
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-1/4 w-72 h-72 bg-gradient-to-br from-indigo-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-300 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-200/50">
              <AwardIcon className="w-4 h-4 mr-2" />
              Nobel Portfolio
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Strategie{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Nobelovy Nadace
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Strategie inspirovaná Nobelovou nadací s <strong>6% očekávaným výnosem</strong> a vyváženým rizikem. Složení 55% akcie, 25% dluhopisy, 20% nemovitosti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#allocation"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 h-12"
              >
                <BarChart3Icon className="w-5 h-5" />
                Zobrazit složení
              </a>
              <a
                href="#performance"
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 text-lg font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2 h-12"
              >
                <TargetIcon className="w-5 h-5" />
                Aktuální výnos
              </a>
            </div>
          </div>
          
          {/* Right Content - Visual Element */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Klíčové údaje</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Očekávaný roční výnos</span>
                  <span className="text-2xl font-bold text-blue-600">6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Složení</span>
                  <span className="font-semibold text-gray-900">55/25/20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Riziko</span>
                  <span className="font-semibold text-blue-600">Střední</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rebalancing</span>
                  <span className="font-semibold text-gray-900">Ročně</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-800">
                  🏆 Strategie Nobelovy nadace
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}