import { useAtom } from 'jotai';
import { Link, useLocation } from 'react-router-dom';
import { uiThemeAtom } from '@/store/atoms/ui';
import { headerBreadcrumbsAtom, headerActionsAtom } from '@/store/atoms/header';
import { Button } from '@/components/ui/button';
import { Sun, Moon, ChevronRight } from 'lucide-react';

const defaultRouteConfig: Record<string, { breadcrumbs: { label: string; href?: string }[] }> = {
  '/review-trees': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Decision Trees' }] },
  '/datasets': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Datasets' }] },
  '/generate-tree': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Generate Tree' }] },
  '/table-visualizer': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Table Visualizer' }] },
  '/help': { breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Help' }] },
};

export function Header() {
  const [uiTheme, setUiTheme] = useAtom(uiThemeAtom);
  const [customBreadcrumbs] = useAtom(headerBreadcrumbsAtom);
  const [customActions] = useAtom(headerActionsAtom);
  const location = useLocation();

  const toggleTheme = () => {
    setUiTheme(uiTheme === 'light' ? 'dark' : 'light');
  };

  // Use custom breadcrumbs if set, otherwise use default route config
  // (pages clear their breadcrumbs with [], which must fall back to the defaults too)
  const breadcrumbs = (customBreadcrumbs && customBreadcrumbs.length > 0 ? customBreadcrumbs : null) ||
    defaultRouteConfig[location.pathname]?.breadcrumbs ||
    [{ label: 'Home' }];

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur-md">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              {crumb.href ? (
                <Link to={crumb.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                  {crumb.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
            </div>
          );
        })}
      </nav>

      {/* Actions - custom or default theme toggle */}
      <div className="flex items-center gap-3">
        {customActions}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label={uiTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={uiTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {uiTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
