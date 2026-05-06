import { todayISO } from './date';
import type { Task } from '../types';

export function isEffectiveDone(task: Task): boolean {
  if (task.skipped) return false;
  if (task.recurrence === 'none') return task.done;
  if (!task.last_completed_date) return false;

  const today = todayISO();

  if (task.recurrence === 'daily' || task.recurrence === 'weekdays') {
    return task.last_completed_date === today;
  }

  if (task.recurrence === 'weekly') {
    const last = new Date(`${task.last_completed_date}T00:00:00`);
    return (Date.now() - last.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }

  return task.done;
}

export function isScheduledToday(task: Task): boolean {
  if (task.recurrence !== 'weekdays' || task.recurrence_days.length === 0) return true;
  return task.recurrence_days.includes(new Date().getDay());
}
