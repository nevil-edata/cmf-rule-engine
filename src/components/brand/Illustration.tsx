import { cn } from '@/lib/utils';
import network from '@/assets/brand/network.svg';
import carScan from '@/assets/brand/car-scan.svg';
import medicalScan from '@/assets/brand/medical-scan.svg';
import cleanGrid from '@/assets/brand/clean-grid.svg';
import scoreHistogram from '@/assets/brand/score-histogram.svg';
import signalOutlier from '@/assets/brand/signal-outlier.svg';
import signalCombination from '@/assets/brand/signal-combination.svg';

/** Creatives taken from the ClaimCPU Motor / Health decks. */
const illustrations = {
  network,
  car: carScan,
  medical: medicalScan,
  grid: cleanGrid,
  histogram: scoreHistogram,
  outlier: signalOutlier,
  combination: signalCombination,
} as const;

export type IllustrationName = keyof typeof illustrations;

interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  alt?: string;
}

export function Illustration({ name, className, alt = '' }: IllustrationProps) {
  return (
    <img
      src={illustrations[name]}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      draggable={false}
      className={cn('pointer-events-none select-none', className)}
    />
  );
}
