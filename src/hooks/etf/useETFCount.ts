
import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export const useETFCount = () => {
  const getETFCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('etf_funds')
        .select('*', { count: 'exact', head: true })
;

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
