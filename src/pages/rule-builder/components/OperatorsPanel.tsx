import { useAtom } from 'jotai';
import { Code, Type, CircleSlash } from 'lucide-react';
import { OperatorItem } from './OperatorItem';
import { EffectSelector } from './EffectSelector';
import { useWriteAccess } from '@/hooks/useWriteAccess';
import { OPERATOR_GROUPS } from '../utils/operators';
import { ruleBuilderDatasetIdAtom } from '@/store/atoms/ruleBuilder';

const GROUP_CONFIG = {
  comparison: { icon: Code, label: 'Comparisons' },
  text: { icon: Type, label: 'Text' },
  null: { icon: CircleSlash, label: 'Null Checks' },
};

export function OperatorsPanel() {
  const [datasetId] = useAtom(ruleBuilderDatasetIdAtom);
  const { canWrite } = useWriteAccess();

  return (
    <aside className="h-full border-l flex flex-col overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Operators & Flags
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Effect Selector */}
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1 mb-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Risk Effect
            </span>
            <span className="text-[9px] text-destructive">(required)</span>
          </div>
          <EffectSelector disabled={!datasetId || !canWrite} title={!canWrite ? 'Read-only access for client users.' : undefined} />
        </div>

        {/* Divider */}
        <div className="border-t mx-2" style={{ borderColor: 'var(--color-border)' }} />

        {/* Operators by group */}
        {(Object.entries(OPERATOR_GROUPS) as [keyof typeof OPERATOR_GROUPS, typeof OPERATOR_GROUPS.comparison][]).map(
          ([group, operators]) => {
            const config = GROUP_CONFIG[group];
            const Icon = config.icon;

            return (
              <div key={group}>
                <div className="flex items-center gap-2 px-2 py-1 mb-2">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {config.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {operators.map((op) => (
                    <OperatorItem key={op.symbol} operator={op} disabled={!datasetId || !canWrite} />
                  ))}
                </div>
              </div>
            );
          }
        )}

        {/* Connectors */}
        <div className="border-t mx-2 pt-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 px-2 py-1 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Logical
            </span>
          </div>
          <div className="flex gap-2 px-2">
            <button
              disabled={!datasetId || !canWrite}
              title={!canWrite ? 'Read-only access for client users.' : undefined}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-muted text-foreground/80 rounded border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              AND
            </button>
            <button
              disabled={!datasetId || !canWrite}
              title={!canWrite ? 'Read-only access for client users.' : undefined}
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-muted text-foreground/80 rounded border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              OR
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
