'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Settings, ChevronsUpDown, Menu, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { CommandPalette } from '@/components/search/CommandPalette';
import { SidebarContent } from '@/components/layout/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

/* ─── Mobile drawer ─────────────────────────────────
   Slide-out nav for < md. Same SidebarContent as the
   desktop aside — one nav, two containers.           */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Close on route change (back/forward) and lock body scroll while open
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-slate-950/40 backdrop-blur-[2px] md:hidden"
            aria-hidden
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed inset-y-0 left-0 z-[71] w-[280px] max-w-[85vw] shadow-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="relative h-full">
              <SidebarContent onNavigate={onClose} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Header() {
  const { profile, user, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4 md:px-5">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={drawerOpen}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-muted md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <CommandPalette />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none"
            aria-label="User menu"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url ?? user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {getInitials(profile?.full_name ?? user?.email ?? null)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[120px] truncate sm:block">
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
            <div className="mb-0.5 px-3 py-2">
              <p className="text-sm font-semibold text-foreground">{profile?.full_name ?? 'User'}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>

            <div className="my-1 h-px bg-border" />

            <DropdownMenu.Item asChild>
              <Link
                href="/settings"
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-muted"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenu.Item>

            <div className="my-1 h-px bg-border" />

            <DropdownMenu.Item
              onSelect={async () => { await signOut(); router.push('/auth/login'); }}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
