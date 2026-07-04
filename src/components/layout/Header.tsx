'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Settings, ChevronsUpDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { CommandPalette } from '@/components/search/CommandPalette';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Header() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/85 px-5 backdrop-blur-[8px]">
      <CommandPalette />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none"
            aria-label="User menu"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url ?? user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(profile?.full_name ?? user?.email ?? null)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block max-w-[120px] truncate">
              {profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'User'}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className={cn(
              'z-50 min-w-[200px] rounded-xl border border-border bg-white p-1.5 shadow-lg',
              'data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out'
            )}
          >
            <div className="px-3 py-2 mb-0.5">
              <p className="text-sm font-semibold text-foreground">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
            </div>

            <div className="h-px bg-border my-1" />

            <DropdownMenu.Item asChild>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-muted cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenu.Item>

            <div className="h-px bg-border my-1" />

            <DropdownMenu.Item
              onSelect={async () => { await signOut(); router.push('/auth/login'); }}
              className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
