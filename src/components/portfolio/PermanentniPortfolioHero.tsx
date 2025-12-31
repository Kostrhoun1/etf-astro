import React from 'react';

import { Badge } from '../ui/badge';
import { BarChart3Icon, TargetIcon, ShieldIcon } from '../ui/icons';

export default function PermanentniPortfolioHero() {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-violet-50/50"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full text-sm font-medium backdrop-blur-sm border border-green-200/50">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Permanentní Portfolio
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Bezpečné{' '}
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-violet-600 bg-clip-text text-transparent">
                Permanentní Portfolio
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              Portfolio Harryho Browna navržené tak, aby přežilo všechny ekonomické podmínky s <strong>4% očekávaným výnosem</strong> a minimálním rizikem. Rovnoměrné rozdělení mezi čtyři třídy aktiv podle ekonomických cyklů.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#allocation"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 h-12"
              >
                <BarChart3Icon className="w-5 h-5" />
                Zobrazit složení
              </a>
              <a
                href="#performance"
                className="bg-white/80 backdrop-blur-sm border-2 border-green-300 text-green-700 hover:bg-green-50 px-8 py-3 text-lg font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2 h-12"
              >
                <TargetIcon className="w-5 h-5" />
                Aktuální výnos
              </a>
            </div>
          </div>
          
          {/* Right Content - Visual Element */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Klíčové údaje</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Očekávaný roční výnos</span>
                  <span className="text-2xl font-bold text-green-600">4-6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Složení</span>
                  <span className="font-semibold text-gray-900">25/25/25/25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Riziko</span>
                  <span className="font-semibold text-emerald-600">Velmi nízké</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rebalancing</span>
                  <span className="font-semibold text-gray-900">Ročně</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800">
                  🛡️ Strategie pro všechny ekonomické podmínky
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}