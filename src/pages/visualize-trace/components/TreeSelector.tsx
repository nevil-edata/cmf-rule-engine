import type { Tree } from '@/lib/types/tree';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface TreeSelectorProps {
  trees: Tree[];
  selectedTreeId: string | null;
  onSelect: (treeId: string) => void;
}

export function TreeSelector({ trees, selectedTreeId, onSelect }: TreeSelectorProps) {
  return (
    <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <label
        className="text-[10px] font-semibold uppercase tracking-wider block mb-2"
        style={{ color: 'var(--color-text-muted)' }}
        htmlFor="tree-select"
      >
        Decision Tree
      </label>
      <SearchableSelect
        id="tree-select"
        className="h-8"
        value={selectedTreeId || ''}
        onChange={onSelect}
        placeholder="Select a tree..."
        searchPlaceholder="Type a tree name…"
        options={trees.map((tree) => ({ value: tree.id, label: tree.name, hint: tree.treeType }))}
      />
      {trees.length === 0 && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          No trees found. Create a tree first.
        </p>
      )}
    </div>
  );
}
