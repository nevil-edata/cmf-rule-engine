import { useState, useMemo } from 'react';
import { type DatasetWithStatus } from '@/lib/db/operations';

export function useDatasetSort(datasets: DatasetWithStatus[]) {
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  }>({
    column: 'uploaded',
    direction: 'desc',
  });

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedDatasets = useMemo(() => {
    const sorted = [...datasets];

    sorted.sort((a, b) => {
      switch (sortConfig.column) {
        case 'name': {
          const aName = a.nickname || a.fileName || '';
          const bName = b.nickname || b.fileName || '';
          return sortConfig.direction === 'asc'
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName);
        }

        case 'dimensions': {
          const aRows = a.rows || 0;
          const bRows = b.rows || 0;
          return sortConfig.direction === 'asc' ? aRows - bRows : bRows - aRows;
        }

        case 'uploaded': {
          const aTime = new Date(a.uploadedAt || a.createdAt).getTime();
          const bTime = new Date(b.uploadedAt || b.createdAt).getTime();
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
        }

        default:
          return 0;
      }
    });

    return sorted;
  }, [datasets, sortConfig]);

  return { sortedDatasets, sortConfig, handleSort };
}
