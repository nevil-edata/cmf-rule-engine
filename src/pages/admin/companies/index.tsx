import { useEffect, useState, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import {
  Building2,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { SuggestInput } from '@/components/ui/suggest-input';
import { Card, CardContent } from '@/components/ui/card';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deactivateCompany,
  reactivateCompany,
  type Company,
} from '@/lib/db/admin-operations';
import { CreateCompanyDialog } from './components/CreateCompanyDialog';
import { EditCompanyDialog } from './components/EditCompanyDialog';
import { CompanyRow } from './components/CompanyRow';

export default function AdminCompanies() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Admin', href: '/admin' },
      { label: 'Companies', href: '/admin/companies' },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(params: {
    name: string;
    country: string;
    insuranceType: 'motor' | 'medical';
    maxUserSlots: number;
  }) {
    await createCompany(params);
    await loadCompanies();
    setCreateOpen(false);
  }

  async function handleToggleActive(company: Company) {
    setTogglingId(company.id);
    try {
      if (company.isActive) {
        await deactivateCompany(company.id);
      } else {
        await reactivateCompany(company.id);
      }
      await loadCompanies();
    } catch (err) {
      console.error('Failed to toggle company:', err);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleEdit(params: {
    id: string;
    name: string;
    country: string;
    insuranceType: 'motor' | 'medical';
    maxUserSlots: number;
  }) {
    const { id, ...updates } = params;
    await updateCompany(id, updates);
    await loadCompanies();
    setEditOpen(false);
    setEditingCompany(null);
  }

  function openEdit(company: Company) {
    setEditingCompany(company);
    setEditOpen(true);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.insuranceType.toLowerCase().includes(q)
    );
  }, [companies, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="Administration"
        title="Companies"
        description="Manage client companies and their access"
        actions={
          <>
  <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Company
          </Button>
          </>
        }
      />

      {/* Search */}
      <SuggestInput
        className="max-w-sm"
        placeholder="Search companies..."
        value={search}
        onValueChange={setSearch}
        suggestions={companies.map((c) => c.name)}
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-10 w-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {search ? 'No companies match your search' : 'No companies yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Company</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Country</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Type</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Slots</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <CompanyRow
                    key={company.id}
                    company={company}
                    onEdit={openEdit}
                    onToggleActive={handleToggleActive}
                    toggling={togglingId === company.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateCompanyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      {editingCompany && (
        <EditCompanyDialog
          open={editOpen}
          company={editingCompany}
          onOpenChange={setEditOpen}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}
