
'use client';

import { useCallback } from 'react';

export const useETFCount = () => {
  const getETFCount = useCallback(async () => {
    try {
      const response = await fetch('/api/etfs?count=true');

      if (!response.ok) {
        console.error('Error counting ETFs:', response.statusText);
        return 0;
      }

      const { count, error } = await response.json();

      if (error) {
        console.error('Error counting ETFs:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getETFCount:', error);
      return 0;
    }
  }, []);

  return { getETFCount };
};
