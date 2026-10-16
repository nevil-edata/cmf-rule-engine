import { useEffect, useState } from 'react';
import { getDatasetById } from '@/lib/db/operations';

/**
 * The company that owns a dataset. Rules are saved against this company, not the signed-in
 * user's: an Admin has no company of their own, so using the profile's company_id meant an
 * Admin's rules were never saved.
 * Returns '' until the lookup finishes (or if it fails).
 */
export function useDatasetCompanyId(datasetId: number | null): string {
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    let cancelled = false;
    setCompanyId('');

    if (datasetId) {
      getDatasetById(datasetId)
        .then((dataset) => {
          if (!cancelled) setCompanyId(dataset?.companyId ?? '');
        })
        .catch((error) => {
          console.error('Failed to look up the dataset company:', error);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [datasetId]);

  return companyId;
}
