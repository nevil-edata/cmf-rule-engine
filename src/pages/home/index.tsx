import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import {
  ArrowRight,
  Building2,
  CircleHelp,
  FileText,
  GitBranch,
  ListChecks,
  PlusCircle,
  Table,
  Upload,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { WorkflowSteps } from '@/components/shared/WorkflowSteps';
import { useAuth, type UserRole } from '@/lib/auth/context';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import { cn } from '@/lib/utils';
import { useHomeData, type HomeData } from './useHomeData';

const roleLabel: Record<UserRole, string> = {
  admin: 'Admin',
  client_admin: 'Client Admin',
  client_user: 'Client User',
};

interface Action {
  title: string;
  detail: string;
  to: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const everyone: UserRole[] = ['admin', 'client_admin', 'client_user'];
const canWriteRoles: UserRole[] = ['admin', 'client_admin'];

/** Things to do with claims. */
const claimActions: Action[] = [
  { title: 'Score claims', detail: 'Pick a tree, load a file and see every claim in its lane.', to: '/table-visualizer', icon: Table, roles: everyone },
  { title: 'Upload a dataset', detail: 'Add a claims file and check how its columns were matched.', to: '/datasets', icon: Upload, roles: canWriteRoles },
  { title: 'Browse datasets', detail: 'See the files already uploaded and how good the data is.', to: '/datasets', icon: FileText, roles: ['client_user'] },
  { title: 'Write rules', detail: 'Flag claims with plain-sentence rules, one set per dataset.', to: '/rules', icon: ListChecks, roles: canWriteRoles },
  { title: 'See the rules', detail: 'Read the rules set up for each dataset.', to: '/rules', icon: ListChecks, roles: ['client_user'] },
  { title: 'Decision trees', detail: 'The models behind a score. Open one to see it or try a claim.', to: '/review-trees', icon: GitBranch, roles: everyone },
];

/** Things to do with people and setup. */
const manageActions: Action[] = [
  { title: 'Companies', detail: 'Create a client company and set its user slots.', to: '/admin/companies', icon: Building2, roles: ['admin'] },
  { title: 'Register users', detail: 'Invite a client admin or user by email.', to: '/admin/users', icon: UserPlus, roles: ['admin'] },
  { title: 'Generate a tree', detail: 'Build a new decision tree for clients to score with.', to: '/generate-tree', icon: PlusCircle, roles: ['admin'] },
  { title: 'Admin dashboard', detail: 'Activity, slot requests and platform totals.', to: '/admin', icon: Building2, roles: ['admin'] },
  { title: 'Manage your users', detail: 'Add people to your company and manage access.', to: '/company/users', icon: Users, roles: ['client_admin'] },
  { title: 'Company overview', detail: 'User slots used and a way to request more.', to: '/company', icon: Building2, roles: ['client_admin'] },
  { title: 'Help and guide', detail: 'How ClaimCPU works, step by step.', to: '/help', icon: CircleHelp, roles: everyone },
];

interface NextStep {
  title: string;
  detail: string;
  to?: string;
  cta?: string;
}

/** One suggestion for what to do now, based on what already exists. */
function nextStepFor(role: UserRole, d: HomeData): NextStep {
  if (role === 'admin') {
    if ((d.pendingSlotRequests ?? 0) > 0) {
      return {
        title: `Review ${d.pendingSlotRequests} pending slot request${d.pendingSlotRequests === 1 ? '' : 's'}`,
        detail: 'A client admin is waiting for more user slots.',
        to: '/admin',
        cta: 'Open the dashboard',
      };
    }
    if (d.companies === 0) {
      return { title: 'Create the first company', detail: 'Everything else hangs off a client company.', to: '/admin/companies', cta: 'Go to Companies' };
    }
    if (d.trees === 0) {
      return { title: 'Generate a decision tree', detail: 'Clients need a tree before they can score claims.', to: '/generate-tree', cta: 'Generate a tree' };
    }
    return { title: 'Score some claims', detail: 'Pick a tree and a dataset and see the lanes.', to: '/table-visualizer', cta: 'Open Score Claims' };
  }

  if (d.datasets === 0) {
    return role === 'client_admin'
      ? { title: 'Upload your first dataset', detail: 'Scoring starts with a claims file for your company.', to: '/datasets', cta: 'Go to Datasets' }
      : { title: 'No datasets yet', detail: 'Ask your Client Admin to upload a claims file. It will show up here.' };
  }
  if (d.trees === 0) {
    return { title: 'No decision trees yet', detail: 'Ask your eData contact to add one before you can score claims.' };
  }
  return { title: 'Score your claims', detail: 'Pick a tree, load a dataset and press Evaluate.', to: '/table-visualizer', cta: 'Open Score Claims' };
}

function Tile({ title, detail, to, icon: Icon }: Action) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-primary/50"
    >
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </Link>
  );
}

function Stat({ label, value, loading }: { label: string; value: number | null; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-card)]">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold text-foreground', loading && 'opacity-40')}>
        {loading ? '...' : value ?? '-'}
      </p>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="eyebrow mb-1">{eyebrow}</p>
      <h2 className="display text-xl">{title}</h2>
    </div>
  );
}

export default function Home() {
  const { user, profile } = useAuth();
  const role = profile?.role ?? null;
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const data = useHomeData(role);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Home' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  if (!role) return null;

  const firstName = (profile?.full_name || user?.email?.split('@')[0] || '').split(/[\s._-]/)[0];
  const next = nextStepFor(role, data);
  const myClaimActions = claimActions.filter((a) => a.roles.includes(role));
  const myManageActions = manageActions.filter((a) => a.roles.includes(role));
  const canWrite = role !== 'client_user';

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={roleLabel[role]}
        title={firstName ? `Welcome, ${firstName}` : 'Welcome'}
        description="ClaimCPU ranks insurance claims by review priority so your team looks at the right ones first."
        illustration="grid"
      />

      {/* Next step */}
      {!data.loading && (
        <section aria-label="Your next step" className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <p className="eyebrow mb-1">Next step</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{next.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{next.detail}</p>
            </div>
            {next.to && next.cta && (
              <Link
                to={next.to}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {next.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Numbers */}
      <section aria-label="Your workspace" className="space-y-3">
        <SectionTitle eyebrow="At a glance" title={role === 'admin' ? 'The platform' : 'Your workspace'} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {role === 'admin' ? (
            <>
              <Stat label="Companies" value={data.companies} loading={data.loading} />
              <Stat label="Users" value={data.users} loading={data.loading} />
              <Stat label="Datasets" value={data.datasets} loading={data.loading} />
              <Stat label="Decision trees" value={data.trees} loading={data.loading} />
            </>
          ) : (
            <>
              <Stat label="Datasets" value={data.datasets} loading={data.loading} />
              <Stat label="Datasets with rules" value={data.datasetsWithRules} loading={data.loading} />
              <Stat label="Decision trees" value={data.trees} loading={data.loading} />
            </>
          )}
        </div>
      </section>

      {/* Actions */}
      <section aria-label="What to do" className="space-y-3">
        <SectionTitle eyebrow="Jump in" title="Work with claims" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myClaimActions.map((a) => (
            <Tile key={a.title} {...a} />
          ))}
        </div>
      </section>

      <section aria-label="Manage" className="space-y-3">
        <SectionTitle eyebrow="Set up and support" title={role === 'admin' ? 'Manage the platform' : 'Manage and learn'} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myManageActions.map((a) => (
            <Tile key={a.title} {...a} />
          ))}
        </div>
      </section>

      {/* The order of work */}
      <section aria-label="How it works" className="space-y-3">
        <SectionTitle eyebrow="How it works" title="The usual order of work" />
        <WorkflowSteps canWrite={canWrite} uploadDone={(data.datasets ?? 0) > 0} />
      </section>
    </div>
  );
}
