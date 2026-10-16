import { Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DatasetWithStatus } from '@/lib/db/operations';
import StatusBadge from '@/pages/datasets/components/StatusBadge';
import SourceBadge from '@/pages/datasets/components/SourceBadge';
import GranularityBadge from '@/pages/datasets/components/GranularityBadge';
import { formatRelativeTime } from '../utils/formatRelativeTime';

interface DatasetHeaderProps {
  dataset: DatasetWithStatus;
  onDelete: () => void;
  onDownloadRaw: () => void;
  onDownloadAligned: () => void;
  deleting: boolean;
  canWrite?: boolean;
}

export default function DatasetHeader({
  dataset,
  onDelete,
  onDownloadRaw,
  onDownloadAligned,
  deleting,
  canWrite = true,
}: DatasetHeaderProps) {
  const status = dataset.uploadStatus?.status || 'ready';

  return (
    <div className="space-y-4">
      {/* Title row (breadcrumbs live in the top header, set by the page) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="display text-3xl">
            {dataset.nickname || dataset.fileName || `Dataset #${dataset.id}`}
          </h1>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <SourceBadge text={dataset.insuranceCompany} />
        <SourceBadge text={dataset.country} />
        <GranularityBadge granularity={dataset.granularity} />
        <span className="font-mono text-muted-foreground">{dataset.rows} Rows</span>
        <span className="text-muted-foreground">•</span>
        <span className="font-mono text-muted-foreground">{dataset.columns} Cols</span>
        {dataset.uploadedAt && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Uploaded {formatRelativeTime(dataset.uploadedAt)}
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <div className="flex gap-1 overflow-hidden rounded-lg border border-input bg-card">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadRaw}
            disabled={!dataset.rawFilePath}
            className="rounded-none border-r border-input hover:bg-muted"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Raw</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadAligned}
            disabled={!dataset.alignedFilePath}
            className="rounded-none hover:bg-muted"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Aligned</span>
          </Button>
        </div>
        {canWrite && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span className="text-xs">Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                <span className="text-xs">Delete</span>
              </>
            )}
          </Button>
        )}
        <Button variant="outline" size="sm" disabled title="Quality metrics auto-update when alignment changes">
          Run Quality Check
        </Button>
      </div>
    </div>
  );
}
