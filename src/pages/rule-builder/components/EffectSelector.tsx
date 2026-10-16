import { useAtom } from 'jotai';
import { AlertTriangle, XOctagon } from 'lucide-react';
import { ruleBuilderCurrentEffectAtom } from '@/store/atoms/ruleBuilder';
import type { RuleEffect } from '@/lib/types/ruleBuilder';

interface EffectSelectorProps {
  disabled?: boolean;
  title?: string;
}

export function EffectSelector({ disabled, title }: EffectSelectorProps) {
  const [effect, setEffect] = useAtom(ruleBuilderCurrentEffectAtom);

  const handleSelect = (newEffect: RuleEffect) => {
    if (disabled) return;
    setEffect(newEffect);
  };

  return (
    <div className="flex gap-2">
      {/* Moderate Risk */}
      <button
        onClick={() => handleSelect('moderate')}
        disabled={disabled}
        title={title}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          effect === 'moderate'
            ? 'bg-warning/20 border-warning/50 text-warning'
            : 'bg-card border-input text-muted-foreground hover:border-input'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-medium">Moderate</span>
      </button>

      {/* High Risk */}
      <button
        onClick={() => handleSelect('high')}
        disabled={disabled}
        title={title}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          effect === 'high'
            ? 'bg-destructive/20 border-destructive/50 text-destructive'
            : 'bg-card border-input text-muted-foreground hover:border-input'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <XOctagon className="h-4 w-4" />
        <span className="text-xs font-medium">High</span>
      </button>
    </div>
  );
}
