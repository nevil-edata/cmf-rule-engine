import { AlertCircle } from 'lucide-react';

interface CriticalColumnsAlertProps {
  columns: string[];
}

export default function CriticalColumnsAlert({ columns }: CriticalColumnsAlertProps) {
  if (columns.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-destructive">
            Missing Critical Columns
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            The following required columns are not mapped. Dataset quality is compromised.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {columns.map(col => (
              <span
                key={col}
                className="px-3 py-1 bg-destructive/20 text-destructive rounded-md font-mono text-sm"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
