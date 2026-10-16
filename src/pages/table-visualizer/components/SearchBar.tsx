import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SuggestInput } from '@/components/ui/suggest-input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  claimNumberColumn: string | null;
  /** Claim numbers in the loaded data, suggested while typing */
  suggestions?: string[];
}

export function SearchBar({ value, onChange, placeholder, claimNumberColumn, suggestions = [] }: SearchBarProps) {
  const disabled = !claimNumberColumn;

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Search Claims
      </Label>
      {disabled ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Select claim number column first"
            disabled
            className="pl-9 h-8 bg-card border-border"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground/80" />
            </button>
          )}
        </div>
      ) : (
        <SuggestInput
          value={value}
          onValueChange={onChange}
          suggestions={suggestions}
          placeholder={placeholder}
          inputClassName="h-8"
        />
      )}
      {claimNumberColumn && (
        <p className="text-xs text-muted-foreground">
          Searching in: <span className="font-mono">{claimNumberColumn}</span>
        </p>
      )}
    </div>
  );
}
