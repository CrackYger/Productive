import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';
import type { AbsenceEntry, GradeEntry, HomeworkEntry } from '../types';

interface HwRow  { id: string; subject_id: string; title: string; due_date: string | null; done: boolean; }
interface GrRow  { id: string; subject_id: string; label: string; grade: number | string; type: string; date: string; }
interface AbRow  { id: string; subject_id: string; date: string; hours: number; excused: boolean; }

const mapHw  = (r: HwRow):  HomeworkEntry => ({ id: r.id, subject_id: r.subject_id, title: r.title, due_date: r.due_date ?? undefined, done: r.done });
const mapGr  = (r: GrRow):  GradeEntry   => ({ id: r.id, subject_id: r.subject_id, label: r.label, grade: typeof r.grade === 'string' ? parseFloat(r.grade) : r.grade, type: r.type as 'exam' | 'quarterly', date: r.date });
const mapAbs = (r: AbRow):  AbsenceEntry => ({ id: r.id, subject_id: r.subject_id, date: r.date, hours: r.hours, excused: r.excused });

export function useSubjectDetails(subjectId: string | null) {
  const { user } = useAuth();
  const [homework, setHomework]   = useState<HomeworkEntry[]>([]);
  const [grades,   setGrades]     = useState<GradeEntry[]>([]);
  const [absences, setAbsences]   = useState<AbsenceEntry[]>([]);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId || !user) {
      setHomework([]); setGrades([]); setAbsences([]);
      return;
    }

    setLoading(true);
    setError(null);

    const db = requireSupabase();
    Promise.all([
      db.from('productive_homework').select('id,subject_id,title,due_date,done').eq('subject_id', subjectId).order('created_at', { ascending: true }),
      db.from('productive_grades').select('id,subject_id,label,grade,type,date').eq('subject_id', subjectId).order('date', { ascending: false }),
      db.from('productive_absences').select('id,subject_id,date,hours,excused').eq('subject_id', subjectId).order('date', { ascending: false }),
    ])
      .then(([hw, gr, ab]) => {
        if (hw.error) throw hw.error;
        if (gr.error) throw gr.error;
        if (ab.error) throw ab.error;
        setHomework(((hw.data ?? []) as HwRow[]).map(mapHw));
        setGrades(((gr.data ?? []) as GrRow[]).map(mapGr));
        setAbsences(((ab.data ?? []) as AbRow[]).map(mapAbs));
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [subjectId, user]);

  // ─── Homework ──────────────────────────────────────────────────────────────

  const addHomework = useCallback(async (title: string, dueDate?: string) => {
    if (!subjectId || !user) return;
    const db = requireSupabase();
    const id = crypto.randomUUID();
    const entry: HomeworkEntry = { id, subject_id: subjectId, title, due_date: dueDate, done: false };
    setHomework(items => [...items, entry]);
    try {
      const { error: e } = await db.from('productive_homework').insert({ id, user_id: user.id, subject_id: subjectId, title, due_date: dueDate ?? null, done: false });
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hausaufgabe konnte nicht gespeichert werden.');
      setHomework(items => items.filter(h => h.id !== id));
    }
  }, [subjectId, user]);

  const toggleHomework = useCallback(async (id: string) => {
    const current = homework.find(h => h.id === id);
    if (!current || !user) return;
    const next = { ...current, done: !current.done };
    setHomework(items => items.map(h => h.id === id ? next : h));
    try {
      const db = requireSupabase();
      const { error: e } = await db.from('productive_homework').update({ done: next.done }).eq('id', id).eq('user_id', user.id);
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konnte nicht gespeichert werden.');
      setHomework(items => items.map(h => h.id === id ? current : h));
    }
  }, [homework, user]);

  const removeHomework = useCallback(async (id: string) => {
    const current = homework.find(h => h.id === id);
    if (!current || !user) return;
    setHomework(items => items.filter(h => h.id !== id));
    try {
      const db = requireSupabase();
      const { error: e } = await db.from('productive_homework').delete().eq('id', id).eq('user_id', user.id);
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konnte nicht gelöscht werden.');
      setHomework(items => [...items, current]);
    }
  }, [homework, user]);

  // ─── Grades ────────────────────────────────────────────────────────────────

  const addGrade = useCallback(async (label: string, grade: number, type: 'exam' | 'quarterly', date: string) => {
    if (!subjectId || !user) return;
    const db = requireSupabase();
    const id = crypto.randomUUID();
    const entry: GradeEntry = { id, subject_id: subjectId, label, grade, type, date };
    setGrades(items => [entry, ...items]);
    try {
      const { error: e } = await db.from('productive_grades').insert({ id, user_id: user.id, subject_id: subjectId, label, grade, type, date });
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Note konnte nicht gespeichert werden.');
      setGrades(items => items.filter(g => g.id !== id));
    }
  }, [subjectId, user]);

  const removeGrade = useCallback(async (id: string) => {
    const current = grades.find(g => g.id === id);
    if (!current || !user) return;
    setGrades(items => items.filter(g => g.id !== id));
    try {
      const db = requireSupabase();
      const { error: e } = await db.from('productive_grades').delete().eq('id', id).eq('user_id', user.id);
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Note konnte nicht gelöscht werden.');
      setGrades(items => [...items, current]);
    }
  }, [grades, user]);

  // ─── Absences ──────────────────────────────────────────────────────────────

  const addAbsence = useCallback(async (date: string, hours: number) => {
    if (!subjectId || !user) return;
    const db = requireSupabase();
    const id = crypto.randomUUID();
    const entry: AbsenceEntry = { id, subject_id: subjectId, date, hours, excused: false };
    setAbsences(items => [entry, ...items]);
    try {
      const { error: e } = await db.from('productive_absences').insert({ id, user_id: user.id, subject_id: subjectId, date, hours, excused: false });
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehlstunde konnte nicht gespeichert werden.');
      setAbsences(items => items.filter(a => a.id !== id));
    }
  }, [subjectId, user]);

  const toggleAbsenceExcused = useCallback(async (id: string) => {
    const current = absences.find(a => a.id === id);
    if (!current || !user) return;
    const next = { ...current, excused: !current.excused };
    setAbsences(items => items.map(a => a.id === id ? next : a));
    try {
      const db = requireSupabase();
      const { error: e } = await db.from('productive_absences').update({ excused: next.excused }).eq('id', id).eq('user_id', user.id);
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konnte nicht gespeichert werden.');
      setAbsences(items => items.map(a => a.id === id ? current : a));
    }
  }, [absences, user]);

  const removeAbsence = useCallback(async (id: string) => {
    const current = absences.find(a => a.id === id);
    if (!current || !user) return;
    setAbsences(items => items.filter(a => a.id !== id));
    try {
      const db = requireSupabase();
      const { error: e } = await db.from('productive_absences').delete().eq('id', id).eq('user_id', user.id);
      if (e) throw e;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konnte nicht gelöscht werden.');
      setAbsences(items => [...items, current]);
    }
  }, [absences, user]);

  return {
    homework, grades, absences, loading, error,
    addHomework, toggleHomework, removeHomework,
    addGrade, removeGrade,
    addAbsence, toggleAbsenceExcused, removeAbsence,
  };
}
