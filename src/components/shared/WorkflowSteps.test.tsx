import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkflowSteps } from './WorkflowSteps';

function renderSteps(props: { canWrite: boolean; uploadDone?: boolean }) {
  return render(
    <MemoryRouter>
      <WorkflowSteps {...props} />
    </MemoryRouter>
  );
}

describe('WorkflowSteps', () => {
  it('shows all four steps in order to people who can change data', () => {
    renderSteps({ canWrite: true });
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'Upload a dataset',
      'Check the column mapping',
      'Score the claims',
      'Add rules (optional)',
    ]);
  });

  it('shows read-only users only the step they can do', () => {
    renderSteps({ canWrite: false });
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(['Score the claims']);
  });

  it('links the scoring step to the scoring page', () => {
    renderSteps({ canWrite: false });
    expect(screen.getByRole('link', { name: /Score the claims/ })).toHaveAttribute('href', '/table-visualizer');
  });
});
