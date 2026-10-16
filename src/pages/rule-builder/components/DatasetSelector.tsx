import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { Database } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { supabase } from '@/lib/db/supabase';
import { ruleBuilderDatasetIdAtom, resetRuleBuilderAtom } from '@/store/atoms/ruleBuilder';
import { useSetAtom } from 'jotai';

interface Dataset {
  id: number;
  nickname: string | null;
  fileName: string | null;
  insuranceCompany: string;
  rows: number;
}

export function DatasetSelector() {
  const [datasetId, setDatasetId] = useAtom(ruleBuilderDatasetIdAtom);
  const resetRuleBuilder = useSetAtom(resetRuleBuilderAtom);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const { data, error } = await supabase
          .from('datasets')
          .select('id, nickname, file_name, insurance_company, rows')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setDatasets(
          (data || []).map((d) => ({
            id: d.id,
            nickname: d.nickname,
            fileName: d.file_name,
            insuranceCompany: d.insurance_company,
            rows: d.rows,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  const selectedDataset = datasets.find((d) => d.id === datasetId);

  const handleChange = (value: string) => {
    const newId = value ? Number(value) : null;

    // If changing dataset, reset the rule builder
    if (newId !== datasetId) {
      resetRuleBuilder();
    }

    setDatasetId(newId);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Database className="h-4 w-4" />
        <span className="text-xs font-medium">Dataset</span>
      </div>

      <div className="relative flex-1 max-w-md">
        <SearchableSelect
          aria-label="Dataset"
          value={datasetId != null ? String(datasetId) : ''}
          onChange={handleChange}
          disabled={loading}
          placeholder="Select a dataset..."
          searchPlaceholder="Type a file or company name…"
          options={datasets.map((dataset) => ({
            value: String(dataset.id),
            label: dataset.nickname || dataset.fileName || `Dataset ${dataset.id}`,
            hint: `${dataset.insuranceCompany} - ${dataset.rows.toLocaleString()} rows`,
          }))}
        />
      </div>

      {selectedDataset && (
        <div className="text-xs text-muted-foreground">
          {selectedDataset.rows.toLocaleString()} rows
        </div>
      )}
    </div>
  );
}
