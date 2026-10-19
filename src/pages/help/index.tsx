import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { Card } from '@/components/ui/card';
import { WorkflowSteps } from '@/components/shared/WorkflowSteps';
import { useAuth, type UserRole } from '@/lib/auth/context';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import {
  glossary,
  pageGuides,
  taskGuides,
  tips,
  troubleshooting,
} from './content';

const sections = [
  { id: 'start', label: 'Start here' },
  { id: 'pages', label: 'What each page is for' },
  { id: 'steps', label: 'Step by step' },
  { id: 'results', label: 'Reading the results' },
  { id: 'tips', label: 'Handy tips' },
  { id: 'trouble', label: 'If something goes wrong' },
];

function SectionTitle({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="eyebrow mb-1">{eyebrow}</p>
      <h2 className="display text-2xl">{title}</h2>
    </div>
  );
}

function Disclosure({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-card shadow-[var(--shadow-card)] [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/50">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

export default function Help() {
  const { profile } = useAuth();
  const role: UserRole | null = profile?.role ?? null;
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Help' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const myPages = pageGuides.filter((p) => !role || p.roles.includes(role));
  const myTasks = taskGuides.filter((t) => !role || t.roles.includes(role));

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Guide"
        title="Help & Guide"
        description="How ClaimCPU works and how to find your way around it."
        illustration="grid"
      />

      <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="eyebrow mb-2">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-14">
          {/* Start here */}
          <section className="space-y-4" aria-labelledby="start">
            <SectionTitle id="start" eyebrow="Overview" title="Start here" />
            <Card className="space-y-4 p-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">ClaimCPU</strong> scores insurance claims with decision trees and
                rules, so reviewers can spend their time on the claims that most need a look. You load a file of
                claims, choose a tree, and every claim gets a score and a lane: <strong className="text-foreground">STP</strong>,{' '}
                <strong className="text-foreground">Moderate</strong> or <strong className="text-foreground">High risk</strong>.
              </p>
              <p>
                The score is a <strong className="text-foreground">review priority</strong>, not a verdict. It tells you
                where to look first; it does not say a claim is fraudulent.
              </p>
            </Card>
            <p className="pt-2 text-sm font-medium text-foreground">The usual order of work</p>
            <WorkflowSteps canWrite={role !== 'client_user'} />
          </section>

          {/* Pages */}
          <section className="space-y-4" aria-labelledby="pages">
            <SectionTitle id="pages" eyebrow="Navigation" title="What each page is for" />
            <p className="text-sm text-muted-foreground">
              These are the pages in your left-hand menu. Click a name to open it.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {myPages.map((p) => (
                <Link
                  key={p.path}
                  to={p.path}
                  className="group rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Step by step */}
          <section className="space-y-4" aria-labelledby="steps">
            <SectionTitle id="steps" eyebrow="How to" title="Step by step" />
            <div className="space-y-3">
              {myTasks.map((t, i) => (
                <Disclosure key={t.title} title={t.title} defaultOpen={i === 0}>
                  <ol className="list-decimal space-y-2 pl-5">
                    {t.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </Disclosure>
              ))}
            </div>
          </section>

          {/* Results */}
          <section className="space-y-4" aria-labelledby="results">
            <SectionTitle id="results" eyebrow="Understanding" title="Reading the results" />
            <Card className="divide-y divide-border">
              {glossary.map((g) => (
                <div key={g.term} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm font-semibold text-foreground">{g.term}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">{g.meaning}</dd>
                </div>
              ))}
            </Card>
          </section>

          {/* Tips */}
          <section className="space-y-4" aria-labelledby="tips">
            <SectionTitle id="tips" eyebrow="Good to know" title="Handy tips" />
            <Card className="p-6">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Troubleshooting */}
          <section className="space-y-4" aria-labelledby="trouble">
            <SectionTitle id="trouble" eyebrow="Support" title="If something goes wrong" />
            <div className="space-y-3">
              {troubleshooting.map((t) => (
                <Disclosure key={t.problem} title={t.problem}>
                  <p>{t.answer}</p>
                </Disclosure>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
