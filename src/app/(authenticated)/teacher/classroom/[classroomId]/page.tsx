'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Brain, Target, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { useRole } from '@/hooks/useRole';

interface Student {
  student_id: string;
  full_name: string;
  avatar_url: string | null;
  joined_at: string;
  sessions_30d: number;
  cards_reviewed_30d: number;
  accuracy_30d: number | null;
  last_studied: string | null;
}

interface ProgressData {
  classroom: { id: string; name: string };
  students: Student[];
}

function AccuracyBadge({ accuracy }: { accuracy: number | null }) {
  if (accuracy === null) return <span className="text-xs text-muted-foreground">—</span>;
  const variant = accuracy >= 80 ? 'success' : accuracy >= 60 ? 'secondary' : 'destructive';
  return <Badge variant={variant} className="text-xs">{accuracy}%</Badge>;
}

export default function ClassroomProgressPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = use(params);
  const { isTeacher } = useRole();

  const { data, isLoading } = useQuery<ProgressData>({
    queryKey: ['teacher-classroom-progress', classroomId],
    queryFn: async () => {
      const res = await fetch(`/api/teacher/classroom/${classroomId}/progress`);
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
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { classroom, students } = data;

  // Summary stats
  const totalSessions = students.reduce((s, st) => s + st.sessions_30d, 0);
  const totalCards = students.reduce((s, st) => s + st.cards_reviewed_30d, 0);
  const activeStudents = students.filter((s) => s.sessions_30d > 0).length;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href="/teacher"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
          <p className="text-sm text-muted-foreground">Student progress — last 30 days</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xl font-bold">{students.length}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xl font-bold">{totalCards.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Cards Reviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <Target className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xl font-bold">{activeStudents} / {students.length}</p>
              <p className="text-xs text-muted-foreground">Active This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Student Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students have joined yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="pb-2 text-left font-medium pr-4">Student</th>
                    <th className="pb-2 text-center font-medium px-3">Sessions</th>
                    <th className="pb-2 text-center font-medium px-3">Cards</th>
                    <th className="pb-2 text-center font-medium px-3">Accuracy</th>
                    <th className="pb-2 text-left font-medium pl-3">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => (
                    <tr key={student.student_id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 shrink-0">
                            <AvatarImage src={student.avatar_url ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {student.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground leading-tight">{student.full_name}</p>
                            <p className="text-[11px] text-muted-foreground">Joined {formatDate(student.joined_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={student.sessions_30d === 0 ? 'text-muted-foreground' : 'font-medium'}>
                          {student.sessions_30d}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={student.cards_reviewed_30d === 0 ? 'text-muted-foreground' : 'font-medium'}>
                          {student.cards_reviewed_30d.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <AccuracyBadge accuracy={student.accuracy_30d} />
                      </td>
                      <td className="py-3 pl-3 text-muted-foreground">
                        {student.last_studied ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(student.last_studied)}
                          </span>
                        ) : (
                          <span className="text-xs italic">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
