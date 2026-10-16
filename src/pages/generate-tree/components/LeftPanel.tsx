import { Database, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { TypeSelector } from './TypeSelector';
import type { TreeType } from '@/lib/types/tree';
import type { DatasetWithStatus } from '@/lib/db/operations';
import type { BooleanCandidate } from '../utils/booleanFeatures';

interface Company {
  id: string;
  name: string;
  country?: string;
}

interface DatasetContext {
  id: number;
  name: string;
  company: string;
  country: string;
}

interface LeftPanelProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onCompanyChange: (id: string | null) => void;
  datasets: DatasetWithStatus[];
  selectedDatasetId: number | null;
  onDatasetChange: (id: number | null) => void;
  datasetContext?: DatasetContext;
  treeType: TreeType;
  onTreeTypeChange: (type: TreeType) => void;
  booleanCandidates: BooleanCandidate[];
  booleanDecisions: Record<string, boolean>;
  onBooleanDecisionChange: (decisions: Record<string, boolean>) => void;
}

export function LeftPanel({
  companies,
  selectedCompanyId,
  onCompanyChange,
  datasets,
  selectedDatasetId,
  onDatasetChange,
  datasetContext,
  treeType,
  onTreeTypeChange,
  booleanCandidates,
  booleanDecisions,
  onBooleanDecisionChange,
}: LeftPanelProps) {
  return (
    <aside
      className="w-[360px] flex-shrink-0 border-r flex flex-col overflow-hidden"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
          Tree Configuration
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Company Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--color-foreground)' }}>
              <Building2 className="h-4 w-4" style={{ color: 'var(--color-info)' }} />
              Company
            </label>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Select the company this tree belongs to
            </p>
            <SearchableSelect
              aria-label="Company"
              value={selectedCompanyId ?? ''}
              onChange={(v) => onCompanyChange(v || null)}
              placeholder="(Select a company)"
              searchPlaceholder="Type a company name…"
              options={companies.map(c => ({ value: c.id, label: c.name, hint: c.country }))}
            />
          </div>

          {/* Dataset Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Dataset Association <span className="text-muted-foreground">(Optional)</span>
            </label>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Select a dataset to associate with this tree
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <SearchableSelect
                  aria-label="Dataset"
                  value={selectedDatasetId?.toString() ?? ''}
                  onChange={(v) => onDatasetChange(v ? Number(v) : null)}
                  placeholder="(No dataset - standalone tree)"
                  searchPlaceholder="Type a file or company name…"
                  options={datasets.map(d => ({
                    value: d.id.toString(),
                    label: d.fileName || `Dataset ${d.id}`,
                    hint: d.insuranceCompany,
                  }))}
                />
              </div>
              {selectedDatasetId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDatasetChange(null)}
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Selected Dataset Info */}
          {datasetContext && (
            <div
              className="flex items-start gap-3 p-3 rounded-md border"
              style={{ borderColor: 'var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
            >
              <Database className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                  {datasetContext.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  {datasetContext.company} • {datasetContext.country}
                </p>
              </div>
            </div>
          )}

          {/* Tree Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Tree Type
            </label>
            <TypeSelector value={treeType} onChange={onTreeTypeChange} />
          </div>

          {/* Boolean Thresholds */}
          {booleanCandidates.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                  Boolean Thresholds
                </label>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Convert 0.5 thresholds to Yes/No checks
                </p>
              </div>
              <div className="space-y-2">
                {booleanCandidates.map((candidate) => {
                  const decision = booleanDecisions[candidate.key] ?? true;
                  const conversionSuffix = candidate.operator === '<=' ? 'is No' : 'is Yes';

                  return (
                    <div
                      key={candidate.key}
                      className="rounded-md border p-3 space-y-2"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--color-foreground)' }}>
                          Tree {candidate.treeIndex + 1}: {candidate.feature}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {candidate.feature} {conversionSuffix}
                        </p>
                      </div>
                      <select
                        value={decision ? 'boolean' : 'numeric'}
                        onChange={(e) =>
                          onBooleanDecisionChange({
                            ...booleanDecisions,
                            [candidate.key]: e.target.value === 'boolean',
                          })
                        }
                        className="w-full rounded-md border bg-background p-2 text-sm"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-card)',
                          color: 'var(--color-foreground)',
                        }}
                      >
                        <option value="boolean">Use Yes/No</option>
                        <option value="numeric">Keep numeric ({candidate.operator} 0.5)</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
