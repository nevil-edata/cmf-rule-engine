import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  title: string;
  detail: string;
  /** Where the step happens; omit when the step is done inside another page */
  to?: string;
  /** Only people who can change data do this step */
  needsWrite?: boolean;
  optional?: boolean;
}

/** The usual order of work in ClaimCPU. One list, used by the Help page and the Datasets page. */
const workflowSteps: WorkflowStep[] = [
  {
    title: 'Upload a dataset',
    detail: 'Datasets > Upload Dataset. Choose the claims file, company and country.',
    to: '/datasets',
    needsWrite: true,
  },
  {
    title: 'Check the column mapping',
    detail: 'Open the dataset and look at Overview and Schema Map. Fix any column that was matched wrongly.',
    needsWrite: true,
  },
  {
    title: 'Score the claims',
    detail: 'Score Claims: pick a tree, load the dataset, pick the claim number column, press Evaluate.',
    to: '/table-visualizer',
  },
  {
    title: 'Add rules (optional)',
    detail: 'Rules: write plain-sentence rules for a dataset, then score again in Rules mode.',
    to: '/rules',
    needsWrite: true,
    optional: true,
  },
];

interface WorkflowStepsProps {
  /** Show the steps people with read-only access cannot do */
  canWrite: boolean;
  /** Mark the first step as done (a dataset exists) */
  uploadDone?: boolean;
  className?: string;
}

export function WorkflowSteps({ canWrite, uploadDone = false, className }: WorkflowStepsProps) {
  const steps = workflowSteps.filter((s) => canWrite || !s.needsWrite);

  return (
    <ol className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {steps.map((step, i) => {
        const done = step.to === '/datasets' && uploadDone;
        const body = (
          <div
            className={cn(
              'h-full rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors',
              step.to && 'hover:border-primary/50'
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  done ? 'bg-success text-white' : 'bg-primary/10 text-primary'
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              {step.to && <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
          </div>
        );

        return (
          <li key={step.title} className={cn(step.optional && 'opacity-90')}>
            {step.to ? (
              <Link to={step.to} className="block h-full">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}
