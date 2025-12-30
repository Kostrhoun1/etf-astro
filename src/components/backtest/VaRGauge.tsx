'use client'

interface VaRGaugeProps {
  var95: number
}

export function VaRGauge({ var95 }: VaRGaugeProps) {
  const percentage = Math.abs(var95 * 100)
  const angle = Math.min(percentage / 30 * 180, 180) // Max 30% loss maps to full gauge

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Maximální ztráta za rok (VaR 95%)
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Value at Risk udává maximální ztrátu, kterou portfolio může s 95% pravděpodobností očekávat za rok.
      </p>

      <div className="flex flex-col items-center">
        {/* Gauge SVG */}
        <div className="relative w-64 h-32">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            {/* Value arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * 283} 283`}
            />
            {/* Needle */}
            <g transform={`rotate(${angle - 90}, 100, 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="25"
                stroke="#1F2937"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="8" fill="#1F2937" />
            </g>
            {/* Labels */}
            <text x="10" y="98" fontSize="10" fill="#6B7280" textAnchor="start">
              0%
            </text>
            <text x="100" y="20" fontSize="10" fill="#6B7280" textAnchor="middle">
              -15%
            </text>
            <text x="190" y="98" fontSize="10" fill="#6B7280" textAnchor="end">
              -30%
            </text>
          </svg>
        </div>

        {/* Value display */}
        <div className="text-center mt-4">
          <p className="text-3xl font-bold text-red-600">
            -{percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Maximální roční ztráta
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Jak se počítá:</strong> VaR se vypočítá metodou variance-covariance pomocí očekávaných výnosů a jejich směrodatné odchylky:
        </p>
        <p className="text-sm text-gray-600 mt-2 font-mono bg-gray-100 p-2 rounded">
          VaR = μ - 1.65 × σ
        </p>
        <p className="text-xs text-gray-500 mt-2">
          kde μ je průměrný roční výnos a σ je roční směrodatná odchylka.
        </p>
      </div>
    </div>
  )
}
