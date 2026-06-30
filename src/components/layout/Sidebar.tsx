'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Users,
  Settings,
  ShieldCheck,
  GraduationCap,
  BarChart3,
  Globe,
  Shuffle,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { FlashMingoLogo } from '@/components/brand/FlashMingoLogo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

/* ─── Nav sections ─────────────────────────────────── */
const studyNav: NavItem[] = [
  { href: '/dashboard',  label: 'Today',      icon: LayoutDashboard },
  { href: '/decks',      label: 'Decks',      icon: BookOpen },
  { href: '/classrooms', label: 'Classes',    icon: GraduationCap },
  { href: '/study',      label: 'Review',     icon: Shuffle },
];

const exploreNav: NavItem[] = [
  { href: '/browse',       label: 'Browse',      icon: Globe },
  { href: '/leaderboard',  label: 'Leaderboard', icon: Trophy },
];

const teacherNav: NavItem[] = [
  { href: '/teacher', label: 'Dashboard', icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { href: '/admin',            label: 'Overview',   icon: ShieldCheck },
  { href: '/admin/users',      label: 'Users',      icon: Users },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: BarChart3 },
];

/* ─── Individual link ─────────────────────────────── */
function NavLink({ href, label, icon: Icon, disabled }: NavItem) {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href + '/')) ||
    (href === '/teacher' && pathname.startsWith('/teacher'));

  if (disabled) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/30 cursor-not-allowed">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1">{label}</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest opacity-40">Soon</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-100',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-sidebar-foreground hover:bg-white/6 hover:text-white'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-sidebar-foreground/60')} />
      <span className="flex-1">{label}</span>
      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />}
    </Link>
  );
}

/* ─── Section header ───────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/35">
      {children}
    </p>
  );
}

/* ─── Sidebar ──────────────────────────────────────── */
export default function Sidebar() {
  const { isTeacher, isAdmin } = useRole();
  const { profile, user } = useAuth();

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'User';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className="flex h-full w-[220px] flex-col border-r border-sidebar-border"
      style={{ background: 'hsl(224 44% 11%)' }}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center px-4 border-b border-sidebar-border">
        <FlashMingoLogo showText className="h-7" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Main navigation">
        <SectionLabel>Study</SectionLabel>
        <div className="space-y-0.5">
          {studyNav.map((item) => <NavLink key={item.href} {...item} />)}
        </div>

        <SectionLabel>Explore</SectionLabel>
        <div className="space-y-0.5">
          {exploreNav.map((item) => <NavLink key={item.href} {...item} />)}
        </div>

        {isTeacher && (
          <>
            <SectionLabel>Teacher</SectionLabel>
            <div className="space-y-0.5">
              {teacherNav.map((item) => <NavLink key={item.href} {...item} />)}
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <div className="space-y-0.5">
              {adminNav.map((item) => <NavLink key={item.href} {...item} />)}
            </div>
          </>
        )}
      </nav>

      {/* Settings */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <NavLink href="/settings" label="Settings" icon={Settings} />
      </div>

      {/* User profile */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-blue-800 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-white leading-none">{displayName}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50 mt-0.5 capitalize">
              {profile?.role ?? 'Student'}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/30 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
