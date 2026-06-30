'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash, Users, BookOpen, Plus, Trash2, GraduationCap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { useRole } from '@/hooks/useRole';
import { useDecks } from '@/features/decks/hooks';

interface ClassroomDetail {
  id: string;
  name: string;
  description: string | null;
  classroom_code: string;
  teacher_id: string;
  profiles: { full_name: string | null; avatar_url: string | null };
  student_classroom_memberships: Array<{
    student_id: string;
    joined_at: string;
    profiles: { full_name: string | null; avatar_url: string | null };
  }>;
  classroom_deck_shares: Array<{
    deck_id: string;
    created_at: string;
    decks: { id: string; name: string; card_count: number };
  }>;
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params);
  const { isTeacher } = useRole();
  const qc = useQueryClient();

  const { data: classroom, isLoading } = useQuery<ClassroomDetail>({
    queryKey: ['classroom', classroomId],
    queryFn: async () => {
      const res = await fetch(`/api/classrooms/${classroomId}`);
      const json = await res.json();
      return json.data;
    },
  });

  const { data: myDecks = [] } = useDecks();

  // Share deck dialog
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('');

  const shareMutation = useMutation({
    mutationFn: async (deck_id: string) => {
      const res = await fetch(`/api/classrooms/${classroomId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classroom', classroomId] });
      setShareOpen(false);
      setSelectedDeckId('');
    },
  });

  const unshareMutation = useMutation({
    mutationFn: async (deck_id: string) => {
      await fetch(`/api/classrooms/${classroomId}/share?deck_id=${deck_id}`, { method: 'DELETE' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classroom', classroomId] }),
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="p-6 md:p-8 text-center py-24">
        <p className="text-muted-foreground">Classroom not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link href="/classrooms">Back</Link></Button>
      </div>
    );
  }

  const sharedDeckIds = new Set(classroom.classroom_deck_shares.map((s) => s.deck_id));
  const availableDecks = myDecks.filter((d) => !sharedDeckIds.has(d.id));

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0">
          <Link href="/classrooms"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
          {classroom.description && (
            <p className="text-sm text-muted-foreground mt-1">{classroom.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {isTeacher && (
              <div className="flex items-center gap-1.5 text-sm font-mono bg-muted rounded-md px-2 py-1">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold tracking-widest">{classroom.classroom_code}</span>
                <span className="text-xs text-muted-foreground ml-1">— share this with students</span>
              </div>
            )}
          </div>
        </div>
        {isTeacher && (
          <Button onClick={() => setShareOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Share deck
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Shared Decks */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Shared Decks
            <Badge variant="secondary">{classroom.classroom_deck_shares.length}</Badge>
          </h2>
          {classroom.classroom_deck_shares.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {isTeacher ? 'Share a deck with this classroom to get started.' : 'No decks shared yet.'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {classroom.classroom_deck_shares.map((share) => (
                <Card key={share.deck_id} className="group">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{share.decks.name}</p>
                      <p className="text-xs text-muted-foreground">{share.decks.card_count} cards</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/study?deck=${share.deck_id}`}>
                          <GraduationCap className="h-3.5 w-3.5 mr-1" />Study
                        </Link>
                      </Button>
                      {isTeacher && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => unshareMutation.mutate(share.deck_id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Students */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Students
            <Badge variant="secondary">{classroom.student_classroom_memberships.length}</Badge>
          </h2>
          {classroom.student_classroom_memberships.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No students have joined yet. Share the code <strong>{classroom.classroom_code}</strong> with them.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {classroom.student_classroom_memberships.map((m) => (
                <Card key={m.student_id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={m.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(m.profiles?.full_name ?? null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {m.profiles?.full_name ?? 'Unknown'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share deck dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share a deck</DialogTitle>
            <DialogDescription>
              Choose one of your decks to share with students in this classroom.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableDecks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                All your decks are already shared, or you have no decks yet.
              </p>
            ) : (
              availableDecks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedDeckId === deck.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <p className="font-medium text-sm text-foreground">{deck.name}</p>
                  <p className="text-xs text-muted-foreground">{deck.card_count} cards</p>
                </button>
              ))
            )}
          </div>
          {shareMutation.error && (
            <p className="text-sm text-destructive">{shareMutation.error.message}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedDeckId && shareMutation.mutate(selectedDeckId)}
              isLoading={shareMutation.isPending}
              disabled={!selectedDeckId}
            >
              Share deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
