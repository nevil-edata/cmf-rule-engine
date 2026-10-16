import { useState, useEffect } from 'react';
import { Database, Loader2, ListChecks, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { getDatasetsWithRulesets, type DatasetWithRuleset } from '@/lib/db/operations';
import { useAlignedDatasetLoader } from '../hooks/useAlignedDatasetLoader';
import type { RuleItem } from '@/lib/types/ruleBuilder';

interface RulesDatasetSelectorProps {
  onDatasetSelect: (
    file: File,
    datasetName: string,
    datasetId: number,
    rules: RuleItem[]
  ) => Promise<void>;
  isLoading: boolean;
}

export function RulesDatasetSelector({ onDatasetSelect, isLoading }: RulesDatasetSelectorProps) {
  const [datasets, setDatasets] = useState<DatasetWithRuleset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const { loadAlignedDataset, loading: downloading, error: loadError } = useAlignedDatasetLoader();

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      const data = await getDatasetsWithRulesets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoadingDatasets(false);
    }
  }

  async function handleLoadDataset() {
    if (!selectedDatasetId) return;

    const result = await loadAlignedDataset(selectedDatasetId);
    if (!result) return;

    const { file, dataset, ruleset } = result;

    if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
      alert('No rules defined for this dataset. Please create rules in the Rule Builder first.');
      return;
    }

    await onDatasetSelect(
      file,
      dataset.fileName || `Dataset ${dataset.id}`,
      dataset.id,
      ruleset.rules as RuleItem[]
    );
  }

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
  const hasRules = selectedDataset?.ruleset && selectedDataset.ruleset.ruleCount > 0;
  const hasAlignedFile = selectedDataset?.alignedFilePath;

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
            hint: `${d.insuranceCompany}${d.ruleset ? ` (${d.ruleset.ruleCount} rules)` : ' (no rules)'}`,
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
                    <span className="font-medium">Size:</span> {selectedDataset.rows} rows
                  </p>
                </div>

                {/* Rules status */}
                <div className="mt-2 flex items-center gap-2">
                  <ListChecks className={`h-3.5 w-3.5 ${hasRules ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className={`text-[10px] ${hasRules ? 'text-success' : 'text-muted-foreground'}`}>
                    {hasRules
                      ? `${selectedDataset.ruleset!.ruleCount} rules defined`
                      : 'No rules defined'}
                  </span>
                </div>

                {/* Aligned file status */}
                {!hasAlignedFile && (
                  <div className="mt-1 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <span className="text-[10px] text-warning">
                      No aligned file available
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loadError && (
          <p className="text-xs text-destructive">{loadError}</p>
        )}

        <Button
          onClick={handleLoadDataset}
          disabled={!selectedDatasetId || !hasRules || !hasAlignedFile || isLoading || downloading}
          className="w-full h-8"
          size="sm"
        >
          {downloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Aligned Data...
            </>
          ) : (
            'Load Dataset & Rules'
          )}
        </Button>

        {selectedDataset && !hasRules && (
          <p className="text-[10px] text-muted-foreground text-center">
            Create rules in the Rule Builder first
          </p>
        )}
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
