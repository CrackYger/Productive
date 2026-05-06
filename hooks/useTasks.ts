import { useCallback, useEffect, useState } from 'react';
import type { Priority, Task, TaskCategory, TaskTimeOfDay, TaskUnit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';
import { nowISO, todayISO } from '../utils/date';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: TaskCategory | null;
  done: boolean;
  due_date: string;
  unit: TaskUnit | null;
  target_amount: number | null;
  progress_amount: number | null;
  time_of_day: TaskTimeOfDay | null;
  book_id: string | null;
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
}

const mapTask = (row: TaskRow): Task => ({
  id: row.id,
  user_id: row.user_id,
  title: row.title,
  description: row.description ?? undefined,
  priority: row.priority,
  category: row.category ?? 'other',
  done: row.done,
  date: row.due_date,
  unit: row.unit ?? 'none',
  target_amount: row.target_amount ?? undefined,
  progress_amount: row.progress_amount ?? 0,
  time_of_day: row.time_of_day ?? 'any',
  book_id: row.book_id ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const TASK_COLUMNS = 'id,user_id,title,description,priority,category,done,due_date,unit,target_amount,progress_amount,time_of_day,book_id,created_at,updated_at';

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

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

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
    const current = tasks.find(task => task.id === id);
    if (!current || !user) return;

    const nextDone = !current.done;
    const updatedAt = nowISO();
    const nextProgress = nextDone && current.target_amount ? current.target_amount : current.progress_amount;

    setTasks(items => items.map(task => (task.id === id ? { ...task, done: nextDone, progress_amount: nextProgress, updated_at: updatedAt } : task)));

    try {
      await persist(id, { done: nextDone, progress_amount: nextProgress, updated_at: updatedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht gespeichert werden.');
      setTasks(items => items.map(task => (task.id === id ? current : task)));
    }
  }, [tasks, user, persist]);

  const advanceProgress = useCallback(async (id: string, amount: number) => {
    const current = tasks.find(task => task.id === id);
    if (!current || !user || amount <= 0) return;

    const target = current.target_amount;
    const nextProgress = Math.max(0, current.progress_amount + amount);
    const cappedProgress = target ? Math.min(nextProgress, target) : nextProgress;
    const nextDone = target ? cappedProgress >= target : current.done;
    const updatedAt = nowISO();

    setTasks(items => items.map(task => (task.id === id ? { ...task, progress_amount: cappedProgress, done: nextDone, updated_at: updatedAt } : task)));

    try {
      await persist(id, { progress_amount: cappedProgress, done: nextDone, updated_at: updatedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fortschritt konnte nicht gespeichert werden.');
      setTasks(items => items.map(task => (task.id === id ? current : task)));
    }
  }, [tasks, user, persist]);

  const remove = useCallback(async (id: string) => {
    const current = tasks.find(task => task.id === id);
    if (!current || !user) return;

    setTasks(items => items.filter(task => task.id !== id));

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

  const skip = useCallback(async (id: string) => {
    const current = tasks.find(task => task.id === id);
    if (!current || !user) return;

    const updatedAt = nowISO();
    setTasks(items => items.map(task => (task.id === id ? { ...task, done: true, updated_at: updatedAt } : task)));

    try {
      await persist(id, { done: true, updated_at: updatedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht übersprungen werden.');
      setTasks(items => items.map(task => (task.id === id ? current : task)));
    }
  }, [tasks, user, persist]);

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
      date: todayISO(),
      unit: input.unit,
      target_amount: input.target_amount,
      progress_amount: 0,
      time_of_day: input.time_of_day,
      book_id: input.book_id,
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
        due_date: task.date,
        unit: task.unit,
        target_amount: task.target_amount ?? null,
        progress_amount: task.progress_amount,
        time_of_day: task.time_of_day,
        book_id: task.book_id ?? null,
        created_at: task.created_at,
        updated_at: task.updated_at,
      });

      if (insertError) throw insertError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht erstellt werden.');
      setTasks(items => items.filter(item => item.id !== task.id));
    }
  }, [user]);

  return { tasks, loading, error, toggle, advanceProgress, skip, remove, add, reload: loadTasks };
}
