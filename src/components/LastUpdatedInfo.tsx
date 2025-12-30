import React from 'react';
import { ClockIcon } from '@/components/ui/icons';
import CurrencyToggle from '@/components/ui/CurrencyToggle';

interface LastUpdatedInfoProps {
  lastUpdated: Date | null;
  className?: string;
  showCurrencyToggle?: boolean;
}

const LastUpdatedInfo: React.FC<LastUpdatedInfoProps> = ({ lastUpdated, className = "", showCurrencyToggle = false }) => {
  if (!lastUpdated) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <ClockIcon />
        <span>Poslední aktualizace: {formatDate(lastUpdated)}</span>
      </div>
      {showCurrencyToggle && (
        <div className="flex justify-start sm:justify-end">
          <CurrencyToggle className="scale-90 sm:scale-100" />
        </div>
      )}
    </div>
  );
};

export default LastUpdatedInfo;
