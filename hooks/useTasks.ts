import { useCallback, useEffect, useState } from 'react';
import type { Priority, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';
import { nowISO, todayISO } from '../utils/date';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  done: boolean;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface AddInput {
  title: string;
  description?: string;
  priority: Priority;
}

const mapTask = (row: TaskRow): Task => ({
  id: row.id,
  user_id: row.user_id,
  title: row.title,
  description: row.description ?? undefined,
  priority: row.priority,
  done: row.done,
  date: row.due_date,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

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
        .select('id,user_id,title,description,priority,done,due_date,created_at,updated_at')
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

  const toggle = useCallback(async (id: string) => {
    const current = tasks.find(task => task.id === id);
    if (!current || !user) return;

    const nextDone = !current.done;
    const updatedAt = nowISO();
    setTasks(items => items.map(task => (task.id === id ? { ...task, done: nextDone, updated_at: updatedAt } : task)));

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_tasks')
        .update({ done: nextDone, updated_at: updatedAt })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht gespeichert werden.');
      setTasks(items => items.map(task => (task.id === id ? current : task)));
    }
  }, [tasks, user]);

  const add = useCallback(async ({ title, description, priority }: AddInput) => {
    if (!user) return;

    const createdAt = nowISO();
    const task: Task = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title,
      description,
      priority,
      done: false,
      date: todayISO(),
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
        done: task.done,
        due_date: task.date,
        created_at: task.created_at,
        updated_at: task.updated_at,
      });

      if (insertError) throw insertError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aufgabe konnte nicht erstellt werden.');
      setTasks(items => items.filter(item => item.id !== task.id));
    }
  }, [user]);

  return { tasks, loading, error, toggle, add, reload: loadTasks };
}
