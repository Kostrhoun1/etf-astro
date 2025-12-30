'use client';

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { runMonteCarloSimulation } from "../../utils/monteCarloUtils";
import type { AssetAllocation, SimulationResult } from "@/types/monteCarlo";
import { ASSETS, ASSET_KEYS } from "../../utils/monteCarloUtils";
import MonteCarloChart from "./MonteCarloChart";
import MonteCarloDataSources from "./MonteCarloDataSources";

// Helper to construct empty allocation
function getDefaultAllocation(): AssetAllocation {
  // Výchozí: US large 40%, intl_dev 20%, US quality bonds 30%, cash 10%
  return {
    us_large: 40,
    us_small: 0,
    emerging: 0,
    intl_dev: 20,
    canada: 0,
    reits: 0,
    us_high_yield: 0,
    us_quality_bond: 30,
    intl_bond: 0,
    gold: 0,
    cash: 10,
  };
}

const MonteCarloSimulator: React.FC = () => {
  const [allocation, setAllocation] = useState<AssetAllocation>(getDefaultAllocation());
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [investmentPeriod, setInvestmentPeriod] = useState(20);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log("MonteCarloSimulator rendered with state:", {
    allocation,
    initialInvestment,
    monthlyContribution,
    investmentPeriod,
    resultsLength: results.length,
    isLoading
  });

  // Součet alokací napříč aktivy
  const totalAllocation = Object.values(allocation).reduce((sum, v) => sum + v, 0);

  // Handler pro změnu jednoho assetu
  const handleAllocationChange = (asset: keyof AssetAllocation, value: number) => {
    console.log(`Allocation change: ${asset} = ${value}`);
    setAllocation((prev) => ({ ...prev, [asset]: value }));
  };

  // Jednoduchá normalizace (totožné jako dříve)
  const normalizeAllocation = () => {
    console.log("Normalizing allocation");
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const factor = 100 / total;
      const newAllocation = {} as AssetAllocation;
      (Object.keys(allocation) as (keyof AssetAllocation)[]).forEach((key) => {
        newAllocation[key] = Math.round(allocation[key] * factor);
      });
      setAllocation(newAllocation);
    }
  };

  const runSimulation = async () => {
    console.log("runSimulation started");
    console.log("Simulation parameters:", {
      allocation,
      initialInvestment,
      monthlyContribution,
      years: investmentPeriod,
      totalAllocation
    });

    if (totalAllocation !== 100) {
      console.error("Cannot run simulation: total allocation is not 100%");
      return;
    }

    setIsLoading(true);
    setResults([]); // Clear previous results
    
    try {
      console.log("Calling runMonteCarloSimulation...");
      const simulationResults = await runMonteCarloSimulation({
        allocation,
        initialInvestment,
        monthlyContribution,
        years: investmentPeriod,
        simulations: 1000,
      });
      console.log("Simulation completed with results:", simulationResults);
      setResults(simulationResults);
    } catch (error) {
      console.error("Chyba při simulaci:", error);
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  // Formátace výsledného čísla
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Monte Carlo simulátor portfolia</CardTitle>
          <p className="text-sm text-gray-600">Flexibilní simulace růstu portfolia podle historických dat a korelací aktiv.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Portfolio dynamická alokace */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Složení portfolia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ASSET_KEYS.map((key) => (
                <div key={key}>
                  <Label>
                    {ASSETS[key].label} ({allocation[key]}%)
                  </Label>
                  <Slider
                    value={[allocation[key]]}
                    onValueChange={([value]) => handleAllocationChange(key, value)}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className={`text-sm ${totalAllocation === 100 ? "text-green-600" : "text-red-600"}`}>Celkem: {totalAllocation}%</p>
              {totalAllocation !== 100 && (
                <Button variant="outline" size="sm" onClick={normalizeAllocation}>
                  Normalizovat na 100 %
                </Button>
              )}
            </div>
          </div>
          {/* Parametry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="initialInvestment">Počáteční investice (Kč)</Label>
              <Input id="initialInvestment" type="number" value={initialInvestment || ''} onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="monthlyContribution">Měsíční příspěvek (Kč)</Label>
              <Input id="monthlyContribution" type="number" value={monthlyContribution || ''} onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="investmentPeriod">Investiční horizont (roky)</Label>
              <Input id="investmentPeriod" type="number" value={investmentPeriod || ''} onChange={(e) => setInvestmentPeriod(Number(e.target.value) || 0)} min="1" max="50" className="mt-2" />
            </div>
          </div>
          <Button onClick={runSimulation} disabled={isLoading || totalAllocation !== 100} className="w-full">
            {isLoading ? "Spouštím simulaci..." : "Spustit Monte Carlo simulaci"}
          </Button>
        </CardContent>
      </Card>

      {/* Data Sources Note */}
      <MonteCarloDataSources />

      {/* Výsledky */}
      {results && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Výsledky simulace</CardTitle>
          </CardHeader>
          <CardContent>
            {/* GRAF */}
            <MonteCarloChart results={results} />
            <div className="space-y-4 mt-10">
              {results.filter((r) => r.year === investmentPeriod).map((result) => (
                <div key={result.year} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-600">Pesimistický (5%)</span>
                    <div className="text-lg font-bold">{formatNumber(result.percentile5)}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <span className="text-sm text-orange-600">Konzervativní (25%)</span>
                    <div className="text-lg font-bold">{formatNumber(result.percentile25)}</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-600">Realistický (50%)</span>
                    <div className="text-lg font-bold">{formatNumber(result.percentile50)}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-600">Optimistický (75%)</span>
                    <div className="text-lg font-bold">{formatNumber(result.percentile75)}</div>
                  </div>
                  <div className="p-4 bg-green-100 rounded-lg">
                    <span className="text-sm text-green-700">Velmi optimistický (95%)</span>
                    <div className="text-lg font-bold">{formatNumber(result.percentile95)}</div>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <span className="text-sm text-gray-600">Celkem investováno</span>
                <div className="text-lg font-bold">{formatNumber(initialInvestment + monthlyContribution * 12 * investmentPeriod)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {isLoading && <div className="text-center text-lg text-blue-600">Probíhá simulace...</div>}
    </div>
  );
};

export default MonteCarloSimulator;