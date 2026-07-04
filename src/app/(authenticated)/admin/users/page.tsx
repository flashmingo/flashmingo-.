'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, MoreHorizontal, CheckCircle2,
  XCircle, Shield, GraduationCap, User, Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRole } from '@/hooks/useRole';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string; full_name: string | null; avatar_url: string | null;
  role: 'student' | 'teacher' | 'administrator';
  account_status: 'pending' | 'approved' | 'suspended';
  created_at: string; last_login_at: string | null;
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
  approved: 'success', pending: 'warning', suspended: 'destructive',
};

const roleIcon: Record<string, React.ElementType> = {
  student: User, teacher: GraduationCap, administrator: Shield,
};

function UserRow({ user, onUpdate, onDelete }: {
  user: AdminUser;
  onUpdate: (id: string, update: { account_status?: string; role?: string }) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const Icon = roleIcon[user.role] ?? User;
  const initials = (user.full_name ?? 'U')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <tr className="group border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      {/* User */}
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {user.full_name ?? 'Unknown user'}
            </p>
            <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}…</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3 px-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground capitalize">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />{user.role}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 px-3">
        <Badge variant={statusVariant[user.account_status] ?? 'muted'} className="capitalize">
          {user.account_status}
        </Badge>
      </td>

      {/* Joined */}
      <td className="py-3 px-3 text-xs text-muted-foreground hidden md:table-cell">
        {formatDate(user.created_at)}
      </td>

      {/* Last login */}
      <td className="py-3 px-3 text-xs text-muted-foreground hidden lg:table-cell">
        {user.last_login_at ? formatDate(user.last_login_at) : <span className="italic">Never</span>}
      </td>

      {/* Actions */}
      <td className="py-3 pr-4 pl-2">
        <div className="flex items-center justify-end">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="User actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[180px] rounded-xl border border-border bg-white p-1.5 shadow-lg data-[state=open]:animate-scale-in"
                align="end"
              >
                {/* Status actions */}
                {user.account_status !== 'approved' && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-green-50 text-green-700 outline-none"
                    onSelect={() => onUpdate(user.id, { account_status: 'approved' })}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve account
                  </DropdownMenu.Item>
                )}
                {user.account_status !== 'suspended' && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-red-50 text-red-600 outline-none"
                    onSelect={() => onUpdate(user.id, { account_status: 'suspended' })}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Suspend account
                  </DropdownMenu.Item>
                )}
                {user.account_status !== 'pending' && (
                  <DropdownMenu.Item
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-muted outline-none"
                    onSelect={() => onUpdate(user.id, { account_status: 'pending' })}
                  >
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Set to pending
                  </DropdownMenu.Item>
                )}

                <div className="my-1 h-px bg-border" />

                {/* FERPA: Delete all user data */}
                <DropdownMenu.Item
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-red-50 text-red-600 outline-none"
                  onSelect={() => onDelete(user.id, user.full_name ?? 'this user')}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete all data (FERPA)
                </DropdownMenu.Item>

                <div className="my-1 h-px bg-border" />

                {/* Role changes */}
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Change role
                </p>
                {(['student', 'teacher', 'administrator'] as const)
                  .filter((r) => r !== user.role)
                  .map((r) => {
                    const RIcon = roleIcon[r] ?? User;
                    return (
                      <DropdownMenu.Item
                        key={r}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-muted outline-none capitalize"
                        onSelect={() => onUpdate(user.id, { role: r })}
                      >
                        <RIcon className="h-3.5 w-3.5 text-muted-foreground" /> Make {r}
                      </DropdownMenu.Item>
                    );
                  })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; role?: string }>;
}) {
  const { status: initialStatus } = use(searchParams);
  const { isAdmin } = useRole();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus ?? 'all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users', statusFilter, roleFilter],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (statusFilter !== 'all') p.set('status', statusFilter);
      if (roleFilter   !== 'all') p.set('role',   roleFilter);
      const res = await fetch(`/api/admin/users?${p}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, update }: { id: string; update: Record<string, string> }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (id: string, name: string) => setDeleteTarget({ id, name });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  const filtered = users.filter((u) =>
    !search || (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="p-8 text-center py-24 text-sm text-muted-foreground">
        Administrator access required.
      </div>
    );
  }

  const pending = users.filter((u) => u.account_status === 'pending').length;

  return (
    <div className="p-6 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" />Admin</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">User Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {users.length} users{pending > 0 && ` · ${pending} pending approval`}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center rounded-lg border border-border bg-white p-0.5 gap-0.5">
          {['all', 'pending', 'approved', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize',
                statusFilter === s ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Role filter */}
        <div className="flex items-center rounded-lg border border-border bg-white p-0.5 gap-0.5">
          {['all', 'student', 'teacher', 'administrator'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize',
                roleFilter === r ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="ml-auto h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="rounded-xl border border-border bg-white overflow-x-auto shadow-card">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No users match your filters.
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Last login</th>
                  <th className="py-2.5 pr-4 pl-2 w-12" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onUpdate={(id, update) => updateMutation.mutate({ id, update })}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="FERPA data deletion"
        description={
          <>
            Permanently delete all data for{' '}
            <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
            {' '}All decks, cards, study sessions, and progress will be erased.
            This cannot be undone.
          </>
        }
        confirmLabel="Delete all data"
        typeToConfirm="DELETE"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
