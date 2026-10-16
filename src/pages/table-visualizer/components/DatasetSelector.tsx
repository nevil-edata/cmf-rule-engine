import { useState, useEffect } from 'react';
import { Database, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { getDatasets, type DatasetWithStatus } from '@/lib/db/operations';
import { downloadRawDataset } from '@/lib/storage/helpers';

interface DatasetSelectorProps {
  onDatasetSelect: (file: File, datasetName: string, datasetId: number) => Promise<void>;
  isLoading: boolean;
}

export function DatasetSelector({ onDatasetSelect, isLoading }: DatasetSelectorProps) {
  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  }

  async function handleLoadDataset() {
    if (!selectedDatasetId) return;

    const dataset = datasets.find(d => d.id === selectedDatasetId);
    if (!dataset?.rawFilePath) {
      alert('No raw file available for this dataset');
      return;
    }

    setDownloading(true);
    try {
      // Download raw CSV from storage (for tree evaluation)
      const blob = await downloadRawDataset(dataset.rawFilePath);

      // Convert blob to File
      const file = new File(
        [blob],
        dataset.fileName || `dataset_${dataset.id}.csv`,
        { type: 'text/csv' }
      );

      // Pass to parent component with dataset_id for financial metrics
      await onDatasetSelect(file, dataset.fileName || `Dataset ${dataset.id}`, dataset.id);
    } catch (err) {
      console.error('Failed to load dataset:', err);
      alert('Failed to load dataset from storage');
    } finally {
      setDownloading(false);
    }
  }

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <SearchableSelect
          aria-label="Dataset"
          value={selectedDatasetId?.toString() ?? ''}
          onChange={(v) => setSelectedDatasetId(v ? Number(v) : null)}
          placeholder="-- Select a dataset --"
          searchPlaceholder="Type a file or company name…"
          options={datasets.map(d => ({
            value: d.id.toString(),
            label: d.fileName || `Dataset ${d.id}`,
            hint: `${d.insuranceCompany} - ${d.country} (${d.rows} rows)`,
          }))}
          disabled={loadingDatasets || isLoading || downloading}
        />

        {selectedDataset && (
          <div className="rounded border p-2" style={{ borderColor: 'var(--color-input)', backgroundColor: 'var(--color-muted)' }}>
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {selectedDataset.fileName || `Dataset #${selectedDataset.id}`}
                </p>
                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-medium">Company:</span> {selectedDataset.insuranceCompany}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-medium">Country:</span> {selectedDataset.country}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-medium">Size:</span> {selectedDataset.rows} rows × {selectedDataset.columns} columns
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleLoadDataset}
          disabled={!selectedDatasetId || isLoading || downloading}
          className="w-full h-8"
          size="sm"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Load Dataset
            </>
          )}
        </Button>
      </div>

      {loadingDatasets && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Loading datasets...</span>
        </div>
      )}
    </div>
  );
}
