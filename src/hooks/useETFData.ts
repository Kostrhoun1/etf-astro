
import { useETFUpsert } from './etf/useETFUpsert';
import { useETFFetch } from './etf/useETFFetch';
import { useETFCount } from './etf/useETFCount';

export const useETFData = () => {
  const { upsertETFs, isLoading: isUpserting } = useETFUpsert();
  const { fetchETFs, isLoading: isFetching, lastUpdated } = useETFFetch();
  const { getETFCount } = useETFCount();

  // Return true if any operation is loading
  const isLoading = isUpserting || isFetching;

  return {
    upsertETFs,
    fetchETFs,
    getETFCount,
    isLoading,
    lastUpdated
  };
};
