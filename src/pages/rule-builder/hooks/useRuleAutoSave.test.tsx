import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, useSetAtom, useAtomValue } from 'jotai';
import type { ReactNode } from 'react';
import { useRuleAutoSave } from './useRuleAutoSave';
import { useDatasetCompanyId } from './useDatasetCompanyId';
import { ruleBuilderRulesAtom, ruleBuilderSaveStatusAtom } from '@/store/atoms/ruleBuilder';
import type { RuleItem } from '@/lib/types/ruleBuilder';

const upsertRuleset = vi.fn();
const getDatasetById = vi.fn();

vi.mock('@/lib/db/operations', () => ({
  upsertRuleset: (...args: unknown[]) => upsertRuleset(...args),
  getDatasetById: (...args: unknown[]) => getDatasetById(...args),
}));
vi.mock('@/hooks/useWriteAccess', () => ({ useWriteAccess: () => ({ canWrite: true, role: 'admin' }) }));

const wrapper = ({ children }: { children: ReactNode }) => <Provider>{children}</Provider>;

const rule: RuleItem = { id: 'r1', field: 'TotalLoss', operator: '=', value: true, effect: 'moderate' };

// Follows the real order: the hook mounts while the ruleset is still loading, then loading finishes.
function setup(companyId: string) {
  const hook = renderHook(
    ({ companyId: cid, hasLoaded }: { companyId: string; hasLoaded: boolean }) => ({
      auto: useRuleAutoSave(13, hasLoaded, cid),
      setRules: useSetAtom(ruleBuilderRulesAtom),
      status: useAtomValue(ruleBuilderSaveStatusAtom),
    }),
    { wrapper, initialProps: { companyId, hasLoaded: false } }
  );
  hook.rerender({ companyId, hasLoaded: true });
  return hook;
}

describe('useRuleAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // the rules atom persists to storage; start each test empty
    upsertRuleset.mockResolvedValue({});
  });

  it('saves the changed rules for the given company', async () => {
    const { result } = setup('co-1');
    act(() => result.current.setRules([rule]));
    await waitFor(() => expect(upsertRuleset).toHaveBeenCalledWith(13, [rule], 'co-1'));
  });

  it('does not report a change as saved while no company id is known, then saves once it is', async () => {
    const { result, rerender } = setup('');

    act(() => result.current.setRules([rule]));
    // Previously this silently did nothing while the page kept saying "Auto-saved"
    expect(upsertRuleset).not.toHaveBeenCalled();
    expect(result.current.status).toBe('saving');

    rerender({ companyId: 'co-1', hasLoaded: true });
    await waitFor(() => expect(upsertRuleset).toHaveBeenCalledTimes(1));
    expect(upsertRuleset).toHaveBeenCalledWith(13, [rule], 'co-1');
    await waitFor(() => expect(result.current.status).toBe('saved'));
  });
});

describe('useDatasetCompanyId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the company that owns the dataset (not the signed-in user\'s)', async () => {
    getDatasetById.mockResolvedValue({ id: 13, companyId: 'gig-egypt' });
    const { result } = renderHook(() => useDatasetCompanyId(13));
    expect(result.current).toBe('');
    await waitFor(() => expect(result.current).toBe('gig-egypt'));
    expect(getDatasetById).toHaveBeenCalledWith(13);
  });

  it('stays empty without a dataset or when the lookup fails', async () => {
    const none = renderHook(() => useDatasetCompanyId(null));
    expect(none.result.current).toBe('');
    expect(getDatasetById).not.toHaveBeenCalled();

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getDatasetById.mockRejectedValue(new Error('boom'));
    const failed = renderHook(() => useDatasetCompanyId(5));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(failed.result.current).toBe('');
    spy.mockRestore();
  });
});
