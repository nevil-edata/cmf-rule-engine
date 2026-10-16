import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'uploading' | 'processing' | 'uploaded' | 'failed' | 'ready';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          dotColor: 'bg-info',
          textColor: 'text-info',
          label: 'Uploading',
          showSpinner: true,
        };
      case 'processing':
        return {
          dotColor: 'bg-warning',
          textColor: 'text-warning',
          label: 'Processing',
          showSpinner: true,
        };
      case 'uploaded':
      case 'ready':
        return {
          dotColor: 'bg-success',
          textColor: 'text-success',
          label: 'Ready',
          showSpinner: false,
        };
      case 'failed':
        return {
          dotColor: 'bg-destructive',
          textColor: 'text-destructive',
          label: 'Failed',
          showSpinner: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      {config.showSpinner ? (
        <Loader2 className={`h-3 w-3 animate-spin ${config.textColor}`} />
      ) : (
        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
      )}
      <span className={`text-sm ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
