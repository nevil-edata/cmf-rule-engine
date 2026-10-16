import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { anchoredStyle, useAnchoredPosition } from './useAnchoredPosition';

export interface SuggestInputProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Every name that can be suggested; the box shows the best few that match what was typed */
  suggestions: string[];
  maxSuggestions?: number;
  placeholder?: string;
  className?: string;
  /** Extra classes for the text box itself (for example a smaller height) */
  inputClassName?: string;
  id?: string;
  'aria-label'?: string;
}

export function matchSuggestions(suggestions: string[], query: string, max: number): string[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const seen = new Set<string>();
  const matches: string[] = [];
  for (const s of suggestions) {
    if (seen.has(s)) continue;
    const lower = s.toLowerCase();
    if (words.every((w) => lower.includes(w))) {
      seen.add(s);
      matches.push(s);
    }
  }
  const first = words[0];
  matches.sort((a, b) => Number(!a.toLowerCase().startsWith(first)) - Number(!b.toLowerCase().startsWith(first)));
  return matches.slice(0, max);
}

/**
 * A search box that suggests real names as you type. Picking a suggestion fills the box with that
 * exact name; typing without picking still works as a plain search.
 */
export function SuggestInput({
  value,
  onValueChange,
  suggestions,
  maxSuggestions = 8,
  placeholder = 'Search…',
  className,
  inputClassName,
  id,
  'aria-label': ariaLabel,
}: SuggestInputProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = useMemo(
    () => matchSuggestions(suggestions, value, maxSuggestions),
    [suggestions, value, maxSuggestions]
  );
  // Nothing to suggest once the box already holds exactly the only match
  const showable = matches.filter((m) => m !== value);
  const open = focused && !dismissed && showable.length > 0;
  // Wide enough for long ids (claim numbers) even when the box itself is narrow
  const pos = useAnchoredPosition(open, wrapRef, 320);

  useEffect(() => {
    setActive(-1);
    setDismissed(false);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setDismissed(true);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const pick = (s: string) => {
    onValueChange(s);
    setDismissed(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' && showable.length > 0) {
        e.preventDefault();
        setDismissed(false);
        setActive(0);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, showable.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(showable[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDismissed(true);
    }
  };

  return (
    <div ref={wrapRef} className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-opt-${active}` : undefined}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-card pl-9 pr-9 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
          inputClassName
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onValueChange('')}
          className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open &&
        pos &&
        createPortal(
          <ul
            ref={panelRef}
            id={listId}
            role="listbox"
            style={anchoredStyle(pos)}
            className="z-[100] max-h-72 overflow-y-auto rounded-xl border border-border bg-card p-1 text-foreground shadow-lg"
          >
            {showable.map((s, index) => (
              <li
                key={s}
                id={`${listId}-opt-${index}`}
                role="option"
                title={s}
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className={cn(
                  'cursor-pointer truncate rounded-lg px-3 py-1.5 text-sm',
                  index === active ? 'bg-primary/10' : ''
                )}
              >
                {s}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
