'use client'

interface CorrelationMatrixProps {
  correlations: Array<{
    etf1: string
    etf2: string
    correlation: number
  }>
  etfNames: string[]
}

export function CorrelationMatrix({ correlations, etfNames }: CorrelationMatrixProps) {
  // Build matrix from correlations array
  const matrix: Record<string, Record<string, number>> = {}

  // Initialize with 1s on diagonal
  for (const name of etfNames) {
    matrix[name] = {}
    for (const name2 of etfNames) {
      matrix[name][name2] = name === name2 ? 1 : 0
    }
  }

  // Fill in correlations
  for (const { etf1, etf2, correlation } of correlations) {
    if (matrix[etf1] && matrix[etf2]) {
      matrix[etf1][etf2] = correlation
      matrix[etf2][etf1] = correlation
    }
  }

  const getCorrelationColor = (value: number) => {
    if (value >= 0.8) return 'bg-red-500 text-white'
    if (value >= 0.6) return 'bg-orange-400 text-white'
    if (value >= 0.4) return 'bg-yellow-300 text-gray-900'
    if (value >= 0.2) return 'bg-green-200 text-gray-900'
    if (value >= 0) return 'bg-green-400 text-white'
    if (value >= -0.2) return 'bg-blue-200 text-gray-900'
    return 'bg-blue-500 text-white'
  }

  if (etfNames.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Korelační matice
        </h3>
        <p className="text-sm text-gray-500">
          Pro zobrazení korelace potřebujete alespoň 2 ETF v portfoliu.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Korelační matice
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Korelace měří, jak se výnosy dvou aktiv pohybují společně. Nízká korelace (blízká 0) znamená lepší diverzifikaci.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-gray-700"></th>
              {etfNames.map((name) => (
                <th
                  key={name}
                  className="p-2 text-center text-xs font-medium text-gray-700 max-w-[100px] truncate"
                  title={name}
                >
                  {name.length > 15 ? name.substring(0, 15) + '...' : name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {etfNames.map((rowName) => (
              <tr key={rowName}>
                <td
                  className="p-2 text-sm font-medium text-gray-700 max-w-[120px] truncate"
                  title={rowName}
                >
                  {rowName.length > 18 ? rowName.substring(0, 18) + '...' : rowName}
                </td>
                {etfNames.map((colName) => {
                  const value = matrix[rowName]?.[colName] ?? 0
                  return (
                    <td
                      key={colName}
                      className={`p-2 text-center text-sm font-medium ${getCorrelationColor(value)}`}
                    >
                      {value.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>Velmi vysoká (0.8+)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span>Vysoká (0.6-0.8)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-300 rounded" />
          <span>Střední (0.4-0.6)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-400 rounded" />
          <span>Nízká (0-0.4)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span>Negativní</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Pro lepší diverzifikaci hledejte aktiva s nízkou vzájemnou korelací.
          Portfolio s vysoce korelovanými aktivy může být volatilnější při poklesech trhu.
        </p>
      </div>
    </div>
  )
}
