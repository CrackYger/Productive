import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';
import { todayISO } from '../utils/date';

interface ActivityRow {
  activity_date: string;
}

function prevDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const today = todayISO();
  const start = unique[0] === today ? today : unique[0] === prevDay(today) ? unique[0] : null;
  if (!start) return 0;

  let count = 0;
  let check = start;
  for (const d of unique) {
    if (d === check) {
      count += 1;
      check = prevDay(check);
    } else if (d < check) {
      break;
    }
  }

  return count;
}

export function useStreak() {
  const { user } = useAuth();
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDates = useCallback(async () => {
    if (!user) {
      setDates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = requireSupabase();
      const { data, error: queryError } = await db
        .from('productive_activity_days')
        .select('activity_date')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (queryError) throw queryError;
      setDates(((data ?? []) as ActivityRow[]).map(row => row.activity_date));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Serie konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDates();
  }, [loadDates]);

  const markToday = useCallback(async () => {
    if (!user) return;

    const today = todayISO();
    setDates(items => (items.includes(today) ? items : [...items, today]));

    try {
      const db = requireSupabase();
      const { error: upsertError } = await db
        .from('productive_activity_days')
        .upsert(
          { user_id: user.id, activity_date: today },
          { onConflict: 'user_id,activity_date', ignoreDuplicates: true },
        );

      if (upsertError) throw upsertError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Serie konnte nicht gespeichert werden.');
      setDates(items => items.filter(item => item !== today));
    }
  }, [user]);

  return { streak: calcStreak(dates), loading, error, markToday, reload: loadDates };
}
