import { cn } from '@/lib/utils';
import { Illustration, type IllustrationName } from '@/components/brand/Illustration';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Small teal label above the title, e.g. "Detection" */
  eyebrow?: string;
  /** Deck creative shown at the right edge of the header */
  illustration?: IllustrationName;
  className?: string;
}

/** Deck-style headline: light weight with the last word in bold. */
function EmphasisTitle({ title }: { title: string }) {
  const trimmed = title.trim();
  const split = trimmed.lastIndexOf(' ');

  if (split === -1) {
    return <strong>{trimmed}</strong>;
  }

  return (
    <>
      {trimmed.slice(0, split)} <strong>{trimmed.slice(split + 1)}</strong>
    </>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  illustration = 'network',
  className,
}: PageHeaderProps) {
  const isCreative = illustration !== 'network';

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]',
        className
      )}
    >
      {/* soft brand wash + creative */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_0%,color-mix(in_srgb,var(--color-brand-blue)_10%,transparent),transparent_70%)]" />
      <Illustration
        name={illustration}
        className={cn(
          'absolute hidden object-contain xl:block',
          !isCreative && 'right-0 top-0 h-full opacity-25 dark:opacity-40',
          isCreative && (illustration === 'car' || illustration === 'medical')
            ? 'right-8 top-1/2 h-40 w-48 -translate-y-1/2'
            : isCreative
              ? 'right-8 top-1/2 h-28 w-56 -translate-y-1/2'
              : ''
        )}
      />

      <div
        className={cn(
          'relative flex flex-col gap-5 px-8 py-7 md:flex-row md:items-center md:justify-between',
          isCreative && 'xl:pr-72'
        )}
      >
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="display text-3xl md:text-4xl">
            <EmphasisTitle title={title} />
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex flex-shrink-0 items-center gap-3 md:justify-end">{actions}</div>}
      </div>
    </header>
  );
}
