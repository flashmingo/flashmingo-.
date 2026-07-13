'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, Check, X, Layers, Clock, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';

interface PublishRequest {
  id: string;
  name: string;
  description: string | null;
  card_count: number;
  owner_name: string;
  requested_at: string | null;
}

const spring = { type: 'spring' as const, stiffness: 320, damping: 30 };

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function PublishRequestsPage() {
  const { isTeacher, isAdmin } = useRole();
  const qc = useQueryClient();

  const { data: requests, isLoading } = useQuery<PublishRequest[]>({
    queryKey: ['publish-requests'],
    queryFn: async () => {
      const res = await fetch('/api/decks/publish-requests');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load requests');
      return json.data;
    },
    enabled: isTeacher || isAdmin,
  });

  const review = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const res = await fetch(`/api/decks/${id}/publish-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publish-requests'] }),
  });

  if (!isTeacher && !isAdmin) {
    return (
      <div className="p-8 py-24 text-center text-sm text-muted-foreground">
        This page is available to teachers and administrators.
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 md:px-10 md:py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E40AF]/8 text-[#1E40AF]">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-slate-900">Publish queue</h1>
            <p className="text-[13px] text-slate-500">Review decks students want to share publicly.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-slate-700">You&apos;re all caught up</p>
              <p className="mt-0.5 text-[12.5px] text-slate-400">No decks are waiting for review right now.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {requests.map((r) => {
                const busy = review.isPending && review.variables?.id === r.id;
                return (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                    transition={spring}
                    className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5"
                    style={{ boxShadow: '0 1px 3px 0 rgba(15,23,42,0.05)' }}
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D9488]/10 text-[#0D9488]">
                      <Layers className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-semibold text-slate-900">{r.name}</p>
                      {r.description && (
                        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-[1.5] text-slate-500">{r.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-400">
                        <span>by {r.owner_name}</span>
                        <span>·</span>
                        <span>{r.card_count} {r.card_count === 1 ? 'card' : 'cards'}</span>
                        {r.requested_at && (
                          <><span>·</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(r.requested_at)}</span></>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => review.mutate({ id: r.id, action: 'reject' })}
                        className={cn(
                          'flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[12.5px] font-semibold text-slate-600 transition-colors hover:bg-slate-50',
                          busy && 'opacity-50',
                        )}
                      >
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => review.mutate({ id: r.id, action: 'approve' })}
                        className={cn(
                          'flex h-9 items-center gap-1.5 rounded-lg bg-[#0D9488] px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#0B857A] active:scale-[0.97]',
                          busy && 'opacity-50',
                        )}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
