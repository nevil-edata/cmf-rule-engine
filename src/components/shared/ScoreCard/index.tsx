import { useState } from 'react';
import type { TraceResult } from '@/lib/types/trace';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScoreCardProps {
  result: TraceResult;
  showBreakdown?: boolean;
}

export function ScoreCard({ result, showBreakdown = true }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lane colours from the ClaimCPU decks: teal (STP), amber (Moderate), red (Non-STP)
  const riskConfig = {
    low: {
      label: 'Low Risk',
      accent: 'bg-success text-white',
      text: 'text-success',
      bar: 'bg-success',
    },
    moderate: {
      label: 'Moderate Risk',
      accent: 'bg-warning text-white',
      text: 'text-warning',
      bar: 'bg-warning',
    },
    high: {
      label: 'High Risk',
      accent: 'bg-destructive text-white',
      text: 'text-destructive',
      bar: 'bg-destructive',
    },
  } as const;

  const config = riskConfig[result.riskLevel];
  const percentage = (result.probability * 100).toFixed(1);

  const breakdownText =
    result.paths.map((p) => p.leafValue.toFixed(3)).join(' + ') + ` = ${result.totalScore.toFixed(3)}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 text-foreground shadow-[var(--shadow-card)]">
      <div className={`absolute inset-y-0 left-0 w-1.5 ${config.bar}`} />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-info/10 blur-3xl" />

      <div className="relative space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">Fraud probability</p>
            <h2 className="display text-6xl">
              <strong>{percentage}</strong>
              <span className="text-4xl text-muted-foreground">%</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on the combined contribution of {result.paths.length} trees for claim{' '}
              <span className="font-mono text-foreground">{result.claimNumber}</span>.
            </p>
          </div>

          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-secondary" />
            <div className={`absolute inset-0 rounded-full border-4 border-transparent ${config.text}`}
              style={{ borderTopColor: 'currentColor', borderRightColor: 'currentColor', transform: 'rotate(-45deg)' }} />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-muted text-center">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Score
                <span className="block pt-0.5 text-2xl font-semibold tracking-normal text-foreground">
                  {result.totalScore.toFixed(2)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {showBreakdown && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/60 px-5 py-3 text-left font-mono text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>Sum: {breakdownText}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isExpanded && (
              <div className="grid gap-3 text-sm">
                {result.paths.map((path, index) => {
                  const isPositive = path.leafValue >= 0;
                  const valueColor = isPositive ? 'text-destructive' : 'text-success';

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono"
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Tree #{path.treeIndex}
                      </span>
                      <span className={`text-base font-semibold ${valueColor}`}>
                        {isPositive ? '+' : ''}
                        {path.leafValue.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full ${config.accent} px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]`}
            >
              {config.label}
            </span>
            <span className={`text-sm font-medium ${config.text}`}>
              Probability {percentage}%
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last evaluated on{' '}
            <span className="font-medium text-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
