import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { anchoredStyle, useAnchoredPosition } from './useAnchoredPosition';

export interface SearchableOption {
  value: string;
  label: string;
  /** Secondary text, also searched (for example the company a dataset belongs to) */
  hint?: string;
}

export interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  /** Shown when nothing is selected */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** When set, a first entry with this text clears the selection (value '') */
  clearLabel?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/** Keep options where every typed word appears in the label or hint; prefix matches first. */
export function filterOptions(options: SearchableOption[], query: string): SearchableOption[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;
  const matches = options.filter((o) => {
    const haystack = `${o.label} ${o.hint ?? ''}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
  const first = words[0];
  return [...matches].sort(
    (a, b) => Number(!a.label.toLowerCase().startsWith(first)) - Number(!b.label.toLowerCase().startsWith(first))
  );
}

/**
 * A dropdown you can type into. The browser's own <select> jumps to the first option that starts
 * with the letter you press; this one filters the list as you type and only selects what you
 * pick (click, or arrow keys and Enter).
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Type to search…',
  emptyText = 'No matches',
  clearLabel,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
}: SearchableSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pos = useAnchoredPosition(open, triggerRef);

  const selected = options.find((o) => o.value === value);

  const visible = useMemo(() => {
    const found = filterOptions(options, query);
    return clearLabel && !query ? [{ value: '', label: clearLabel }, ...found] : found;
  }, [options, query, clearLabel]);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setQuery('');
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const choose = useCallback(
    (option: SearchableOption) => {
      onChange(option.value);
      close(true);
    },
    [onChange, close]
  );

  const openWith = (initial: string) => {
    if (disabled) return;
    setQuery(initial);
    setActive(0);
    setOpen(true);
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, pos !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close when clicking anywhere else
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);

  // Keep the highlighted row in view
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open, listId]);

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(visible.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = visible[active];
      if (option) choose(option);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openWith('');
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== ' ') {
      // Typing on the closed dropdown starts a search (instead of jumping to a random option)
      e.preventDefault();
      openWith(e.key);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => (open ? close(false) : openWith(''))}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-1 text-left text-sm text-foreground shadow-sm transition-colors',
          'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            style={anchoredStyle(pos)}
            className="z-[100] overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-lg"
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder={searchPlaceholder}
                aria-label="Search options"
                aria-controls={listId}
                aria-activedescendant={visible.length ? `${listId}-opt-${active}` : undefined}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1">
              {visible.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</li>
              ) : (
                visible.map((option, index) => (
                  <li
                    key={`${option.value}-${index}`}
                    id={`${listId}-opt-${index}`}
                    role="option"
                    aria-selected={option.value === value}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(option)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm',
                      index === active ? 'bg-primary/10 text-foreground' : 'text-foreground'
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.hint && <span className="block truncate text-xs text-muted-foreground">{option.hint}</span>}
                    </span>
                    {option.value === value && option.value !== '' && (
                      <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
