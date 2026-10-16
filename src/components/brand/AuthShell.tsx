import { ClaimCPULogo, EdataLogo } from './BrandLogo';
import { Illustration } from './Illustration';

interface AuthShellProps {
  children: React.ReactNode;
}

/**
 * Split sign-in layout: navy hero (deck cover) on the left, form on the right.
 * On narrow screens the hero collapses to a slim brand bar.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
      {/* Hero */}
      <aside className="surface-hero network-backdrop relative flex flex-col justify-between overflow-hidden px-8 py-8 lg:w-[46%] lg:min-h-screen lg:px-14 lg:py-12">
        <EdataLogo tone="onDark" className="h-14 self-start" />

        <div className="my-10 hidden lg:block">
          <span className="inline-block rounded-full bg-teal-200 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy-950">
            AI Claims Automation
          </span>
          <ClaimCPULogo tone="onDark" className="mt-6 h-16" />
          <p className="mt-8 max-w-md text-3xl font-light leading-snug tracking-tight text-white">
            Every claim read, benchmarked and <strong className="font-semibold">routed</strong>.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#c9d3e6]">
            Clean claims settle fast. The unusual ones reach the right person, with the reasons attached.
          </p>

          <div className="mt-10 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
            <span className="rounded-full border border-teal-500/60 px-3 py-1 text-teal-200">STP</span>
            <span className="rounded-full border border-amber-brand/60 px-3 py-1 text-amber-brand">Moderate</span>
            <span className="rounded-full border border-red-brand/70 px-3 py-1 text-[#ff8a75]">Non-STP</span>
          </div>
        </div>

        <div className="lg:hidden">
          <ClaimCPULogo tone="onDark" className="h-10" />
        </div>

        <p className="hidden text-xs text-[#8e9bb5] lg:block">eData Information &middot; edata.digital</p>
      </aside>

      {/* Form */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6 sm:p-10">
        <Illustration
          name="grid"
          className="absolute -bottom-6 -right-6 hidden h-48 w-auto opacity-25 lg:block dark:opacity-15"
        />
        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
