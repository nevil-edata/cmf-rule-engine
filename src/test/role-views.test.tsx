import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Sidebar } from '@/components/shared/Layout/Sidebar';
import { RoleGuard } from '@/components/shared/RoleGuard';
import Home from '@/pages/home';
import type { UserRole } from '@/lib/auth/context';

/**
 * What each kind of person sees: signed out, Admin, Client Admin, Client User.
 * Real Sidebar, RoleGuard and Home; only auth, the database and the Home counts are stubbed.
 */

let mockUser: { email: string } | null;
let mockProfile: { role: UserRole; full_name: string; is_active: boolean; company_id: string | null } | null;

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ user: mockUser, profile: mockProfile, loading: false, signOut: vi.fn() }),
}));
vi.mock('@/lib/db/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { name: 'Acme' }, error: null }) }) }) }),
  },
}));
vi.mock('@/pages/home/useHomeData', () => ({
  useHomeData: () => ({
    loading: false,
    datasets: 2,
    trees: 3,
    datasetsWithRules: 1,
    companies: 4,
    users: 9,
    pendingSlotRequests: 0,
  }),
}));

const everyone: UserRole[] = ['admin', 'client_admin', 'client_user'];

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/auth" element={<div>Sign in page</div>} />
        <Route
          path="/home"
          element={
            <RoleGuard allowedRoles={everyone}>
              <Sidebar />
              <Home />
            </RoleGuard>
          }
        />
        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><div>Admin dashboard page</div></RoleGuard>} />
        <Route path="/generate-tree" element={<RoleGuard allowedRoles={['admin']}><div>Generate tree page</div></RoleGuard>} />
        <Route path="/company" element={<RoleGuard allowedRoles={['client_admin']}><div>Company page</div></RoleGuard>} />
        <Route path="/table-visualizer" element={<RoleGuard allowedRoles={everyone}><div>Score claims page</div></RoleGuard>} />
      </Routes>
    </MemoryRouter>
  );
}

function signIn(role: UserRole) {
  mockUser = { email: 'pat.lee@example.com' };
  mockProfile = { role, full_name: 'Pat Lee', is_active: true, company_id: role === 'admin' ? null : 'co-1' };
}

function menu() {
  const nav = screen.getByRole('navigation');
  return within(nav)
    .getAllByRole('link')
    .map((a) => a.textContent?.replace(/\d$/, '').trim());
}

describe('Signed out', () => {
  beforeEach(() => {
    mockUser = null;
    mockProfile = null;
  });

  it.each(['/home', '/table-visualizer', '/admin', '/company'])('%s goes to the sign-in page', (path) => {
    renderApp(path);
    expect(screen.getByText('Sign in page')).toBeInTheDocument();
  });
});

describe('Admin', () => {
  beforeEach(() => signIn('admin'));

  it('lands on Home and sees the whole menu', () => {
    renderApp('/home');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome, Pat');
    expect(menu()).toEqual([
      'Home', 'Datasets', 'Score Claims', 'Rules', 'Decision Trees', 'Generate Tree',
      'Admin Dashboard', 'Companies', 'Users', 'Logs', 'Help & Guide',
    ]);
  });

  it('can open the admin pages', () => {
    renderApp('/admin');
    expect(screen.getByText('Admin dashboard page')).toBeInTheDocument();
  });

  it('cannot open the company page (it is for Client Admins)', () => {
    renderApp('/company');
    expect(screen.queryByText('Company page')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
  });
});

describe('Client Admin', () => {
  beforeEach(() => signIn('client_admin'));

  it('sees the workflow, trees, their company pages and help; no admin menu', () => {
    renderApp('/home');
    expect(menu()).toEqual([
      'Home', 'Datasets', 'Score Claims', 'Rules', 'Decision Trees', 'Company Overview', 'Users', 'Help & Guide',
    ]);
    // once as an action tile and once as the first step of the order of work
    expect(screen.getAllByText('Upload a dataset', { selector: 'h3' }).length).toBeGreaterThan(0);
    expect(screen.getByText('Manage your users')).toBeInTheDocument();
  });

  it.each([['/admin', 'Admin dashboard page'], ['/generate-tree', 'Generate tree page']])(
    '%s is bounced back to Home',
    (path, text) => {
      renderApp(path);
      expect(screen.queryByText(text)).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
    }
  );

  it('can open the company page', () => {
    renderApp('/company');
    expect(screen.getByText('Company page')).toBeInTheDocument();
  });
});

describe('Client User', () => {
  beforeEach(() => signIn('client_user'));

  it('sees a read-only menu: workflow, trees and help', () => {
    renderApp('/home');
    expect(menu()).toEqual(['Home', 'Datasets', 'Score Claims', 'Rules', 'Decision Trees', 'Help & Guide']);
  });

  it('is offered scoring and browsing, but nothing that changes data or people', () => {
    renderApp('/home');
    expect(screen.getByRole('heading', { name: 'Score your claims' })).toBeInTheDocument();
    for (const text of ['Upload a dataset', 'Write rules', 'Manage your users', 'Register users', 'Generate a tree', 'Companies']) {
      expect(screen.queryByText(text, { selector: 'h3' })).not.toBeInTheDocument();
    }
    expect(screen.getByText('Browse datasets')).toBeInTheDocument();
  });

  it.each([['/admin', 'Admin dashboard page'], ['/generate-tree', 'Generate tree page'], ['/company', 'Company page']])(
    '%s is bounced back to Home',
    (path, text) => {
      renderApp(path);
      expect(screen.queryByText(text)).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome');
    }
  );

  it('can open Score Claims', () => {
    renderApp('/table-visualizer');
    expect(screen.getByText('Score claims page')).toBeInTheDocument();
  });
});
