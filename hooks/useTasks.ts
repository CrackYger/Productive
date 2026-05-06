import { useCallback, useEffect, useState } from 'react';
import type { Priority, Task, TaskCategory, TaskRecurrence, TaskTimeOfDay, TaskUnit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';
import { nowISO, todayISO } from '../utils/date';
import { isEffectiveDone } from '../utils/tasks';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: TaskCategory | null;
  done: boolean;
  skipped: boolean | null;
  due_date: string;
  unit: TaskUnit | null;
  target_amount: number | null;
  progress_amount: number | null;
  time_of_day: TaskTimeOfDay | null;
  book_id: string | null;
  recurrence: TaskRecurrence | null;
  recurrence_days: number[] | null;
  last_completed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddInput {
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  unit: TaskUnit;
  target_amount?: number;
  time_of_day: TaskTimeOfDay;
  book_id?: string;
  recurrence: TaskRecurrence;
  recurrence_days: number[];
}

const mapTask = (row: TaskRow): Task => ({
  id: row.id,
  user_id: row.user_id,
  title: row.title,
  description: row.description ?? undefined,
  priority: row.priority,
  category: row.category ?? 'other',
  done: row.done,
  skipped: row.skipped ?? false,
  date: row.due_date,
  unit: row.unit ?? 'none',
  target_amount: row.target_amount ?? undefined,
  progress_amount: row.progress_amount ?? 0,
  time_of_day: row.time_of_day ?? 'any',
  book_id: row.book_id ?? undefined,
  recurrence: row.recurrence ?? 'none',
  recurrence_days: row.recurrence_days ?? [],
  last_completed_date: row.last_completed_date ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const TASK_COLUMNS = 'id,user_id,title,description,priority,category,done,skipped,due_date,unit,target_amount,progress_amount,time_of_day,book_id,recurrence,recurrence_days,last_completed_date,created_at,updated_at';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const db = requireSupabase();
      const { data, error: queryError } = await db
        .from('productive_tasks')
        .select(TASK_COLUMNS)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (queryError) throw queryError;
      setTasks(((data ?? []) as TaskRow[]).map(mapTask));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgaben konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const persist = useCallback(async (id: string, patch: Partial<TaskRow>) => {
    if (!user) return;
    const db = requireSupabase();
    const { error: updateError } = await db
      .from('productive_tasks')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id);
    if (updateError) throw updateError;
  }, [user]);

  const toggle = useCallback(async (id: string) => {
    const current = tasks.find(t => t.id === id);
    if (!current || !user) return;

    const updatedAt = nowISO();

    if (current.recurrence !== 'none') {
      const effectiveDone = isEffectiveDone(current);
      const nextDate = effectiveDone ? null : todayISO();
      const nextProgress = !effectiveDone && current.target_amount ? current.target_amount : current.progress_amount;
      setTasks(items => items.map(t => t.id === id ? { ...t, last_completed_date: nextDate ?? undefined, progress_amount: nextProgress, updated_at: updatedAt } : t));
      try {
        await persist(id, { last_completed_date: nextDate, progress_amount: nextProgress, updated_at: updatedAt });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Konnte nicht gespeichert werden.');
        setTasks(items => items.map(t => t.id === id ? current : t));
      }
      return;
    }

    const nextDone = !current.done;
    const nextProgress = nextDone && current.target_amount ? current.target_amount : current.progress_amount;
    setTasks(items => items.map(t => t.id === id ? { ...t, done: nextDone, skipped: false, progress_amount: nextProgress, updated_at: updatedAt } : t));
    try {
      await persist(id, { done: nextDone, skipped: false, progress_amount: nextProgress, updated_at: updatedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht gespeichert werden.');
      setTasks(items => items.map(t => t.id === id ? current : t));
    }
  }, [tasks, user, persist]);

  const advanceProgress = useCallback(async (id: string, amount: number) => {
    const current = tasks.find(t => t.id === id);
    if (!current || !user || amount <= 0) return;

    const target = current.target_amount;
    const cappedProgress = target
      ? Math.min(current.progress_amount + amount, target)
      : current.progress_amount + amount;

    // Only auto-complete if target is actually reached
    const nextDone = target ? cappedProgress >= target : current.done;
    const updatedAt = nowISO();

    setTasks(items => items.map(t => t.id === id ? { ...t, progress_amount: cappedProgress, done: nextDone, updated_at: updatedAt } : t));
    try {
      await persist(id, { progress_amount: cappedProgress, done: nextDone, updated_at: updatedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fortschritt konnte nicht gespeichert werden.');
      setTasks(items => items.map(t => t.id === id ? current : t));
    }
  }, [tasks, user, persist]);

  const skip = useCallback(async (id: string) => {
    const current = tasks.find(t => t.id === id);
    if (!current || !user) return;

    const updatedAt = nowISO();
    setTasks(items => items.map(t => t.id === id ? { ...t, skipped: true, done: false, updated_at: updatedAt } : t));
    try {
      await persist(id, { skipped: true, done: false, updated_at: updatedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht übersprungen werden.');
      setTasks(items => items.map(t => t.id === id ? current : t));
    }
  }, [tasks, user, persist]);

  const remove = useCallback(async (id: string) => {
    const current = tasks.find(t => t.id === id);
    if (!current || !user) return;

    setTasks(items => items.filter(t => t.id !== id));
    try {
      const db = requireSupabase();
      const { error: deleteError } = await db
        .from('productive_tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht gelöscht werden.');
      setTasks(items => [...items, current]);
    }
  }, [tasks, user]);

  const add = useCallback(async (input: AddInput) => {
    if (!user) return;
    const createdAt = nowISO();
    const task: Task = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title: input.title,
      description: input.description,
      priority: input.priority,
      category: input.category,
      done: false,
      skipped: false,
      date: todayISO(),
      unit: input.unit,
      target_amount: input.target_amount,
      progress_amount: 0,
      time_of_day: input.time_of_day,
      book_id: input.book_id,
      recurrence: input.recurrence,
      recurrence_days: input.recurrence_days,
      created_at: createdAt,
      updated_at: createdAt,
    };
    setTasks(items => [...items, task]);
    try {
      const db = requireSupabase();
      const { error: insertError } = await db.from('productive_tasks').insert({
        id: task.id,
        user_id: user.id,
        title: task.title,
        description: task.description ?? null,
        priority: task.priority,
        category: task.category,
        done: task.done,
        skipped: task.skipped,
        due_date: task.date,
        unit: task.unit,
        target_amount: task.target_amount ?? null,
        progress_amount: task.progress_amount,
        time_of_day: task.time_of_day,
        book_id: task.book_id ?? null,
        recurrence: task.recurrence,
        recurrence_days: task.recurrence_days,
        created_at: task.created_at,
        updated_at: task.updated_at,
      });
      if (insertError) throw insertError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht erstellt werden.');
      setTasks(items => items.filter(item => item.id !== task.id));
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, input: AddInput) => {
    const current = tasks.find(t => t.id === id);
    if (!current || !user) return;

    const updatedAt = nowISO();
    const updated: Task = {
      ...current,
      title: input.title,
      description: input.description,
      priority: input.priority,
      category: input.category,
      unit: input.unit,
      target_amount: input.target_amount,
      time_of_day: input.time_of_day,
      book_id: input.book_id,
      recurrence: input.recurrence,
      recurrence_days: input.recurrence_days,
      updated_at: updatedAt,
    };

    setTasks(items => items.map(t => t.id === id ? updated : t));
    try {
      await persist(id, {
        title: updated.title,
        description: updated.description ?? null,
        priority: updated.priority,
        category: updated.category,
        unit: updated.unit,
        target_amount: updated.target_amount ?? null,
        time_of_day: updated.time_of_day,
        book_id: updated.book_id ?? null,
        recurrence: updated.recurrence,
        recurrence_days: updated.recurrence_days,
        updated_at: updatedAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht gespeichert werden.');
      setTasks(items => items.map(t => t.id === id ? current : t));
    }
  }, [tasks, user, persist]);

  return { tasks, loading, error, toggle, advanceProgress, skip, remove, add, updateTask, reload: loadTasks };
}
