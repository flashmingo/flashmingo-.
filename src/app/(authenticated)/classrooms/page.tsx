'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Plus, Hash, Users, BookOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/Dialog';
import { useRole } from '@/hooks/useRole';

interface Classroom {
  id: string;
  name: string;
  description: string | null;
  classroom_code: string;
  teacher_id: string;
  is_archived: boolean;
  created_at: string;
  student_classroom_memberships?: { count: number }[] | unknown[];
}

async function fetchClassrooms(): Promise<Classroom[]> {
  const res = await fetch('/api/classrooms');
  const json = await res.json();
  return json.data ?? [];
}

export default function ClassroomsPage() {
  const { isTeacher } = useRole();
  const qc = useQueryClient();
  const { data: classrooms = [], isLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: fetchClassrooms,
  });

  // Create classroom (teachers)
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classrooms'] });
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
    },
  });

  // Join classroom (students)
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/classrooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classrooms'] });
      setJoinOpen(false);
      setJoinCode('');
      setJoinError('');
    },
    onError: (err: Error) => setJoinError(err.message),
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Classrooms
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isTeacher ? 'Manage your classrooms and share decks with students' : 'Your enrolled classrooms'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isTeacher && (
            <Button variant="outline" onClick={() => setJoinOpen(true)}>
              <Hash className="h-4 w-4 mr-2" />
              Join with code
            </Button>
          )}
          {isTeacher && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New classroom
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && classrooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No classrooms yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {isTeacher
              ? 'Create your first classroom to share decks with your students.'
              : 'Ask your teacher for a classroom code to join.'}
          </p>
          {isTeacher
            ? <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />Create classroom</Button>
            : <Button variant="outline" onClick={() => setJoinOpen(true)}><Hash className="h-4 w-4 mr-2" />Join with code</Button>
          }
        </div>
      )}

      {/* Classroom grid */}
      {!isLoading && classrooms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="group flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="flex-1 pt-5">
                <Link href={`/classrooms/${classroom.id}`}>
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {classroom.name}
                  </h3>
                  {classroom.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {classroom.description}
                    </p>
                  )}
                </Link>
                {isTeacher && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted rounded-md px-2 py-1 w-fit">
                    <Hash className="h-3 w-3" />
                    {classroom.classroom_code}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-5 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Students</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Decks</span>
                <Link href={`/classrooms/${classroom.id}`} className="ml-auto">
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    Open →
                  </Badge>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create classroom dialog (teachers) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a classroom</DialogTitle>
            <DialogDescription>Students will join using a unique code you share with them.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              createMutation.mutate({ name: newName.trim(), description: newDesc.trim() || undefined });
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Classroom name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. AP Biology Period 3" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Optional description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={2} maxLength={500} />
            </div>
            {createMutation.error && <p className="text-sm text-destructive">{createMutation.error.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending} disabled={!newName.trim()}>
                Create classroom
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join classroom dialog (students) */}
      <Dialog open={joinOpen} onOpenChange={(o) => { setJoinOpen(o); if (!o) { setJoinCode(''); setJoinError(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a classroom</DialogTitle>
            <DialogDescription>Enter the 8-character code your teacher gave you.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!joinCode.trim()) return;
              joinMutation.mutate(joinCode.trim());
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Classroom code <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. ABC12345"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                maxLength={8}
                className="font-mono tracking-widest text-center text-lg"
                autoFocus
              />
            </div>
            {joinError && <p className="text-sm text-destructive">{joinError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJoinOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={joinMutation.isPending} disabled={joinCode.length < 6}>
                Join classroom
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
