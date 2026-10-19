import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Table,
  LogOut,
  ChevronLeft,
  ListChecks,
  Building2,
  Users,
  ScrollText,
  CircleHelp,
  House,
} from 'lucide-react';
import { useAuth, type UserRole } from '@/lib/auth/context';
import { sidebarCollapsedAtom } from '@/store/atoms/ui';
import { supabase } from '@/lib/db/supabase';
import { ClaimCPULogo, ClaimCPUMark, EdataLogo } from '@/components/brand/BrandLogo';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  /** Position in the usual order of work (shown as a small number next to the label) */
  step?: number;
}

const homeNavItems: NavItem[] = [
  { path: '/home', label: 'Home', icon: House, roles: ['admin', 'client_admin', 'client_user'] },
];

// Order of work: load data, score it, then optionally add rules. Trees are what the scoring uses.
const workflowNavItems: NavItem[] = [
  { path: '/datasets', label: 'Datasets', icon: FileText, roles: ['admin', 'client_admin', 'client_user'], step: 1 },
  { path: '/table-visualizer', label: 'Score Claims', icon: Table, roles: ['admin', 'client_admin', 'client_user'], step: 2 },
  { path: '/rules', label: 'Rules', icon: ListChecks, roles: ['admin', 'client_admin', 'client_user'], step: 3 },
];

const treeNavItems: NavItem[] = [
  { path: '/review-trees', label: 'Decision Trees', icon: LayoutDashboard, roles: ['admin', 'client_admin', 'client_user'] },
  { path: '/generate-tree', label: 'Generate Tree', icon: PlusCircle, roles: ['admin'] },
];

const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { path: '/admin/companies', label: 'Companies', icon: Building2, roles: ['admin'] },
  { path: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
  { path: '/admin/logs', label: 'Logs', icon: ScrollText, roles: ['admin'] },
];

const companyNavItems: NavItem[] = [
  { path: '/company', label: 'Company Overview', icon: Building2, roles: ['client_admin'] },
  { path: '/company/users', label: 'Users', icon: Users, roles: ['client_admin'] },
];

const helpNavItems: NavItem[] = [
  { path: '/help', label: 'Help & Guide', icon: CircleHelp, roles: ['admin', 'client_admin', 'client_user'] },
];

function isPathActive(currentPath: string, itemPath: string) {
  if (itemPath === '/admin') {
    return currentPath.startsWith('/admin');
  }

  // /company is the overview only; /company/users has its own entry
  if (itemPath === '/company') {
    return currentPath === '/company';
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);
  const [companyName, setCompanyName] = useState<string | null>(null);

  const role = profile?.role;

  const visibleWorkflowItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return workflowNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const visibleTreeItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return treeNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const visibleAdminItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return adminNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const visibleCompanyItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return companyNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const visibleHelpItems = useMemo(() => {
    if (!role) {
      return [];
    }

    return helpNavItems.filter((item) => item.roles.includes(role));
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    const loadCompanyName = async () => {
      if (!profile?.company_id) {
        setCompanyName(null);
        return;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to load company name', error);
        setCompanyName(null);
        return;
      }

      setCompanyName(data?.name ?? null);
    };

    void loadCompanyName();

    return () => {
      isMounted = false;
    };
  }, [profile?.company_id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const userRoleLabel =
    profile?.role === 'admin'
      ? 'Admin'
      : profile?.role === 'client_admin'
        ? 'Client Admin'
        : profile?.role === 'client_user'
          ? 'Client User'
          : null;

  const initials = userName
    .split(/[\s._-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const renderNavSection = (items: NavItem[], sectionTitle?: string) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1">
        {sectionTitle && !isCollapsed && (
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-200/70">{sectionTitle}</p>
        )}
        {items.map((item) => {
          const active = isPathActive(location.pathname, item.path);

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={cn(
                  'relative w-full gap-3 px-3',
                  isCollapsed ? 'justify-center' : 'justify-start',
                  active
                    ? 'bg-sidebar-accent font-medium text-white hover:bg-sidebar-accent hover:text-white'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-green" />
                )}
                <item.icon className={cn('h-4 w-4 flex-shrink-0', active && 'text-teal-200')} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.step && (
                  <span
                    aria-hidden="true"
                    className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-sidebar-border text-[11px] font-semibold text-teal-200/80"
                  >
                    {item.step}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300',
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border',
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        )}
      >
        {isCollapsed ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-9 w-9 flex-shrink-0 hover:bg-sidebar-accent"
            title="Expand sidebar"
          >
            <ClaimCPUMark className="w-14" />
          </Button>
        ) : (
          <>
            <div className="flex items-center overflow-hidden">
              <ClaimCPULogo tone="onDark" className="h-9" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 flex-shrink-0 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="relative flex-1 overflow-y-auto py-6">
        <nav className="relative space-y-5 px-4">
          {renderNavSection(homeNavItems.filter((item) => role && item.roles.includes(role)))}
          {renderNavSection(visibleWorkflowItems, 'Workflow')}
          {renderNavSection(visibleTreeItems, 'Trees')}
          {renderNavSection(visibleAdminItems, 'Admin')}
          {renderNavSection(visibleCompanyItems, 'My Company')}
          {renderNavSection(visibleHelpItems, 'Support')}
        </nav>
      </div>

      <div className="space-y-3 border-t border-sidebar-border p-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-sidebar-muted">{user?.email}</p>
              {userRoleLabel && (
                <p className="mt-0.5 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-200/80">
                  {userRoleLabel}
                  {profile?.role === 'client_user' && companyName ? ` - ${companyName}` : ''}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center px-2">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent text-sm font-semibold text-white">
              {initials}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full gap-3 text-sidebar-foreground hover:bg-destructive/15 hover:text-red-300',
            isCollapsed ? 'justify-center px-0' : 'justify-start'
          )}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>

        {!isCollapsed && (
          <div className="border-t border-sidebar-border px-2 pt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
              Powered by
            </p>
            <EdataLogo tone="onDark" className="h-12" />
          </div>
        )}
      </div>
    </div>
  );
}
