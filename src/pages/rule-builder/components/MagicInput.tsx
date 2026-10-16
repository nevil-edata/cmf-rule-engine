import { useRef, useCallback, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { CornerDownLeft, Loader2, AlertCircle } from 'lucide-react';
import {
  magicInputTextAtom,
  magicInputCursorAtom,
  autocompleteVisibleAtom,
  autocompleteIndexAtom,
  dropTargetActiveAtom,
  draggedItemAtom,
  ruleBuilderCurrentEffectAtom,
  ruleBuilderDatasetIdAtom,
} from '@/store/atoms/ruleBuilder';
import { useMagicInputParser } from '../hooks/useMagicInputParser';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useRuleCommit } from '../hooks/useRuleCommit';
import { useWriteAccess } from '@/hooks/useWriteAccess';
import { Autocomplete } from './Autocomplete';
import type { Token } from '@/lib/types/ruleBuilder';

// Token color styles based on type
const TOKEN_COLORS: Record<string, string> = {
  field: 'text-info',
  operator: 'text-warning',
  value: 'text-success',
  connector: 'text-info',
  unknown: 'text-muted-foreground',
  error: 'text-destructive underline decoration-wavy decoration-red-500',
};

function TokenSpan({ token }: { token: Token }) {
  const colorClass = token.hasError ? TOKEN_COLORS.error : TOKEN_COLORS[token.type] || TOKEN_COLORS.unknown;
  return (
    <span className={colorClass} title={token.errorMessage}>
      {token.value}
    </span>
  );
}

export function MagicInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useAtom(magicInputTextAtom);
  const [cursorPos, setCursorPos] = useAtom(magicInputCursorAtom);
  const [autocompleteVisible, setAutocompleteVisible] = useAtom(autocompleteVisibleAtom);
  const [autocompleteIndex, setAutocompleteIndex] = useAtom(autocompleteIndexAtom);
  const dropTargetActive = useAtomValue(dropTargetActiveAtom);
  const draggedItem = useAtomValue(draggedItemAtom);
  const setDropTargetActive = useSetAtom(dropTargetActiveAtom);
  const [currentEffect, setCurrentEffect] = useAtom(ruleBuilderCurrentEffectAtom);
  const datasetId = useAtomValue(ruleBuilderDatasetIdAtom);
  const { canWrite } = useWriteAccess();

  // Toggle effect between high and moderate
  const toggleEffect = useCallback(() => {
    if (!canWrite) return;
    setCurrentEffect(currentEffect === 'high' ? 'moderate' : 'high');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEffect, setCurrentEffect, canWrite]);

  const { tokens, currentToken, context, fieldToken, isValidSyntax, syntaxError } = useMagicInputParser(text, cursorPos);
  const { suggestions, isLoading } = useAutocomplete(context, currentToken, fieldToken, tokens);
  const { commitRule, canCommit } = useRuleCommit(tokens);

  // Build highlighted text from tokens
  const highlightedText = useCallback(() => {
    if (tokens.length === 0) return null;

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    tokens.forEach((token, index) => {
      // Add whitespace before token
      if (token.start > lastEnd) {
        elements.push(<span key={`ws-${index}`}>{text.slice(lastEnd, token.start)}</span>);
      }
      elements.push(<TokenSpan key={`token-${index}`} token={token} />);
      lastEnd = token.end;
    });

    // Add trailing whitespace
    if (lastEnd < text.length) {
      elements.push(<span key="ws-end">{text.slice(lastEnd)}</span>);
    }

    return elements;
  }, [tokens, text]);

  // Show autocomplete based on context and suggestions
  useEffect(() => {
    // Don't hide during loading
    if (isLoading) {
      return;
    }

    const hasSuggestions = suggestions.length > 0;

    if (hasSuggestions && text.length > 0) {
      if (!autocompleteVisible) {
        setAutocompleteVisible(true);
        setAutocompleteIndex(0);
      }
    } else if (text.length === 0) {
      // Only hide when input is empty
      setAutocompleteVisible(false);
    }
    // When suggestions become empty but text exists, keep dropdown visible
    // This prevents flicker during filtering - dropdown will show "no matches" state
  }, [suggestions.length, text, isLoading, autocompleteVisible, setAutocompleteVisible, setAutocompleteIndex]);

  const insertSuggestion = useCallback(
    (value: string) => {
      if (!currentToken) {
        setText(text + value + ' ');
      } else {
        const before = text.slice(0, currentToken.start);
        const after = text.slice(currentToken.end);
        setText(before + value + ' ' + after.trimStart());
      }
      setAutocompleteVisible(false);
      inputRef.current?.focus();
    },
    [currentToken, text, setText, setAutocompleteVisible]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle autocomplete navigation
      if (autocompleteVisible && suggestions.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setAutocompleteIndex((i) => Math.min(i + 1, suggestions.length - 1));
            return;
          case 'ArrowUp':
            e.preventDefault();
            setAutocompleteIndex((i) => Math.max(i - 1, 0));
            return;
          case 'Tab':
            e.preventDefault();
            if (suggestions[autocompleteIndex]) {
              insertSuggestion(suggestions[autocompleteIndex].value);
            }
            return;
          case 'Escape':
            e.preventDefault();
            setAutocompleteVisible(false);
            return;
          case 'Enter':
            e.preventDefault();
            if (suggestions[autocompleteIndex]) {
              insertSuggestion(suggestions[autocompleteIndex].value);
            }
            return;
        }
      }

      // Submit rule on Enter when valid
      if (e.key === 'Enter' && canCommit) {
        e.preventDefault();
        commitRule();
      }
    },
    [
      autocompleteVisible,
      suggestions,
      autocompleteIndex,
      canCommit,
      setAutocompleteIndex,
      setAutocompleteVisible,
      insertSuggestion,
      commitRule,
    ]
  );

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTargetActive(false);

      if (draggedItem) {
        const newText = text.trim() ? `${text.trim()} ${draggedItem.value} ` : `${draggedItem.value} `;
        setText(newText);
        inputRef.current?.focus();
      }
    },
    [draggedItem, text, setText, setDropTargetActive]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTargetActive(true);
    },
    [setDropTargetActive]
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetActive(false);
  }, [setDropTargetActive]);

  return (
    <div className="relative">
      {/* Syntax error message */}
      {syntaxError && text.length > 0 && (
        <div className="absolute -top-8 left-0 right-0 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{syntaxError}</span>
        </div>
      )}

      {/* Input container */}
      <div
        className={`flex items-center h-12 px-4 rounded-lg border transition-all ${
          dropTargetActive
            ? 'border-info bg-info/10'
            : syntaxError && text.length > 0
            ? 'border-destructive/50 bg-card hover:border-destructive/70'
            : 'border-input bg-card hover:border-input'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Syntax highlighting overlay */}
        <div className="relative flex-1">
          {/* Highlighted tokens (background layer) */}
          <div
            className="absolute inset-0 flex items-center pointer-events-none text-sm whitespace-pre overflow-hidden"
            style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
            aria-hidden="true"
          >
            {highlightedText()}
          </div>

          {/* Actual input (transparent foreground) */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (!canWrite) {
                e.preventDefault();
                return;
              }
              handleKeyDown(e);
            }}
            onSelect={(e) => setCursorPos(e.currentTarget.selectionStart || 0)}
            placeholder={canWrite ? "Type a rule... (e.g., ClaimAmount > 10000)" : "Read-only access for client users."}
            disabled={!canWrite}
            className={`relative w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground ${!canWrite ? 'cursor-not-allowed' : ''}`}
            style={{
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              color: tokens.length > 0 ? 'transparent' : 'inherit',
              caretColor: 'var(--color-muted-foreground)',
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {isLoading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin mr-2" />}

        {/* Effect indicator - clickable to toggle */}
        <button
          type="button"
          onClick={toggleEffect}
          disabled={!datasetId || !canWrite}
          className={`px-2 py-0.5 rounded text-[10px] font-medium mr-2 transition-colors cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${
            currentEffect === 'high'
              ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
              : 'bg-warning/20 text-warning hover:bg-warning/30'
          }`}
          title={canWrite ? "Click to toggle between High and Moderate risk" : "Read-only access"}
        >
          {currentEffect === 'high' ? 'High Risk' : 'Moderate'}
        </button>

        {/* Submit button */}
        {canCommit && isValidSyntax && canWrite ? (
          <button
            onClick={() => commitRule()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add
            <CornerDownLeft className="h-3 w-3" />
          </button>
        ) : (
          <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground">
            <CornerDownLeft className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {autocompleteVisible && (
        <Autocomplete
          suggestions={suggestions}
          selectedIndex={autocompleteIndex}
          onSelect={insertSuggestion}
          context={context}
        />
      )}
    </div>
  );
}
