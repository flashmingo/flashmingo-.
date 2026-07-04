'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Shield, Calendar, Trophy, LogOut,
  CheckCircle2, Lock,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Switch } from '@/components/ui/Switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/types';

interface Props {
  profile: Profile | null;
  email: string;
}

const roleVariant: Record<string, 'default' | 'secondary' | 'success'> = {
  administrator: 'default',
  teacher:       'success',
  student:       'secondary',
};

function SettingRow({
  icon: Icon, label, children,
}: {
  icon: React.ElementType; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export function SettingsClient({ profile, email }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [optedIn, setOptedIn] = useState(profile?.leaderboard_opt_in ?? false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const initials = (profile?.full_name ?? 'U')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const leaderboardMutation = useMutation({
    mutationFn: async (value: boolean) => {
      const res = await fetch('/api/leaderboard', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update');
      return value;
    },
    onMutate: (value) => setOptedIn(value),
    onError: () => setOptedIn(!optedIn), // revert
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
  });

  const handleSignOut = async () => {
    setSignOutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleDeleteData = async () => {
    setDeleteLoading(true);
    setDeleteMessage(null);

    try {
      const res = await fetch('/api/account/delete-data', { method: 'POST' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? 'Unable to delete data.');
      setDeleteMessage('Your deletion request has been submitted.');
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : 'Unable to delete data.');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile header */}
      <div className="rounded-xl border border-border bg-white p-5 flex items-center gap-4 shadow-card">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{profile?.full_name ?? 'Unknown user'}</p>
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant={roleVariant[profile?.role ?? 'student'] ?? 'secondary'} className="capitalize">
              {profile?.role ?? 'student'}
            </Badge>
            <Badge
              variant={profile?.account_status === 'approved' ? 'success' : 'warning'}
              className="capitalize"
            >
              {profile?.account_status ?? 'pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-border bg-white px-5 shadow-card">
        <h2 className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </h2>
        <SettingRow icon={User} label="Full name">
          {profile?.full_name ?? '—'}
        </SettingRow>
        <SettingRow icon={Mail} label="Email">
          {email}
        </SettingRow>
        <SettingRow icon={Shield} label="Role">
          <span className="capitalize">{profile?.role ?? '—'}</span>
        </SettingRow>
        <SettingRow icon={Calendar} label="Member since">
          {profile?.created_at ? formatDate(profile.created_at) : '—'}
        </SettingRow>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-border bg-white px-5 shadow-card">
        <h2 className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Preferences
        </h2>
        <div className="flex items-center justify-between py-3.5 border-b border-border">
          <div className="flex items-start gap-2.5">
            <Trophy className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Appear on leaderboard</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show your name and score on the district leaderboard
              </p>
            </div>
          </div>
          <Switch
            checked={optedIn}
            onCheckedChange={(v) => leaderboardMutation.mutate(v)}
            disabled={leaderboardMutation.isPending}
          />
        </div>
        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Authentication</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Signed in via Google Workspace for Education
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active
          </span>
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-xl border border-border bg-white px-5 py-4 shadow-card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Privacy &amp; Compliance
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          FlashMingo only collects data provided through your school&apos;s Google Workspace.
          No personal data is sold or shared with third parties. Student data is protected
          under <strong className="text-foreground">FERPA</strong>.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-primary underline-offset-4 hover:underline">Terms of Service</Link>
        </div>
      </div>

      {/* Account actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deleteLoading}
        >
          {deleteLoading ? 'Processing…' : 'Delete my data'}
        </Button>
        {deleteMessage ? <p className="text-sm text-muted-foreground">{deleteMessage}</p> : null}
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={handleSignOut}
          disabled={signOutLoading}
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          {signOutLoading ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      {/* Sign out */}
      <div className="flex justify-end pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={handleSignOut}
          disabled={signOutLoading}
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          {signOutLoading ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Request account data deletion"
        description="This submits a FERPA deletion request for your account. Your decks, cards, study history, and progress will be permanently removed. This cannot be undone."
        confirmLabel="Request deletion"
        typeToConfirm="DELETE"
        loading={deleteLoading}
        onConfirm={handleDeleteData}
      />
    </div>
  );
}
