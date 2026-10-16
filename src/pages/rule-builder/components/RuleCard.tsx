import { useAtomValue } from 'jotai';
import { X, AlertTriangle, XOctagon, GripVertical } from 'lucide-react';
import { ruleBuilderDimensionsAtom } from '@/store/atoms/ruleBuilder';
import { useWriteAccess } from '@/hooks/useWriteAccess';
import { getOperatorBySymbol } from '../utils/operators';
import type { Rule, DimensionDataType } from '@/lib/types/ruleBuilder';

interface RuleCardProps {
  rule: Rule;
  onDelete: () => void;
}

const VALUE_COLORS: Record<DimensionDataType, string> = {
  Number: 'bg-success',
  String: 'bg-primary',
  Boolean: 'bg-primary',
  Date: 'bg-input',
};

export function RuleCard({ rule, onDelete }: RuleCardProps) {
  const dimensions = useAtomValue(ruleBuilderDimensionsAtom);
  const { canWrite } = useWriteAccess();

  // Find dimension info
  const dimension = dimensions.find((d) => d.name === rule.field);
  const operator = getOperatorBySymbol(rule.operator);
  const valueColor = dimension ? VALUE_COLORS[dimension.dataType] : 'bg-input';

  // Format value for display
  const formatValue = (value: string | number | boolean | null): string => {
    if (value === null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:border-input group"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Drag handle */}
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0" />

      {/* Rule content */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {/* Field pill */}
        <span className="px-2 py-1 text-xs font-medium bg-muted text-foreground rounded">
          {dimension?.displayName || rule.field}
        </span>

        {/* Operator */}
        <span className="text-xs text-muted-foreground font-mono">{operator?.name || rule.operator}</span>

        {/* Value pill (if present) */}
        {rule.value !== null && rule.value !== undefined && (
          <span className={`px-2 py-1 text-xs font-mono text-white rounded ${valueColor}`}>
            {formatValue(rule.value)}
          </span>
        )}
      </div>

      {/* Effect badge */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
          rule.effect === 'high'
            ? 'bg-destructive/20 text-destructive'
            : 'bg-warning/20 text-warning'
        }`}
      >
        {rule.effect === 'high' ? (
          <XOctagon className="h-3 w-3" />
        ) : (
          <AlertTriangle className="h-3 w-3" />
        )}
        <span>{rule.effect === 'high' ? 'High' : 'Moderate'}</span>
      </div>

      {/* Delete button */}
      {canWrite && (
        <button
          onClick={onDelete}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          title="Delete rule"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
