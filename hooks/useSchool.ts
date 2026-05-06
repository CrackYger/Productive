import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';

export interface SubjectEntry {
  id: string;
  name: string;
  grade: number;
  next: string;
  color: string;
  done: number;
  total: number;
}

interface SubjectRow {
  id: string;
  name: string;
  grade: number | string;
  next_event: string;
  color: string;
  done: number;
  total: number;
}

const mapSubject = (row: SubjectRow): SubjectEntry => ({
  id: row.id,
  name: row.name,
  grade: typeof row.grade === 'string' ? parseFloat(row.grade) : row.grade,
  next: row.next_event,
  color: row.color,
  done: row.done,
  total: row.total,
});

export function useSchool() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = requireSupabase();
      const { data, error: queryError } = await db
        .from('productive_subjects')
        .select('id,name,grade,next_event,color,done,total')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      setSubjects(((data ?? []) as SubjectRow[]).map(mapSubject));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Schuldaten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  const updateGrade = useCallback(async (name: string, grade: number) => {
    const current = subjects.find(subject => subject.name === name);
    if (!current || !user) return;

    setSubjects(items => items.map(subject => (subject.name === name ? { ...subject, grade } : subject)));

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_subjects')
        .update({ grade })
        .eq('id', current.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Note konnte nicht gespeichert werden.');
      setSubjects(items => items.map(subject => (subject.name === name ? current : subject)));
    }
  }, [subjects, user]);

  const updateNext = useCallback(async (name: string, next: string) => {
    const current = subjects.find(subject => subject.name === name);
    if (!current || !user) return;

    const nextEvent = next.trim() || current.next;
    setSubjects(items => items.map(subject => (subject.name === name ? { ...subject, next: nextEvent } : subject)));

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_subjects')
        .update({ next_event: nextEvent })
        .eq('id', current.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Termin konnte nicht gespeichert werden.');
      setSubjects(items => items.map(subject => (subject.name === name ? current : subject)));
    }
  }, [subjects, user]);

  const addSubject = useCallback(async (input: Omit<SubjectEntry, 'id'>) => {
    if (!user) return;

    const subject: SubjectEntry = { id: crypto.randomUUID(), ...input };
    setSubjects(items => [...items, subject]);

    try {
      const db = requireSupabase();
      const { error: insertError } = await db.from('productive_subjects').insert({
        id: subject.id,
        user_id: user.id,
        name: subject.name,
        grade: subject.grade,
        next_event: subject.next,
        color: subject.color,
        done: subject.done,
        total: subject.total,
      });

      if (insertError) throw insertError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fach konnte nicht erstellt werden.');
      setSubjects(items => items.filter(item => item.id !== subject.id));
    }
  }, [user]);

  const updateSubject = useCallback(async (id: string, patch: Partial<Omit<SubjectEntry, 'id'>>) => {
    const current = subjects.find(s => s.id === id);
    if (!current || !user) return;

    const next = { ...current, ...patch };
    setSubjects(items => items.map(s => s.id === id ? next : s));

    try {
      const db = requireSupabase();
      const dbPatch: Record<string, unknown> = {};
      if (patch.name     !== undefined) dbPatch.name       = patch.name;
      if (patch.grade    !== undefined) dbPatch.grade      = patch.grade;
      if (patch.next     !== undefined) dbPatch.next_event = patch.next;
      if (patch.color    !== undefined) dbPatch.color      = patch.color;
      if (patch.done     !== undefined) dbPatch.done       = patch.done;
      if (patch.total    !== undefined) dbPatch.total      = patch.total;

      const { error: updateError } = await db
        .from('productive_subjects')
        .update(dbPatch)
        .eq('id', id)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fach konnte nicht gespeichert werden.');
      setSubjects(items => items.map(s => s.id === id ? current : s));
    }
  }, [subjects, user]);

  const removeSubject = useCallback(async (id: string) => {
    const current = subjects.find(s => s.id === id);
    if (!current || !user) return;

    setSubjects(items => items.filter(s => s.id !== id));
    try {
      const db = requireSupabase();
      const { error: deleteError } = await db
        .from('productive_subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fach konnte nicht gelöscht werden.');
      setSubjects(items => [...items, current]);
    }
  }, [subjects, user]);

  return { subjects, loading, error, updateGrade, updateNext, addSubject, updateSubject, removeSubject, reload: loadSubjects };
}
