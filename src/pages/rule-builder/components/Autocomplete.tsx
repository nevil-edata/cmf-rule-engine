import { Hash, Type, Code, GitBranch, HelpCircle, Calendar, ToggleLeft } from 'lucide-react';
import type { AutocompleteSuggestion, AutocompleteContext, DimensionDataType } from '@/lib/types/ruleBuilder';

interface AutocompleteProps {
  suggestions: AutocompleteSuggestion[];
  selectedIndex: number;
  onSelect: (value: string) => void;
  context: AutocompleteContext;
}

const TYPE_ICONS: Record<string, typeof Hash> = {
  field: Type,
  operator: Code,
  value: Hash,
  connector: GitBranch,
  unknown: HelpCircle,
};

const DATA_TYPE_ICONS: Record<DimensionDataType, typeof Hash> = {
  Number: Hash,
  String: Type,
  Date: Calendar,
  Boolean: ToggleLeft,
};

const DATA_TYPE_COLORS: Record<DimensionDataType, string> = {
  Number: 'text-success',
  String: 'text-warning',
  Date: 'text-info',
  Boolean: 'text-info',
};

export function Autocomplete({ suggestions, selectedIndex, onSelect, context }: AutocompleteProps) {
  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 max-h-64 overflow-y-auto rounded-lg border shadow-lg z-50"
      style={{
        borderColor: 'var(--color-input)',
        backgroundColor: 'var(--color-card)',
        boxShadow: 'var(--shadow-pop)',
      }}
    >
      {/* Context header */}
      <div className="px-3 py-2 border-b text-[10px] uppercase tracking-wider text-muted-foreground" style={{ borderColor: 'var(--color-border)' }}>
        {context === 'field' && 'Select a field'}
        {context === 'operator' && 'Select an operator'}
        {context === 'value' && 'Select a value'}
        {context === 'connector' && 'Select a connector'}
      </div>

      {/* Suggestions */}
      <div className="py-1">
        {suggestions.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground italic">
            No matches found
          </div>
        ) : (
          suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;

            // Get appropriate icon
            let Icon = TYPE_ICONS[suggestion.type];
            let iconColor = 'text-muted-foreground';

            if (suggestion.type === 'field' && suggestion.dataType) {
              Icon = DATA_TYPE_ICONS[suggestion.dataType];
              iconColor = DATA_TYPE_COLORS[suggestion.dataType];
            }

            return (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                  isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelect(suggestion.value)}
                onMouseEnter={() => {}}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />

                <div className="flex-1 min-w-0">
                  <span
                    className="text-foreground"
                    style={{ fontFamily: suggestion.type === 'operator' ? 'JetBrains Mono, monospace' : 'inherit' }}
                  >
                    {suggestion.displayValue}
                  </span>

                  {suggestion.description && (
                    <span className="text-xs text-muted-foreground ml-2">{suggestion.description}</span>
                  )}
                </div>

                {/* Data type badge for fields */}
                {suggestion.type === 'field' && suggestion.dataType && (
                  <span className={`text-[10px] font-mono ${DATA_TYPE_COLORS[suggestion.dataType]}`}>
                    {suggestion.dataType}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Keyboard hints */}
      <div className="px-3 py-2 border-t flex items-center gap-4 text-[10px] text-muted-foreground" style={{ borderColor: 'var(--color-border)' }}>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-muted rounded text-muted-foreground">Tab</kbd>
          <span>select</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-muted rounded text-muted-foreground">Esc</kbd>
          <span>dismiss</span>
        </span>
      </div>
    </div>
  );
}
