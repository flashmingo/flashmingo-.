'use client';

import Link from 'next/link';
import {
  Users, BookOpen, Brain, ShieldCheck, Activity,
  ArrowRight, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Database, Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRole } from '@/hooks/useRole';
import { formatDate, formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AdminStats {
  users: {
    total: number; students: number; teachers: number; admins: number;
    pending: number; suspended: number;
  };
  decks: { total: number };
  activity: { sessions7d: number; cardsReviewed7d: number; accuracy7d: number | null };
  recentAuditLogs: Array<{
    id: number; action_type: string; resource_type: string | null;
    timestamp: string; user_id: string | null;
  }>;
}

function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg, href, alert,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
  href?: string; alert?: boolean;
}) {
  const inner = (
    <div className={cn(
      'flex items-start gap-4 rounded-xl border bg-white p-5 transition-all duration-150',
      href ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : '',
      alert ? 'border-amber-200 bg-amber-50' : 'border-border'
    )}>
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs font-medium text-amber-600 mt-1">{sub}</p>}
      </div>
      {href && <ArrowRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function actionLabel(type: string): string {
  const map: Record<string, string> = {
    login: 'User signed in', logout: 'User signed out',
    create_deck: 'Deck created', delete_deck: 'Deck deleted',
    create_card: 'Card added', delete_card: 'Card deleted',
    approve_user: 'Account approved', suspend_user: 'Account suspended',
    change_role: 'Role changed', join_classroom: 'Joined classroom',
  };
  return map[type] ?? type.replace(/_/g, ' ');
}

function actionIcon(type: string) {
  if (type.includes('login'))    return <Activity className="h-3.5 w-3.5 text-blue-500" />;
  if (type.includes('approve'))  return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  if (type.includes('suspend'))  return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
  if (type.includes('delete'))   return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function AdminPage() {
  const { isAdmin } = useRole();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: isAdmin,
    refetchInterval: 60_000,
  });

  if (!isAdmin) {
    return (
      <div className="p-8 text-center py-24">
        <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Administrator access required.</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/dashboard">Go back</Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">District management &amp; system health</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">System operational</span>
          </div>
        </div>
      </div>

      {/* Pending approval alert */}
      {stats.users.pending > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{stats.users.pending} account{stats.users.pending !== 1 ? 's' : ''} pending approval</span>
              {' '}— review and approve new users to grant access.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100">
            <Link href="/admin/users?status=pending">Review</Link>
          </Button>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users" value={stats.users.total}
          sub={stats.users.pending > 0 ? `${stats.users.pending} pending` : undefined}
          icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50"
          href="/admin/users" alert={stats.users.pending > 0}
        />
        <StatCard
          label="Students" value={stats.users.students}
          icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50"
        />
        <StatCard
          label="Teachers" value={stats.users.teachers}
          icon={ShieldCheck} iconColor="text-teal-600" iconBg="bg-teal-50"
        />
        <StatCard
          label="Total decks" value={stats.decks.total}
          icon={BookOpen} iconColor="text-slate-600" iconBg="bg-slate-100"
        />
      </div>

      {/* 7-day activity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Sessions (7d)</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{stats.activity.sessions7d}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Cards reviewed (7d)</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{stats.activity.cardsReviewed7d.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Accuracy (7d)</p>
          <p className={cn(
            'text-2xl font-bold tabular-nums',
            stats.activity.accuracy7d === null ? 'text-muted-foreground' :
            stats.activity.accuracy7d >= 70 ? 'text-teal-600' : 'text-orange-500'
          )}>
            {stats.activity.accuracy7d !== null ? `${stats.activity.accuracy7d}%` : '—'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick links */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Management</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/users',       icon: Users,       label: 'User Management',  desc: 'Approve accounts, change roles, suspend users' },
              { href: '/admin/users?status=pending', icon: Clock, label: 'Pending Approvals', desc: `${stats.users.pending} account${stats.users.pending !== 1 ? 's' : ''} awaiting review`, alert: stats.users.pending > 0 },
              { href: '/admin/audit-logs',  icon: Activity,    label: 'Audit Logs',       desc: 'Full history of admin and user actions' },
            ].map(({ href, icon: Icon, label, desc, alert }) => (
              <Link key={href} href={href}>
                <div className={cn(
                  'flex items-center gap-3 rounded-xl border bg-white p-4 transition-all duration-150',
                  'hover:border-slate-300 hover:shadow-md cursor-pointer group',
                  alert ? 'border-amber-200' : 'border-border'
                )}>
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    alert ? 'bg-amber-100' : 'bg-muted'
                  )}>
                    <Icon className={cn('h-4 w-4', alert ? 'text-amber-600' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* System info */}
          <div className="rounded-xl border border-border bg-white p-5 space-y-3 mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">System</h3>
            {[
              { icon: Database, label: 'Database',    value: 'Supabase Postgres',   status: 'ok' },
              { icon: Lock,     label: 'Auth',        value: 'Google OAuth (SSO)',   status: 'ok' },
              { icon: ShieldCheck, label: 'Compliance', value: 'FERPA enabled',      status: 'ok' },
            ].map(({ icon: Icon, label, value, status }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{value}</span>
                  <span className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/audit-logs">View all</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            {stats.recentAuditLogs.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No recent activity.</div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recentAuditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                      {actionIcon(log.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{actionLabel(log.action_type)}</p>
                      {log.resource_type && (
                        <p className="text-xs text-muted-foreground capitalize">{log.resource_type}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
