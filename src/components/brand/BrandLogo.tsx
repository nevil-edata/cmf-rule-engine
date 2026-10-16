import { cn } from '@/lib/utils';
import claimcpuWhite from '@/assets/brand/claimcpu-logo-white.png';
import claimcpuDark from '@/assets/brand/claimcpu-logo-dark.png';
import edataWhite from '@/assets/brand/edata-logo-white.png';
import edataColor from '@/assets/brand/edata-logo.png';
import claimcpuStacked from '@/assets/brand/claimcpu-stacked.png';

/**
 * Where the logo sits:
 * - onDark:  always the white wordmark (sidebar, hero, auth panel)
 * - onLight: always the navy wordmark
 * - auto:    follows the light/dark theme
 */
export type LogoTone = 'onDark' | 'onLight' | 'auto';

interface LogoProps {
  tone?: LogoTone;
  className?: string;
}

function ThemedImage({
  tone,
  light,
  dark,
  alt,
  className,
}: {
  tone: LogoTone;
  light: string;
  dark: string;
  alt: string;
  className?: string;
}) {
  // `light` is the asset for light backgrounds, `dark` the asset for dark backgrounds.
  if (tone === 'onDark') {
    return <img src={dark} alt={alt} className={className} draggable={false} />;
  }
  if (tone === 'onLight') {
    return <img src={light} alt={alt} className={className} draggable={false} />;
  }
  return (
    <>
      <img src={light} alt={alt} className={cn(className, 'dark:hidden')} draggable={false} />
      <img src={dark} alt="" aria-hidden className={cn(className, 'hidden dark:block')} draggable={false} />
    </>
  );
}

/** ClaimCPU wordmark with the "Precision in Decision" tagline. */
export function ClaimCPULogo({ tone = 'auto', className }: LogoProps) {
  return (
    <ThemedImage
      tone={tone}
      light={claimcpuDark}
      dark={claimcpuWhite}
      alt="ClaimCPU - Precision in Decision"
      className={cn('h-8 w-auto select-none object-contain', className)}
    />
  );
}

/** eData Information lockup (network globe + name). */
export function EdataLogo({ tone = 'auto', className }: LogoProps) {
  return (
    <ThemedImage
      tone={tone}
      light={edataColor}
      dark={edataWhite}
      alt="eData Information - The Information Company"
      className={cn('h-8 w-auto select-none object-contain', className)}
    />
  );
}

/** Stacked ClaimCPU wordmark (CLAIM over CPU), white, for narrow spots such as the collapsed sidebar. */
export function ClaimCPUMark({ className }: { className?: string }) {
  return (
    <img
      src={claimcpuStacked}
      alt="ClaimCPU"
      className={cn('w-12 select-none object-contain', className)}
      draggable={false}
    />
  );
}
