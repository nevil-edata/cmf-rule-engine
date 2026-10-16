import { cn } from '@/lib/utils';
import { Illustration, type IllustrationName } from './Illustration';

interface EmptyStateProps {
  illustration?: IllustrationName;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Branded empty state: deck illustration, eyebrow, light headline and one action. */
export function EmptyState({
  illustration = 'grid',
  eyebrow,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-input bg-card px-6 py-12 text-center',
        className
      )}
    >
      <Illustration name={illustration} className="h-40 w-auto max-w-full" />
      {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
      <h3 className={cn('display text-2xl', eyebrow ? 'mt-2' : 'mt-6')}>{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
