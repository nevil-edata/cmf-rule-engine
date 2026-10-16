import { cn } from '@/lib/utils';

interface TreeStatusDotProps {
  status: 'active' | 'inactive';
}

export function TreeStatusDot({ status }: TreeStatusDotProps) {
  return (
    <div
      className={cn(
        'h-2 w-2 flex-shrink-0 rounded-full',
        status === 'active' ? 'bg-success' : 'bg-muted-foreground/50'
      )}
    />
  );
}
