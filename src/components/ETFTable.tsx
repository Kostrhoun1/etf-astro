'use client';

import React, { useState, useMemo, memo } from 'react';
import type { ETFListItem } from '@/types/etf';
import ETFTableFilters from './ETFTableFilters';
import ETFTablePagination from './ETFTablePagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUpIcon, ChevronDownIcon, LoaderIcon } from '@/components/ui/icons';
import { formatPercentage, formatTER } from '@/utils/csvParser';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ETFTableProps {
  etfs: ETFListItem[];
  onSelectETF?: (etf: ETFListItem) => Promise<boolean>;
  isETFSelected?: (isin: string) => boolean;
  canAddMore?: boolean;
}

const ETFTable: React.FC<ETFTableProps> = ({
  etfs,
  onSelectETF,
  isETFSelected,
  canAddMore = true,
}) => {
  const [loadingETF, setLoadingETF] = useState<string | null>(null);
  const { getPerformanceValue } = useCurrency();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('ter_numeric');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 50;

  // Sort and paginate the already filtered ETFs
  const sortedETFs = useMemo(() => {
    return etfs
      .filter(etf => {
        const searchLower = searchTerm.toLowerCase();

        const basicFieldsMatch =
          etf.name.toLowerCase().includes(searchLower) ||
          etf.isin.toLowerCase().includes(searchLower) ||
          etf.fund_provider.toLowerCase().includes(searchLower);

        const isTickerSearch = searchLower.length >= 3 && searchLower.match(/^[A-Z0-9]+$/i);

        const tickerFieldsMatch = isTickerSearch ? (
          (etf.primary_ticker && (etf.primary_ticker.toLowerCase() === searchLower || etf.primary_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_1_ticker && (etf.exchange_1_ticker.toLowerCase() === searchLower || etf.exchange_1_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_2_ticker && (etf.exchange_2_ticker.toLowerCase() === searchLower || etf.exchange_2_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_3_ticker && (etf.exchange_3_ticker.toLowerCase() === searchLower || etf.exchange_3_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_4_ticker && (etf.exchange_4_ticker.toLowerCase() === searchLower || etf.exchange_4_ticker.toLowerCase().startsWith(searchLower))) ||
          (etf.exchange_5_ticker && (etf.exchange_5_ticker.toLowerCase() === searchLower || etf.exchange_5_ticker.toLowerCase().startsWith(searchLower)))
        ) : (
          (etf.primary_ticker && etf.primary_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase().includes(searchLower)) ||
          (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase().includes(searchLower))
        );

        return basicFieldsMatch || tickerFieldsMatch;
      })
      .sort((a, b) => {
        // Search relevance sorting - exact ticker matches first
        if (searchTerm.length >= 3 && searchTerm.match(/^[A-Z0-9]+$/i)) {
          const searchLower = searchTerm.toLowerCase();

          const getTickerRelevance = (etf: ETFListItem) => {
            if (
              (etf.primary_ticker && etf.primary_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase() === searchLower) ||
              (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase() === searchLower)
            ) {
              return 3;
            }

            if (
              (etf.primary_ticker && etf.primary_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_1_ticker && etf.exchange_1_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_2_ticker && etf.exchange_2_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_3_ticker && etf.exchange_3_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_4_ticker && etf.exchange_4_ticker.toLowerCase().startsWith(searchLower)) ||
              (etf.exchange_5_ticker && etf.exchange_5_ticker.toLowerCase().startsWith(searchLower))
            ) {
              return 2;
            }

            return 1;
          };

          const aRelevance = getTickerRelevance(a);
          const bRelevance = getTickerRelevance(b);

          if (aRelevance !== bRelevance) {
            return bRelevance - aRelevance;
          }
        }

        let aValue: any = a[sortBy as keyof ETFListItem];
        let bValue: any = b[sortBy as keyof ETFListItem];

        if (sortBy === 'ter_numeric') {
          const aTer = aValue || 0;
          const bTer = bValue || 0;

          if (aTer === 0 && bTer !== 0) {
            return sortOrder === 'asc' ? 1 : -1;
          }
          if (bTer === 0 && aTer !== 0) {
            return sortOrder === 'asc' ? -1 : 1;
          }
          if (aTer === 0 && bTer === 0) {
            return 0;
          }

          if (sortOrder === 'asc') {
            return aTer - bTer;
          } else {
            return bTer - aTer;
          }
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [etfs, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedETFs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedETFs = sortedETFs.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSelectETF = async (etf: ETFListItem) => {
    if (!onSelectETF) return;

    setLoadingETF(etf.isin);
    try {
      await onSelectETF(etf);
    } finally {
      setLoadingETF(null);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ?
        <ChevronUpIcon className="inline ml-1" /> :
        <ChevronDownIcon className="inline ml-1" />;
    }
    return null;
  };

  const getReturnColor = (value: number | null) => {
    if (value === null) return '';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return '';
  };

  const getDistributionPolicyLabel = (policy: string) => {
    if (policy === 'Accumulating') return 'Akumulační';
    if (policy === 'Distributing') return 'Distribuční';
    return policy || '-';
  };

  const formatFundSize = (size: number) => {
    if (!size) return '-';

    return size.toLocaleString('cs-CZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="space-y-6">
      <ETFTableFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 text-left md:relative sticky left-0 bg-white z-10 md:border-r-0 border-r border-gray-200 min-w-[200px] md:min-w-0"
                  onClick={() => handleSort('name')}
                >
                  Název / ISIN
                  {getSortIcon('name')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('ter_numeric')}
                >
                  TER
                  {getSortIcon('ter_numeric')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('return_ytd')}
                >
                  Výnos YTD
                  {getSortIcon('return_ytd')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('return_1y')}
                >
                  Výnos 1Y
                  {getSortIcon('return_1y')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('return_3y')}
                >
                  Výnos 3Y
                  {getSortIcon('return_3y')}
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('return_5y')}
                >
                   Výnos 5Y
                   {getSortIcon('return_5y')}
                 </TableHead>
                 <TableHead
                   className="text-right cursor-pointer hover:bg-gray-50"
                   onClick={() => handleSort('fund_size_numeric')}
                 >
                   Velikost fondu (mil EUR)
                   {getSortIcon('fund_size_numeric')}
                 </TableHead>
                 <TableHead
                   className="text-right cursor-pointer hover:bg-gray-50"
                   onClick={() => handleSort('current_dividend_yield_numeric')}
                 >
                   Dividendový výnos
                   {getSortIcon('current_dividend_yield_numeric')}
                 </TableHead>
                 <TableHead className="text-left">Typ fondu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedETFs.map((etf) => (
                <TableRow key={etf.isin} className="border-b hover:bg-gray-50">
                  <TableCell className="p-3 md:relative sticky left-0 bg-white z-10 md:border-r-0 border-r border-gray-200 min-w-[200px] md:min-w-0">
                    <div className="flex items-start gap-3">
                      {onSelectETF && (
                        <div className="flex pt-1">
                          {isETFSelected && isETFSelected(etf.isin) ? (
                            <Checkbox checked={true} disabled />
                          ) : (
                            <Checkbox
                              checked={false}
                              disabled={!canAddMore || loadingETF === etf.isin}
                              onCheckedChange={() => handleSelectETF(etf)}
                              aria-label="Porovnat fond"
                            />
                          )}
                          {loadingETF === etf.isin && (
                            <LoaderIcon className="ml-2" />
                          )}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          <a
                            href={`/etf/${etf.isin}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {etf.name}
                          </a>
                        </div>
                        <div className="text-sm text-gray-500">{etf.isin}</div>
                        {etf.primary_ticker && (
                          <div className="text-xs text-blue-600">{etf.primary_ticker}</div>
                        )}
                        {etf.degiro_free && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              DEGIRO Free
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono p-3">
                    {formatTER(etf.ter_numeric)}
                  </TableCell>
                  <TableCell className={`p-3 text-right ${getReturnColor(getPerformanceValue(etf, 'ytd'))}`}>
                    {getPerformanceValue(etf, 'ytd') !== null ? formatPercentage(getPerformanceValue(etf, 'ytd')!) : '-'}
                  </TableCell>
                  <TableCell className={`p-3 text-right ${getReturnColor(getPerformanceValue(etf, '1y'))}`}>
                    {getPerformanceValue(etf, '1y') !== null ? formatPercentage(getPerformanceValue(etf, '1y')!) : '-'}
                  </TableCell>
                  <TableCell className={`p-3 text-right ${getReturnColor(getPerformanceValue(etf, '3y'))}`}>
                    {getPerformanceValue(etf, '3y') !== null ? formatPercentage(getPerformanceValue(etf, '3y')!) : '-'}
                  </TableCell>
                   <TableCell className={`p-3 text-right ${getReturnColor(getPerformanceValue(etf, '5y'))}`}>
                     {getPerformanceValue(etf, '5y') !== null ? formatPercentage(getPerformanceValue(etf, '5y')!) : '-'}
                   </TableCell>
                   <TableCell className="text-right font-mono p-3 text-sm">
                     {formatFundSize(etf.fund_size_numeric)}
                   </TableCell>
                   <TableCell className="text-right font-mono p-3">
                     {etf.current_dividend_yield_numeric ? formatPercentage(etf.current_dividend_yield_numeric) : '-'}
                   </TableCell>
                   <TableCell className="p-3">
                     <Badge variant="outline" className="text-xs">
                       {getDistributionPolicyLabel(etf.distribution_policy)}
                     </Badge>
                   </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ETFTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default memo(ETFTable);
