import { FileText, Receipt, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DatasetGranularity } from '@/lib/db/types';

interface GranularityBadgeProps {
  granularity: DatasetGranularity;
  className?: string;
}

export default function GranularityBadge({ granularity, className }: GranularityBadgeProps) {
  const config = {
    claim: {
      icon: FileText,
      label: 'Claim',
      colorClass: 'border-success/50 bg-success/10 text-success',
    },
    invoice: {
      icon: Receipt,
      label: 'Invoice',
      colorClass: 'border-warning/50 bg-warning/10 text-warning',
    },
    item: {
      icon: Package,
      label: 'Item',
      colorClass: 'border-info/50 bg-info/10 text-info',
    },
  };

  const { icon: Icon, label, colorClass } = config[granularity];

  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 ${colorClass} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}
