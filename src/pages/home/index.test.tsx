import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './index';
import type { UserRole } from '@/lib/auth/context';
import type { HomeData } from './useHomeData';

let currentRole: UserRole = 'client_admin';
let homeData: HomeData;

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: { email: 'pat.lee@example.com' },
    profile: { role: currentRole, full_name: 'Pat Lee' },
  }),
}));
vi.mock('./useHomeData', () => ({ useHomeData: () => homeData }));

const base: HomeData = {
  loading: false,
  datasets: 3,
  trees: 2,
  datasetsWithRules: 1,
  companies: 4,
  users: 9,
  pendingSlotRequests: 0,
};

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home page', () => {
  beforeEach(() => {
    currentRole = 'client_admin';
    homeData = { ...base };
  });

  it('greets the person by first name', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome, Pat');
  });

  it('suggests uploading a dataset to a Client Admin who has none', () => {
    homeData = { ...base, datasets: 0 };
    renderHome();
    expect(screen.getByRole('heading', { name: 'Upload your first dataset' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Datasets/ })).toHaveAttribute('href', '/datasets');
  });

  it('tells a Client User to ask their admin when there is no data, with no button', () => {
    currentRole = 'client_user';
    homeData = { ...base, datasets: 0 };
    renderHome();
    expect(screen.getByRole('heading', { name: 'No datasets yet' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Go to Datasets/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Upload a dataset')).not.toBeInTheDocument();
  });

  it('sends everyone with data to scoring', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: 'Score your claims' })).toBeInTheDocument();
  });

  it('shows an Admin the setup actions and puts pending slot requests first', () => {
    currentRole = 'admin';
    homeData = { ...base, pendingSlotRequests: 2 };
    renderHome();
    expect(screen.getByRole('heading', { name: 'Review 2 pending slot requests' })).toBeInTheDocument();
    expect(screen.getByText('Companies', { selector: 'h3' })).toBeInTheDocument();
    expect(screen.getByText('Generate a tree')).toBeInTheDocument();
  });

  it('does not show Admin or user-management actions to a Client User', () => {
    currentRole = 'client_user';
    renderHome();
    for (const text of ['Generate a tree', 'Register users', 'Manage your users', 'Write rules']) {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
  });

  it('shows a dash instead of a wrong zero when a count could not be loaded', () => {
    homeData = { ...base, trees: null };
    renderHome();
    expect(screen.getByText('Decision trees', { selector: 'p' }).nextElementSibling).toHaveTextContent('-');
  });
});
