import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Help from './index';
import { pageGuides, taskGuides } from './content';
import type { UserRole } from '@/lib/auth/context';

let currentRole: UserRole | null = 'client_user';

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ profile: currentRole ? { role: currentRole } : null }),
}));

function renderHelp() {
  return render(
    <MemoryRouter>
      <Help />
    </MemoryRouter>
  );
}

describe('Help page', () => {
  beforeEach(() => {
    currentRole = 'client_user';
  });

  it('shows the heading and the main sections, with no role badge in the header', () => {
    renderHelp();
    expect(screen.getByRole('heading', { level: 1, name: /Help & Guide/ })).toBeInTheDocument();
    expect(screen.queryByText(/You are:/)).not.toBeInTheDocument();
    for (const title of ['Start here', 'What each page is for', 'Step by step', 'Reading the results', 'Handy tips', 'If something goes wrong']) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
  });

  it('explains the score is a review priority and not a verdict', () => {
    renderHelp();
    expect(screen.getAllByText(/review priority/i).length).toBeGreaterThan(0);
  });

  it('only lists the pages and tasks a Client User can use', () => {
    renderHelp();
    const pages = screen.getByRole('heading', { level: 2, name: 'What each page is for' }).closest('section')!;
    expect(within(pages).getByText('Score Claims')).toBeInTheDocument();
    expect(within(pages).queryByText('Company Users')).not.toBeInTheDocument();

    expect(screen.getByText('Score a file of claims')).toBeInTheDocument();
    expect(screen.queryByText('Register a user')).not.toBeInTheDocument();
    expect(screen.queryByText('Write and use rules')).not.toBeInTheDocument();
  });

  it('has no admin-only content for anyone (Help is for all users)', () => {
    for (const role of ['admin', 'client_admin', 'client_user'] as const) {
      currentRole = role;
      const { unmount } = renderHelp();
      for (const text of ['Generate Tree', 'Generate a decision tree', 'Admin Dashboard', 'Register a user or company', 'New Company']) {
        expect(screen.queryByText(text)).not.toBeInTheDocument();
      }
      unmount();
    }
  });

  it('shows the user and company tasks to a Client Admin', () => {
    currentRole = 'client_admin';
    renderHelp();
    expect(screen.getByText('Register a user')).toBeInTheDocument();
    expect(screen.getByText('Ask for more user slots')).toBeInTheDocument();
    expect(screen.getByText('Write and use rules')).toBeInTheDocument();
  });

  it('lets an Admin register users too', () => {
    currentRole = 'admin';
    renderHelp();
    expect(screen.getByText('Register a user')).toBeInTheDocument();
  });

  it('does not explain signing in or list who can do what (the reader is already signed in)', () => {
    renderHelp();
    expect(screen.queryByText('Signing in')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Who can do what' })).not.toBeInTheDocument();
    expect(screen.queryByText('I did not get my sign-in code')).not.toBeInTheDocument();
  });

  it('links each page entry to a real route', () => {
    currentRole = 'admin';
    renderHelp();
    const pages = screen.getByRole('heading', { level: 2, name: 'What each page is for' }).closest('section')!;
    const link = within(pages).getByRole('link', { name: /^Score Claims/ });
    expect(link).toHaveAttribute('href', '/table-visualizer');
  });
});

describe('Help content', () => {
  it('every task has steps and at least one role; every page points at a path', () => {
    for (const t of taskGuides) {
      expect(t.steps.length).toBeGreaterThan(0);
      expect(t.roles.length).toBeGreaterThan(0);
    }
    for (const p of pageGuides) {
      expect(p.path.startsWith('/')).toBe(true);
      expect(p.summary.length).toBeGreaterThan(20);
    }
  });
});
