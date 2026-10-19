/**
 * M3-4.C.2 — Company Users Page
 *
 * Replaces the existing scaffolded /company/users with a clean user-management page.
 * No slot UI here - that belongs on /company (Stream B).
 */

import { Loader2, UserPlus, Users, Pencil, UserX, UserCheck } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { Card, CardContent } from '@/components/ui/card';
import { SuggestInput } from '@/components/ui/suggest-input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/Layout/PageHeader';
import { headerBreadcrumbsAtom } from '@/store/atoms/header';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useCompanyUserMgmt } from './hooks/useCompanyUserMgmt';
import { RegisterCompanyUserDialog } from './components/RegisterCompanyUserDialog';
import { EditCompanyUserDialog } from './components/EditCompanyUserDialog';
import { UserStatusConfirmDialog } from './components/UserStatusConfirmDialog';
import { UserRecoveryMenu } from './components/UserRecoveryMenu';

/**
 * Resend Invite / Reset Access call the edge functions resend-user-invite and reset-user-access,
 * which are not deployed (and not in the repo), so the menu is hidden until they exist.
 * Set this to true again once they are built and deployed.
 */
const RECOVERY_MENU_ENABLED = false;

export default function CompanyUsers() {
  const setBreadcrumbs = useSetAtom(headerBreadcrumbsAtom);
  const { profile } = useAuth();
  const {
    users,
    filtered,
    search,
    setSearch,
    loading,
    error,
    refresh,
    pendingAction,
    setPendingAction,
    company,
  } = useCompanyUserMgmt();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Company Users', href: '/company/users' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const roleLabel: Record<string, string> = {
    client_admin: 'Client Admin',
    client_user: 'Client User',
  };

  // Determine current dialog state
  const isRegisterOpen = pendingAction?.type === 'register';
  const editUser = pendingAction?.type === 'edit' ? users.find((u) => u.userId === pendingAction.userId) : undefined;
  const toggleUser = pendingAction?.type === 'toggle' ? users.find((u) => u.userId === pendingAction.userId) : undefined;

  const currentUserId = profile?.user_id;
  const maxUserSlots = company?.maxUserSlots ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your company"
        title="Company Users"
        description="Manage users in your company"
        illustration="grid"
        actions={
          <>
  <Button size="sm" className="gap-2" onClick={() => setPendingAction({ type: 'register' })}>
            <UserPlus className="h-4 w-4" />
            Register User
          </Button>
          </>
        }
      />

      <SuggestInput
        className="max-w-sm"
        placeholder="Search users..."
        value={search}
        onValueChange={setSearch}
        suggestions={users.flatMap((u) => [u.fullName ?? '', u.email ?? ''].filter(Boolean))}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Failed to load users
            </p>
            <p className="text-xs mt-1 max-w-md text-center" style={{ color: 'var(--color-text-muted)' }}>
              {error}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => void refresh()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-10 w-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {search ? 'No users match your search' : 'No users yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Last Sign-in
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Added
                  </th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isSelf = user.userId === currentUserId;
                  const isAdminRow = user.role === 'admin';
                  const canModify = !isSelf && !isAdminRow;

                  return (
                    <tr
                      key={user.userId}
                      className="border-b last:border-0"
                      style={{ borderColor: 'var(--color-border-subtle)' }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {user.fullName ?? 'Unnamed'}
                          </span>
                          {user.email && (
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {user.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor:
                              user.role === 'client_admin'
                                ? 'var(--color-brand-blue-bg, color-mix(in srgb, var(--color-primary) 12%, transparent))'
                                : 'var(--color-muted-bg, color-mix(in srgb, var(--color-muted-foreground) 14%, transparent))',
                            color:
                              user.role === 'client_admin'
                                ? 'var(--color-brand-blue)'
                                : 'var(--color-text-secondary)',
                          }}
                        >
                          {roleLabel[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: user.isActive
                              ? 'var(--color-status-green-bg, color-mix(in srgb, var(--color-success) 12%, transparent))'
                              : 'var(--color-status-red-bg, color-mix(in srgb, var(--color-destructive) 12%, transparent))',
                            color: user.isActive ? 'var(--color-status-green)' : 'var(--color-status-red)',
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setPendingAction({ type: 'edit', userId: user.userId })}
                            disabled={!canModify}
                            title={isSelf ? 'Cannot edit your own account' : isAdminRow ? 'Cannot edit admin users' : 'Edit user'}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setPendingAction({ type: 'toggle', userId: user.userId })}
                            disabled={!canModify}
                            title={isSelf ? 'Cannot deactivate your own account' : isAdminRow ? 'Cannot modify admin users' : user.isActive ? 'Deactivate user' : 'Reactivate user'}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          {RECOVERY_MENU_ENABLED && (
                            <UserRecoveryMenu
                              userId={user.userId}
                              userName={user.fullName ?? 'Unknown'}
                              disabled={isAdminRow}
                              onSuccess={refresh}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      <RegisterCompanyUserDialog
        open={isRegisterOpen}
        onOpenChange={(open) => !open && setPendingAction(null)}
        onSuccess={refresh}
        currentCount={users.length}
        maxCount={maxUserSlots}
      />

      {editUser && (
        <EditCompanyUserDialog
          user={editUser}
          open={pendingAction?.type === 'edit'}
          onOpenChange={(open) => !open && setPendingAction(null)}
          onSuccess={refresh}
          disabled={editUser.userId === currentUserId}
        />
      )}

      {toggleUser && (
        <UserStatusConfirmDialog
          user={toggleUser}
          open={pendingAction?.type === 'toggle'}
          onOpenChange={(open) => !open && setPendingAction(null)}
          onSuccess={refresh}
          disabled={toggleUser.userId === currentUserId}
        />
      )}
    </div>
  );
}
