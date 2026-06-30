'use client';

import Link from 'next/link';
import {
  Users, BookOpen, GraduationCap, TrendingUp,
  BarChart3, Hash, ArrowRight, Brain, Globe, Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';

interface TeacherStats {
  classrooms: Array<{
    id: string;
    name: string;
    classroom_code: string;
    created_at: string;
    student_classroom_memberships: { count: number }[];
  }>;
  totalStudents: number;
  decks: Array<{ id: string; name: string; card_count: number; is_public: boolean; updated_at: string }>;
  recentSessions: Array<{
    id: string;
    started_at: string;
    cards_reviewed: number;
    correct_count: number;
    decks: { name: string } | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  }>;
  totalCardsReviewed: number;
  overallAccuracy: number | null;
}

function StatTile({ label, value, icon: Icon, color = 'text-primary' }: {
  label: string; value: string | number; icon: React.ElementType; color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4 flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 p-3 shrink-0">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeacherDashboardPage() {
  const { isTeacher } = useRole();

  const { data: stats, isLoading } = useQuery<TeacherStats>({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/stats');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: isTeacher,
  });

  if (!isTeacher) {
    return (
      <div className="p-6 md:p-8 text-center py-24">
        <p className="text-muted-foreground">This page is for teachers only.</p>
        <Button asChild variant="outline" className="mt-4"><Link href="/dashboard">Go to Dashboard</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Teacher Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your classrooms and student activity</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Classrooms" value={stats.classrooms.length} icon={GraduationCap} />
        <StatTile label="Total Students" value={stats.totalStudents} icon={Users} />
        <StatTile label="Cards Reviewed" value={stats.totalCardsReviewed.toLocaleString()} icon={Brain} />
        <StatTile
          label="Overall Accuracy"
          value={stats.overallAccuracy !== null ? `${stats.overallAccuracy}%` : '—'}
          icon={TrendingUp}
          color={
            stats.overallAccuracy === null ? 'text-muted-foreground'
            : stats.overallAccuracy >= 70 ? 'text-green-600'
            : 'text-orange-500'
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Classrooms */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              My Classrooms
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/classrooms">View all</Link>
            </Button>
          </div>
          {stats.classrooms.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No classrooms yet. <Link href="/classrooms" className="text-primary hover:underline">Create one →</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stats.classrooms.map((c) => {
                const count = c.student_classroom_memberships?.[0]?.count ?? 0;
                return (
                  <Link key={c.id} href={`/teacher/classroom/${c.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="py-3 px-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {c.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />{count} student{count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                              <Hash className="h-3 w-3" />{c.classroom_code}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Recent Student Activity
          </h2>
          {stats.recentSessions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No study sessions yet from your students.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {stats.recentSessions.map((s) => {
                const accuracy = s.cards_reviewed > 0
                  ? Math.round((s.correct_count / s.cards_reviewed) * 100)
                  : null;
                const name = (s.profiles as { full_name: string | null } | null)?.full_name ?? 'Student';
                const avatar = (s.profiles as { avatar_url: string | null } | null)?.avatar_url ?? undefined;
                const deckName = (s.decks as { name: string } | null)?.name ?? 'Unknown deck';
                return (
                  <Card key={s.id}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="text-xs">
                          {name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {deckName} · {s.cards_reviewed} cards · {formatDate(s.started_at)}
                        </p>
                      </div>
                      {accuracy !== null && (
                        <Badge variant={accuracy >= 70 ? 'success' : 'secondary'} className="shrink-0 text-xs">
                          {accuracy}%
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* My decks summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            My Decks
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/decks">View all</Link>
          </Button>
        </div>
        {stats.decks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No decks yet. <Link href="/decks" className="text-primary hover:underline">Create one →</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.decks.map((deck) => (
              <Link key={deck.id} href={`/decks/${deck.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {deck.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{deck.card_count} cards · {formatDate(deck.updated_at)}</p>
                    </div>
                    {deck.is_public
                      ? <Globe className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      : <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    }
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
