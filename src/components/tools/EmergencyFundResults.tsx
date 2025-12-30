import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckIcon, AlertIcon, ClockIcon, ShieldIcon, TrendingUpIcon } from '../ui/icons';
import type { EmergencyFundData } from '../../utils/emergencyFundCalculations';

interface EmergencyFundResultsProps {
  results: EmergencyFundData;
}

const EmergencyFundResults: React.FC<EmergencyFundResultsProps> = ({ results }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityStatus = () => {
    switch (results.recommendations.priorityLevel) {
      case 'critical':
        return {
          icon: <span className="h-5 w-5 text-red-500 flex items-center justify-center">✕</span>,
          text: "Kritická priorita",
          description: "Okamžitě začněte spořit!"
        };
      case 'high':
        return {
          icon: <AlertIcon className="h-5 w-5 text-orange-500" />,
          text: "Vysoká priorita", 
          description: "Rezerva by měla být vyšší"
        };
      case 'moderate':
        return {
          icon: <ClockIcon className="h-5 w-5 text-yellow-500" />,
          text: "Střední priorita",
          description: "Jste na dobré cestě"
        };
      case 'sufficient':
        return {
          icon: <CheckIcon className="h-5 w-5 text-green-500" />,
          text: "Dostatečná rezerva",
          description: "Máte dobře budovanou rezervu!"
        };
    }
  };

  const priorityStatus = getPriorityStatus();
  const progressPercentage = Math.min(100, (results.currentCoverage / results.recommendedMonths) * 100);

  return (
    <div className="space-y-6">
      
      {/* Status header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center">
          {priorityStatus.icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            Výsledek analýzy nouzové rezervy
          </h3>
          <p className="text-lg text-gray-700">
            {priorityStatus.text} - {priorityStatus.description}
          </p>
        </div>
      </div>

      {/* Main results grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShieldIcon className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Aktuální rezerva</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(results.currentCoverage * (results.recommendedAmount / results.recommendedMonths))}
          </p>
          <p className="text-sm text-blue-700">{results.currentCoverage.toFixed(1)} měsíců pokryto</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Doporučená rezerva</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(results.recommendedAmount)}
          </p>
          <p className="text-sm text-green-700">{results.recommendedMonths.toFixed(1)} měsíců výdajů</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Čas do cíle</h4>
          </div>
          {results.monthsToTarget > 0 ? (
            <>
              <p className="text-2xl font-bold text-purple-600">{results.monthsToTarget} měsíců</p>
              <p className="text-sm text-purple-700">při současném spoření</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-green-600">Hotovo!</p>
              <p className="text-sm text-green-700">Cíl je splněn</p>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-900">Pokrok k cíli</span>
          <span className="font-semibold text-gray-900">{progressPercentage.toFixed(0)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {/* Nedostatek */}
      {results.shortfall > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">Potřebujete ještě</h4>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(results.shortfall)}</p>
        </div>
      )}

      {/* Upozornění pro dlouhé spoření */}
      {results.monthsToTarget > 24 && (
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
          <div className="flex items-start gap-3">
            <AlertIcon className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Spoření bude trvat více než 2 roky!</h4>
              <p className="text-sm text-red-800 mb-2">Zvažte tyto možnosti:</p>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Snižte měsíční výdaje</li>
                <li>• Zvyšte měsíční spoření</li>
                <li>• Hledejte dodatečný příjem</li>
                <li>• Začněte menší rezervou (3 měsíce)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Individualizované tipy */}
      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <div className="flex items-start gap-3">
          <span className="h-5 w-5 text-blue-500 mt-0.5 flex items-center justify-center">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Doporučení pro vás</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {results.recommendations.priorityLevel === 'critical' && (
                <>
                  <li>• <strong>Okamžitě:</strong> Otevřete spořicí účet s nejlepším úrokem</li>
                  <li>• <strong>Cíl:</strong> Nejdříve naspořte alespoň {formatCurrency(results.breakdown.baseAmount / 3)} (1 měsíc)</li>
                  <li>• <strong>Automatizace:</strong> Převádějte peníze hned po výplatě</li>
                </>
              )}
              {results.recommendations.priorityLevel === 'high' && (
                <>
                  <li>• <strong>Pokračujte:</strong> Jste na dobré cestě, zvyšte tempo spoření</li>
                  <li>• <strong>Cíl:</strong> Dostavte do {formatCurrency(results.breakdown.baseAmount)} (3 měsíce)</li>
                  <li>• <strong>Optimalizace:</strong> Rozdělte 70% spořicí účet, 30% termínovaný vklad</li>
                </>
              )}
              {results.recommendations.priorityLevel === 'moderate' && (
                <>
                  <li>• <strong>Dokončení:</strong> Dostavte do plné rezervy {formatCurrency(results.recommendedAmount)}</li>
                  <li>• <strong>Diverzifikace:</strong> 70% spořicí účet, 30% termínovaný vklad</li>
                  <li>• <strong>Připravte se:</strong> Až dosáhnete cíle, začněte investovat přebytky</li>
                </>
              )}
              {results.recommendations.priorityLevel === 'sufficient' && (
                <>
                  <li>• <strong>Gratulujeme!</strong> Máte dostatečnou rezervu</li>
                  <li>• <strong>Údržba:</strong> Pravidelně revidujte podle změn v životě</li>
                  <li>• <strong>Další krok:</strong> Investujte přebytečné peníze do ETF či akcií</li>
                </>
              )}
              {results.monthsToTarget > 12 && results.recommendations.priorityLevel !== 'sufficient' && (
                <li>• <strong>Zrychlení:</strong> Zvažte snížení výdajů nebo zvýšení příjmů</li>
              )}
              {results.riskLevel === 'high' && (
                <li>• <strong>Vysoké riziko:</strong> Prioritou je rychlé vytvoření základní rezervy</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Rizikový profil */}
      <div className="text-center">
        <Badge variant={results.riskLevel === 'low' ? 'default' : results.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
          Rizikový profil: {results.riskLevel === 'low' ? 'Nízký' : results.riskLevel === 'medium' ? 'Střední' : 'Vysoký'}
        </Badge>
      </div>

    </div>
  );
};

export default EmergencyFundResults;