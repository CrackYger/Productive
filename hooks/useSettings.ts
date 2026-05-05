import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';

export interface UserSettings {
  dailyPagesGoal: number;
  yearlyBookGoal: number;
  notificationsEnabled: boolean;
  compactMode: boolean;
}

interface SettingsRow {
  daily_pages_goal: number;
  yearly_book_goal: number;
  notifications_enabled: boolean;
  compact_mode: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  dailyPagesGoal: 12,
  yearlyBookGoal: 12,
  notificationsEnabled: false,
  compactMode: false,
};

const mapSettings = (row: SettingsRow): UserSettings => ({
  dailyPagesGoal: row.daily_pages_goal,
  yearlyBookGoal: row.yearly_book_goal,
  notificationsEnabled: row.notifications_enabled,
  compactMode: row.compact_mode,
});

const toRow = (settings: Partial<UserSettings>) => ({
  ...(settings.dailyPagesGoal !== undefined ? { daily_pages_goal: settings.dailyPagesGoal } : {}),
  ...(settings.yearlyBookGoal !== undefined ? { yearly_book_goal: settings.yearlyBookGoal } : {}),
  ...(settings.notificationsEnabled !== undefined ? { notifications_enabled: settings.notificationsEnabled } : {}),
  ...(settings.compactMode !== undefined ? { compact_mode: settings.compactMode } : {}),
});

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = requireSupabase();
      const { data, error: queryError } = await db
        .from('productive_settings')
        .select('daily_pages_goal,yearly_book_goal,notifications_enabled,compact_mode')
        .eq('user_id', user.id)
        .maybeSingle();

      if (queryError) throw queryError;

      if (data) {
        setSettings(mapSettings(data as SettingsRow));
        return;
      }

      const { data: inserted, error: insertError } = await db
        .from('productive_settings')
        .insert({
          user_id: user.id,
          daily_pages_goal: DEFAULT_SETTINGS.dailyPagesGoal,
          yearly_book_goal: DEFAULT_SETTINGS.yearlyBookGoal,
          notifications_enabled: DEFAULT_SETTINGS.notificationsEnabled,
          compact_mode: DEFAULT_SETTINGS.compactMode,
        })
        .select('daily_pages_goal,yearly_book_goal,notifications_enabled,compact_mode')
        .single();

      if (insertError) throw insertError;
      setSettings(mapSettings(inserted as SettingsRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Einstellungen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    if (!user) return;

    const nextSettings = { ...settings, ...patch };
    setSettings(nextSettings);

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_settings')
        .upsert({ user_id: user.id, ...toRow(patch) }, { onConflict: 'user_id' });

      if (updateError) throw updateError;
    } catch (err) {
      setSettings(settings);
      setError(err instanceof Error ? err.message : 'Einstellungen konnten nicht gespeichert werden.');
    }
  }, [settings, user]);

  return { settings, loading, error, updateSettings, reload: loadSettings };
}
