import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { RiskBadge } from '@/components/shared/ScoreCard/RiskBadge';
import { SeverityBadge } from './SeverityBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClaimWithResult, AnalysisMode } from '@/store/atoms/tableVisualization';

type RiskLevel = 'low' | 'moderate' | 'high';

interface ClaimsTableProps {
  claims: ClaimWithResult[];
  requiredColumns?: string[];
  ruleColumns?: string[]; // Columns used in rules (for rules mode)
  selectedClaimIndex: number | null;
  onClaimSelect: (claim: ClaimWithResult) => void;
  isProcessing?: boolean;
  totalUnfilteredCount?: number;
  claimNumberColumn?: string | null;
  analysisMode: AnalysisMode;
}

const ROW_HEIGHT = 28; // Approximate height of each row in pixels
const HEADER_HEIGHT = 36; // Height of table header
const MIN_ROWS = 5;
const DEFAULT_ROWS = 10;

// Tree mode filters
const RISK_FILTERS: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'STP', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High Risk', value: 'high' },
];

// Rules mode filters (by severity)
type SeverityFilter = 'all' | 'none' | 'moderate' | 'high';
const SEVERITY_FILTERS: { label: string; value: SeverityFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'No Match', value: 'none' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
];

export function ClaimsTable({
  claims,
  requiredColumns,
  ruleColumns,
  selectedClaimIndex,
  onClaimSelect,
  isProcessing,
  totalUnfilteredCount,
  claimNumberColumn,
  analysisMode,
}: ClaimsTableProps) {
  const hasClaims = claims.length > 0;

  // Determine which columns to display based on mode
  const displayColumns = (() => {
    if (analysisMode === 'rules' && ruleColumns && ruleColumns.length > 0) {
      // Rules mode: show columns used in rules
      return ruleColumns.filter((col) => col !== claimNumberColumn).sort();
    } else if (requiredColumns) {
      // Trees mode: show required columns from tree
      return requiredColumns.filter((col) => col !== claimNumberColumn).sort();
    } else {
      // Fallback: show all columns
      return Array.from(new Set(claims.flatMap((c) => Object.keys(c.claim)))).filter(
        (key) => key !== claimNumberColumn
      );
    }
  })();

  const [page, setPage] = useState(1);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<SeverityFilter>('all');
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Calculate rows per page based on container height
  const calculateRowsPerPage = useCallback(() => {
    if (tableContainerRef.current) {
      const containerHeight = tableContainerRef.current.clientHeight;
      const availableHeight = containerHeight - HEADER_HEIGHT;
      const calculatedRows = Math.floor(availableHeight / ROW_HEIGHT);
      setRowsPerPage(Math.max(MIN_ROWS, calculatedRows));
    }
  }, []);

  // Observe container resize
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateRowsPerPage();
    });

    resizeObserver.observe(container);
    calculateRowsPerPage(); // Initial calculation

    return () => resizeObserver.disconnect();
    // hasClaims: the container only exists once there are claims to show
  }, [calculateRowsPerPage, hasClaims]);

  // Filter claims based on selected filter (mode-dependent)
  const filteredClaims = useMemo(() => {
    if (analysisMode === 'trees') {
      // Tree mode: filter by risk level
      if (selectedRiskFilter === 'all') {
        return claims;
      }
      return claims.filter((item) => item.result?.riskLevel === selectedRiskFilter);
    } else {
      // Rules mode: filter by severity
      if (selectedSeverityFilter === 'all') {
        return claims;
      }
      if (selectedSeverityFilter === 'none') {
        return claims.filter((item) => !item.ruleResult?.maxSeverity || item.ruleResult.totalMatches === 0);
      }
      return claims.filter((item) => item.ruleResult?.maxSeverity === selectedSeverityFilter);
    }
  }, [claims, selectedRiskFilter, selectedSeverityFilter, analysisMode]);

  useEffect(() => {
    setPage(1);
  }, [claims.length, selectedRiskFilter, selectedSeverityFilter, analysisMode]);

  useEffect(() => {
    setPage((prev) => {
      const totalPages = Math.max(1, Math.ceil(filteredClaims.length / rowsPerPage));
      return Math.min(prev, totalPages);
    });
  }, [filteredClaims.length, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredClaims.length);

  const paginatedClaims = useMemo(
    () => filteredClaims.slice(startIndex, endIndex),
    [filteredClaims, startIndex, endIndex]
  );

  // Early return only after every hook has run (hooks must be called in the same order each render)
  if (!hasClaims) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">No claims data loaded</p>
      </div>
    );
  }

  // Get button style for risk filters (tree mode)
  const getRiskButtonStyle = (filterValue: RiskLevel | 'all', isActive: boolean) => {
    if (isActive) {
      switch (filterValue) {
        case 'all': return 'bg-muted text-foreground border-input';
        case 'low': return 'bg-success/20 text-success border-success/50';
        case 'moderate': return 'bg-warning/20 text-warning border-warning/50';
        case 'high': return 'bg-destructive/20 text-destructive border-destructive/50';
        default: return '';
      }
    } else {
      switch (filterValue) {
        case 'all': return 'border-input/50 text-muted-foreground hover:border-input hover:text-muted-foreground';
        case 'low': return 'border-success/20 text-success hover:border-success/40 hover:text-success';
        case 'moderate': return 'border-warning/20 text-warning hover:border-warning/40 hover:text-warning';
        case 'high': return 'border-destructive/20 text-destructive hover:border-destructive/40 hover:text-destructive';
        default: return '';
      }
    }
  };

  // Get button style for severity filters (rules mode)
  const getSeverityButtonStyle = (filterValue: SeverityFilter, isActive: boolean) => {
    if (isActive) {
      switch (filterValue) {
        case 'all': return 'bg-muted text-foreground border-input';
        case 'none': return 'bg-input/30 text-foreground/80 border-input/50';
        case 'moderate': return 'bg-warning/20 text-warning border-warning/50';
        case 'high': return 'bg-destructive/20 text-destructive border-destructive/50';
        default: return '';
      }
    } else {
      switch (filterValue) {
        case 'all': return 'border-input/50 text-muted-foreground hover:border-input hover:text-muted-foreground';
        case 'none': return 'border-input/30 text-muted-foreground/50 hover:border-input/40 hover:text-muted-foreground';
        case 'moderate': return 'border-warning/20 text-warning hover:border-warning/40 hover:text-warning';
        case 'high': return 'border-destructive/20 text-destructive hover:border-destructive/40 hover:text-destructive';
        default: return '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter Pills (mode-dependent) */}
      <div className="border-b px-3 py-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
        <div className="flex items-center gap-1.5">
          {analysisMode === 'trees' ? (
            // Tree mode: Risk level filters
            RISK_FILTERS.map((filter) => {
              const count = filter.value === 'all'
                ? claims.length
                : claims.filter((c) => c.result?.riskLevel === filter.value).length;
              const isActive = selectedRiskFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedRiskFilter(filter.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-full border text-[10px] font-medium transition-colors',
                    getRiskButtonStyle(filter.value, isActive)
                  )}
                >
                  {filter.label}
                  <span className="ml-1 opacity-60">{count}</span>
                </button>
              );
            })
          ) : (
            // Rules mode: Severity filters
            SEVERITY_FILTERS.map((filter) => {
              const count = filter.value === 'all'
                ? claims.length
                : filter.value === 'none'
                  ? claims.filter((c) => !c.ruleResult?.maxSeverity || c.ruleResult.totalMatches === 0).length
                  : claims.filter((c) => c.ruleResult?.maxSeverity === filter.value).length;
              const isActive = selectedSeverityFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedSeverityFilter(filter.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-full border text-[10px] font-medium transition-colors',
                    getSeverityButtonStyle(filter.value, isActive)
                  )}
                >
                  {filter.label}
                  <span className="ml-1 opacity-60">{count}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Table */}
      <div ref={tableContainerRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead
            className="sticky top-0 z-10 border-b"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <tr>
              <th className="h-9 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                Claim #
              </th>
              {displayColumns.map((key) => (
                <th
                  key={key}
                  className="h-9 px-3 text-left text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                >
                  {key}
                </th>
              ))}
              {analysisMode === 'trees' ? (
                // Tree mode columns: Score, Prob, Risk
                <>
                  <th className="h-9 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Score
                  </th>
                  <th className="h-9 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Prob
                  </th>
                  <th className="h-9 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Risk
                  </th>
                </>
              ) : (
                // Rules mode columns: Matched Rules, Severity
                <>
                  <th className="h-9 px-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Matched
                  </th>
                  <th className="h-9 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Severity
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedClaims.map((item, idx) => {
              const absoluteIndex = startIndex + idx;
              // Check if this claim is selected by comparing the claim object
              const isSelected = selectedClaimIndex !== null && claims[selectedClaimIndex] === item;
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={absoluteIndex}
                  onClick={() => onClaimSelect(item)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-info/10 border-l-2 border-l-blue-500'
                      : isEven
                        ? 'bg-card/50 hover:bg-muted/70 border-l-2 border-l-transparent'
                        : 'bg-transparent hover:bg-muted/70 border-l-2 border-l-transparent'
                  )}
                >
                  <td className="px-3 py-1.5 font-mono text-xs text-foreground whitespace-nowrap">
                    {claimNumberColumn ? item.claim[claimNumberColumn] || '-' : `#${absoluteIndex + 1}`}
                  </td>
                  {displayColumns.map((key) => (
                    <td key={key} className="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                      {String(item.claim[key] ?? '-')}
                    </td>
                  ))}
                  {analysisMode === 'trees' ? (
                    // Tree mode: Score, Prob, Risk
                    <>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-foreground whitespace-nowrap">
                        {item.result ? item.result.totalScore.toFixed(3) : '-'}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-foreground whitespace-nowrap">
                        {item.result ? `${(item.result.probability * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-3 py-1.5">
                        {item.result ? (
                          <RiskBadge riskLevel={item.result.riskLevel} size="xs" />
                        ) : isProcessing ? (
                          <span className="text-[10px] text-muted-foreground">...</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </>
                  ) : (
                    // Rules mode: Matched count, Severity
                    <>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-foreground whitespace-nowrap">
                        {item.ruleResult ? item.ruleResult.totalMatches : '-'}
                      </td>
                      <td className="px-3 py-1.5">
                        {item.ruleResult ? (
                          <SeverityBadge severity={item.ruleResult.maxSeverity} size="xs" />
                        ) : isProcessing ? (
                          <span className="text-[10px] text-muted-foreground">...</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div
        className="flex items-center justify-between border-t px-3 py-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      >
        <div className="text-xs text-muted-foreground">
          <span className="text-foreground/80">{startIndex + 1}-{endIndex}</span>
          <span className="mx-1">of</span>
          <span className="text-foreground/80">{filteredClaims.length}</span>
          {selectedRiskFilter !== 'all' && (
            <span className="ml-1 text-muted-foreground">({selectedRiskFilter})</span>
          )}
          {totalUnfilteredCount && filteredClaims.length < totalUnfilteredCount && (
            <span className="ml-1 text-muted-foreground">/ {totalUnfilteredCount}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            Prev
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {page}/{totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
