'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Activity, CheckCircle2, AlertTriangle,
  Clock, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRole } from '@/hooks/useRole';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: number;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  timestamp: string;
  user_id: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  login: 'User signed in',
  logout: 'User signed out',
  create_deck: 'Deck created',
  delete_deck: 'Deck deleted',
  update_deck: 'Deck updated',
  create_card: 'Card added',
  delete_card: 'Card deleted',
  approve_user: 'Account approved',
  suspend_user: 'Account suspended',
  change_role: 'Role changed',
  join_classroom: 'Joined classroom',
  leave_classroom: 'Left classroom',
  create_classroom: 'Classroom created',
  delete_classroom: 'Classroom deleted',
  study_session: 'Study session completed',
};

function actionLabel(type: string) {
  return ACTION_LABELS[type] ?? type.replace(/_/g, ' ');
}

function ActionIcon({ type }: { type: string }) {
  if (type.includes('login'))   return <Activity   className="h-3.5 w-3.5 text-blue-500" />;
  if (type.includes('approve')) return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
  if (type.includes('suspend') || type.includes('delete'))
    return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
  if (type.includes('study'))   return <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />;
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
}

function LogRow({ log, expanded, onToggle }: {
  log: AuditLog; expanded: boolean; onToggle: () => void;
}) {
  const hasDetail = !!(log.resource_type || log.resource_id || log.user_id);

  return (
    <>
      <tr
        className={cn(
          'border-b border-border last:border-0 hover:bg-muted/20 transition-colors',
          hasDetail ? 'cursor-pointer' : ''
        )}
        onClick={hasDetail ? onToggle : undefined}
      >
        <td className="py-3 pl-4 pr-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
              <ActionIcon type={log.action_type} />
            </div>
            <span className="text-sm text-foreground capitalize">{actionLabel(log.action_type)}</span>
          </div>
        </td>
        <td className="py-3 px-3 hidden sm:table-cell">
          {log.resource_type ? (
            <span className="text-xs bg-muted rounded-md px-2 py-0.5 capitalize">
              {log.resource_type}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </td>
        <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums hidden md:table-cell">
          {log.user_id ? <span className="font-mono">{log.user_id.slice(0, 8)}…</span> : '—'}
        </td>
        <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">
          {formatDateTime(log.timestamp)}
        </td>
        <td className="py-3 pr-4 pl-2 w-8">
          {hasDetail && (
            <span className="text-muted-foreground/40">
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </span>
          )}
        </td>
      </tr>
      {expanded && hasDetail && (
        <tr className="bg-muted/10 border-b border-border">
          <td colSpan={5} className="px-4 py-3">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {log.resource_type && (
                <>
                  <dt className="text-muted-foreground font-medium">Resource type</dt>
                  <dd className="capitalize col-span-1 md:col-span-2">{log.resource_type}</dd>
                </>
              )}
              {log.resource_id && (
                <>
                  <dt className="text-muted-foreground font-medium">Resource ID</dt>
                  <dd className="font-mono col-span-1 md:col-span-2 truncate">{log.resource_id}</dd>
                </>
              )}
              {log.user_id && (
                <>
                  <dt className="text-muted-foreground font-medium">User ID</dt>
                  <dd className="font-mono col-span-1 md:col-span-2 truncate">{log.user_id}</dd>
                </>
              )}
              <dt className="text-muted-foreground font-medium">Log ID</dt>
              <dd className="col-span-1 md:col-span-2 tabular-nums">#{log.id}</dd>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

const LIMITS = [50, 100, 200] as const;

export default function AuditLogsPage() {
  const { isAdmin } = useRole();
  const [limit, setLimit] = useState<50 | 100 | 200>(50);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="p-8 py-24 text-center text-sm text-muted-foreground">
        Administrator access required.
      </div>
    );
  }

  const actionTypes = ['all', ...Array.from(new Set(logs.map((l) => l.action_type))).sort()];
  const filtered = typeFilter === 'all' ? logs : logs.filter((l) => l.action_type === typeFilter);

  return (
    <div className="p-6 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin"><ArrowLeft className="h-4 w-4 mr-1" />Admin</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Audit Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filtered.length} entries{typeFilter !== 'all' ? ` · filtered by "${typeFilter}"` : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Action type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 capitalize"
        >
          {actionTypes.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t === 'all' ? 'All actions' : actionLabel(t)}
            </option>
          ))}
        </select>

        {/* Limit */}
        <div className="flex items-center rounded-lg border border-border bg-white p-0.5 gap-0.5 ml-auto">
          {LIMITS.map((l) => (
            <button
              key={l}
              onClick={() => setLimit(l)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                limit === l ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="ml-auto h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="py-2.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Resource</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">User ID</th>
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</th>
                  <th className="py-2.5 pr-4 pl-2 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    expanded={expandedId === log.id}
                    onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
