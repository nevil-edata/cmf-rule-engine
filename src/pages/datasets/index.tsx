import { useEffect, useMemo, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { SuggestInput } from '@/components/ui/suggest-input';
import { getDatasets, deleteDataset, type DatasetWithStatus } from '@/lib/db/operations';
import { supabase } from '@/lib/db/supabase';
import { useWriteAccess } from '@/hooks/useWriteAccess';
import DatasetTable from './components/DatasetTable';
import UploadModal from './components/UploadModal';
import { useDatasetSort } from './hooks/useDatasetSort';

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { canWrite } = useWriteAccess();

  const { sortedDatasets, sortConfig, handleSort } = useDatasetSort(datasets);

  const datasetLabel = (d: DatasetWithStatus) => d.nickname || d.fileName || `Dataset #${d.id}`;
  const visibleDatasets = useMemo(() => {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return sortedDatasets;
    return sortedDatasets.filter((d) => {
      const haystack = `${datasetLabel(d)} ${d.fileName ?? ''} ${d.insuranceCompany} ${d.country}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [sortedDatasets, search]);

  useEffect(() => {
    loadDatasets();

    // Subscribe to dataset_upload_status changes for realtime updates
    const channel = supabase
      .channel('datasets-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dataset_upload_status',
        },
        () => {
          // Reload datasets when any upload status changes
          loadDatasets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadDatasets() {
    try {
      const data = await getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDataset(id);
      setDatasets(datasets.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      alert('Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        className="mb-6"
        eyebrow="Data"
        title="Datasets"
        description="Manage your uploaded claims datasets"
        illustration="grid"
        actions={
          <div className="flex items-center gap-4">
            {/* Search by file name, company or country; suggests matching names */}
            <SuggestInput
              className="w-64"
              placeholder="Search files..."
              value={search}
              onValueChange={setSearch}
              suggestions={datasets.flatMap((d) => [datasetLabel(d), d.insuranceCompany])}
            />
            {/* Upload button */}
            {canWrite && (
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Dataset
              </Button>
            )}
          </div>
        }
      />

      <DatasetTable
        datasets={visibleDatasets}
        onDelete={handleDelete}
        deletingId={deletingId}
        sortConfig={sortConfig}
        onSort={handleSort}
        onUploadClick={() => setUploadModalOpen(true)}
        canWrite={canWrite}
      />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false);
          loadDatasets();
        }}
      />
    </div>
  );
}
