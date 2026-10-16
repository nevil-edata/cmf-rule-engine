import { cn } from '@/lib/utils';
import type { RuleEffect } from '@/lib/types/ruleBuilder';

interface SeverityBadgeProps {
  severity: RuleEffect | null;
  size?: 'xs' | 'sm' | 'md';
}

const sizeClasses = {
  xs: 'text-[10px] px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
};

export function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
  if (!severity) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded font-medium',
          sizeClasses[size],
          'bg-muted/50 text-muted-foreground'
        )}
      >
        None
      </span>
    );
  }

  const colorClasses = severity === 'high'
    ? 'bg-destructive/20 text-destructive border-destructive/30'
    : 'bg-warning/20 text-warning border-warning/30';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium border',
        sizeClasses[size],
        colorClasses
      )}
    >
      {severity === 'high' ? 'High' : 'Moderate'}
    </span>
  );
}
