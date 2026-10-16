import { BarChart3, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  mode: 'analytics' | 'table';
  onChange: (mode: 'analytics' | 'table') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-card rounded p-1">
      <button
        onClick={() => onChange('analytics')}
        className={cn(
          'p-2 rounded transition-colors',
          mode === 'analytics'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground/80'
        )}
        title="Analytics View"
      >
        <BarChart3 className="h-4 w-4" />
      </button>

      <button
        onClick={() => onChange('table')}
        className={cn(
          'p-2 rounded transition-colors',
          mode === 'table'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground/80'
        )}
        title="Table View"
      >
        <Table2 className="h-4 w-4" />
      </button>
    </div>
  );
}
