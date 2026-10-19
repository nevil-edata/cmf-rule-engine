import { useEffect, useState } from 'react';
import type { UserRole } from '@/lib/auth/context';
import { getDatasets, getDatasetsWithRulesets, getTrees } from '@/lib/db/operations';
import { getAdminDashboardCounts, getPendingSlotRequests } from '@/lib/db/admin-operations';

export interface HomeData {
  loading: boolean;
  /** null = could not be loaded; the page then shows a dash instead of a wrong zero */
  datasets: number | null;
  trees: number | null;
  datasetsWithRules: number | null;
  /** Admin only */
  companies: number | null;
  users: number | null;
  pendingSlotRequests: number | null;
}

const empty: HomeData = {
  loading: true,
  datasets: null,
  trees: null,
  datasetsWithRules: null,
  companies: null,
  users: null,
  pendingSlotRequests: null,
};

async function attempt<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (err) {
    console.error('Home: a count failed to load', err);
    return null;
  }
}

/** The few numbers the Home page needs. Each one loads on its own so one failure does not blank the page. */
export function useHomeData(role: UserRole | null): HomeData {
  const [data, setData] = useState<HomeData>(empty);

  useEffect(() => {
    if (!role) return;
    let cancelled = false;

    async function load() {
      if (role === 'admin') {
        const [counts, pending] = await Promise.all([
          attempt(getAdminDashboardCounts),
          attempt(getPendingSlotRequests),
        ]);
        if (cancelled) return;
        setData({
          loading: false,
          datasets: counts?.datasets ?? null,
          trees: counts?.trees ?? null,
          datasetsWithRules: null,
          companies: counts?.companies ?? null,
          users: counts?.users ?? null,
          pendingSlotRequests: pending ? pending.length : null,
        });
        return;
      }

      const [datasets, trees, withRules] = await Promise.all([
        attempt(getDatasets),
        attempt(getTrees),
        attempt(getDatasetsWithRulesets),
      ]);
      if (cancelled) return;
      setData({
        loading: false,
        datasets: datasets ? datasets.length : null,
        trees: trees ? trees.length : null,
        datasetsWithRules: withRules ? withRules.filter((d) => (d.ruleset?.ruleCount ?? 0) > 0).length : null,
        companies: null,
        users: null,
        pendingSlotRequests: null,
      });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  return data;
}
