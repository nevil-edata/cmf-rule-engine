import { useState } from 'react';
import { beforeAll, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchableSelect, filterOptions, type SearchableOption } from './searchable-select';
import { SuggestInput, matchSuggestions } from './suggest-input';

// jsdom has no layout, so give the anchor a size and make scrollIntoView a no-op
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const companies: SearchableOption[] = [
  { value: 'a', label: 'GIG', hint: 'Egypt' },
  { value: 'b', label: 'GIG', hint: 'Saudi' },
  { value: 'c', label: 'Al Koot', hint: 'Qatar' },
  { value: 'd', label: 'Liva Insurance', hint: 'Saudi' },
];

function Harness({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <SearchableSelect
      aria-label="Company"
      options={companies}
      value={value}
      placeholder="Select a company"
      clearLabel="No company"
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
}

describe('filterOptions', () => {
  it('matches every typed word against label and hint, prefix matches first', () => {
    expect(filterOptions(companies, 'gig saudi').map((o) => o.value)).toEqual(['b']);
    expect(filterOptions(companies, 'saudi').map((o) => o.value)).toEqual(['b', 'd']);
    expect(filterOptions(companies, 'koot').map((o) => o.value)).toEqual(['c']);
    expect(filterOptions(companies, 'zzz')).toEqual([]);
    expect(filterOptions(companies, '  ')).toEqual(companies);
  });
});

describe('SearchableSelect', () => {
  it('shows the placeholder, opens on click and lists every option', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Company' });
    expect(trigger).toHaveTextContent('Select a company');

    await user.click(trigger);
    expect(await screen.findAllByRole('option')).toHaveLength(5); // clear entry + 4 companies
  });

  it('filters while typing and selects only what you pick (Enter takes the highlighted match)', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Company' }));

    await user.type(screen.getByLabelText('Search options'), 'liva');
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('d');
    expect(screen.getByRole('combobox', { name: 'Company' })).toHaveTextContent('Liva Insurance');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('arrow keys move the highlight before Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Company' }));
    await user.type(screen.getByLabelText('Search options'), 'gig');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('b'); // the second GIG (Saudi), not a random one
  });

  it('typing a letter on the closed dropdown starts a search instead of jumping to an option', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    screen.getByRole('combobox', { name: 'Company' }).focus();
    await user.keyboard('a');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Search options')).toHaveValue('a');
  });

  it('Escape closes without changing the selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Company' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows a message when nothing matches and can clear the selection', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('combobox', { name: 'Company' });

    await user.click(trigger);
    await user.type(screen.getByLabelText('Search options'), 'nothing like this');
    expect(screen.getByText('No matches')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Al Koot/ }));
    expect(trigger).toHaveTextContent('Al Koot');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'No company' }));
    expect(trigger).toHaveTextContent('Select a company');
  });
});

describe('matchSuggestions', () => {
  const names = ['gig claims 2', 'gig_egypt_poc_tree', 'poc_tree', 'AlKootPOCTree', 'POC Tree'];
  it('returns nothing for an empty query, then the best matches first', () => {
    expect(matchSuggestions(names, '', 8)).toEqual([]);
    expect(matchSuggestions(names, 'poc', 8)).toEqual(['poc_tree', 'POC Tree', 'gig_egypt_poc_tree', 'AlKootPOCTree']);
    expect(matchSuggestions(names, 'poc', 2)).toHaveLength(2);
    expect(matchSuggestions(names, 'tree poc', 8)).toContain('POC Tree');
  });
});

function SuggestHarness({ onValue }: { onValue?: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <SuggestInput
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onValue?.(v);
      }}
      suggestions={['gig claims 2', 'gig_egypt_poc_tree', 'poc_tree']}
      placeholder="Search trees..."
    />
  );
}

describe('SuggestInput', () => {
  it('suggests matching names while typing and fills in the exact name you pick', async () => {
    const user = userEvent.setup();
    render(<SuggestHarness />);
    const input = screen.getByRole('combobox', { name: 'Search trees...' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.type(input, 'gig');
    expect(await screen.findAllByRole('option')).toHaveLength(2);

    await user.click(screen.getByRole('option', { name: 'gig_egypt_poc_tree' }));
    expect(input).toHaveValue('gig_egypt_poc_tree');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('arrow keys and Enter pick a suggestion; Escape hides them', async () => {
    const user = userEvent.setup();
    render(<SuggestHarness />);
    const input = screen.getByRole('combobox', { name: 'Search trees...' });

    await user.type(input, 'poc');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(input).toHaveValue('poc_tree');

    await user.clear(input);
    await user.type(input, 'gig');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('gig');
  });

  it('still works as a plain search box and can be cleared', async () => {
    const onValue = vi.fn();
    const user = userEvent.setup();
    render(<SuggestHarness onValue={onValue} />);
    await user.type(screen.getByRole('combobox', { name: 'Search trees...' }), 'zzz');
    expect(onValue).toHaveBeenLastCalledWith('zzz');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onValue).toHaveBeenLastCalledWith('');
  });
});
