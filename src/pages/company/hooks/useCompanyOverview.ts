import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/db/supabase';

export interface CompanyDetails {
  id: string;
  name: string;
  maxUserSlots: number;
  isActive: boolean;
}

type SupabaseRow = Record<string, unknown>;

export interface ActivityLog {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: SupabaseRow | null;
  createdAt: string;
  userName: string | null;
}

export interface SlotRequest {
  id: string;
  requestedSlots: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
}

export interface CompanyOverviewState {
  company: CompanyDetails | null;
  totalUsers: number;
  activeUsers: number;
  pendingRequest: SlotRequest | null;
  activities: ActivityLog[];
}

/**
 * Names of the people behind activity entries. Best effort: people outside the company (such as an
 * Admin) may not be readable, and a failed lookup only means the name is left out.
 */
async function lookupUserNames(userIds: unknown[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const ids = [...new Set(userIds.filter((id): id is string => typeof id === 'string'))];
  if (ids.length === 0) return names;

  try {
    const { data } = await supabase.from('user_profiles').select('user_id, full_name').in('user_id', ids);
    for (const row of data ?? []) {
      if (row.full_name) names.set(row.user_id, row.full_name);
    }
  } catch {
    // names are optional
  }
  return names;
}

export function useCompanyOverview() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CompanyOverviewState>({
    company: null,
    totalUsers: 0,
    activeUsers: 0,
    pendingRequest: null,
    activities: [],
  });

  const refresh = useCallback(async () => {
    if (!profile?.company_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const companyId = profile.company_id;

      const [companyRes, usersCountRes, pendingReqRes, logsRes] = await Promise.all([
        supabase.from('companies').select('id, name, max_user_slots, is_active').eq('id', companyId).maybeSingle(),
        supabase.from('user_profiles').select('is_active', { count: 'exact' }).eq('company_id', companyId),
        supabase.from('slot_requests').select('id, requested_slots, status').eq('company_id', companyId).eq('status', 'pending').maybeSingle(),
        supabase.from('admin_activity_log').select(`
          id,
          action,
          target_type,
          target_id,
          details,
          created_at,
          user_id
        `).eq('details->>company_id', companyId).order('created_at', { ascending: false }).limit(10),
      ]);

      const updatedState: CompanyOverviewState = {
        company: null,
        totalUsers: 0,
        activeUsers: 0,
        pendingRequest: null,
        activities: [],
      };

      let hasFetchError = false;

      // Handle Company Row
      if (companyRes.error) {
        hasFetchError = true;
      } else if (companyRes.data) {
        updatedState.company = {
          id: companyRes.data.id,
          name: companyRes.data.name,
          maxUserSlots: companyRes.data.max_user_slots,
          isActive: companyRes.data.is_active,
        };
      }

      // Handle Users Count
      if (usersCountRes.error) {
        hasFetchError = true;
      } else if (usersCountRes.data) {
        updatedState.totalUsers = usersCountRes.count ?? 0;
        updatedState.activeUsers = usersCountRes.data.filter((u) => u.is_active).length;
      }

      // Handle Pending Slot Request
      if (pendingReqRes.error) {
        hasFetchError = true;
      } else if (pendingReqRes.data) {
        updatedState.pendingRequest = {
          id: pendingReqRes.data.id,
          requestedSlots: pendingReqRes.data.requested_slots,
          status: pendingReqRes.data.status,
        };
      }

      // Handle Activities
      if (logsRes.error) {
        hasFetchError = true;
      } else if (logsRes.data) {
        const logRows = logsRes.data as SupabaseRow[];
        const names = await lookupUserNames(logRows.map((log) => log.user_id));
        updatedState.activities = logRows.map((log) => ({
          id: String(log.id),
          action: String(log.action),
          targetType: log.target_type ? String(log.target_type) : null,
          targetId: log.target_id ? String(log.target_id) : null,
          details: log.details as SupabaseRow | null,
          createdAt: String(log.created_at),
          userName: (log.user_id ? names.get(String(log.user_id)) : undefined) ?? null,
        }));
      }

      setData(updatedState);
      if (hasFetchError) {
        setError('Some data slices failed to load properly.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch company overview');
    } finally {
      setLoading(false);
    }
  }, [profile?.company_id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
