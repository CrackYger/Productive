import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';

export interface ProductiveProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

function fallbackName(email?: string) {
  if (!email) return 'Productive User';
  return email.split('@')[0]?.trim() || 'Productive User';
}

const mapProfile = (row: ProfileRow, email: string): ProductiveProfile => ({
  id: row.id,
  email,
  displayName: row.display_name,
  avatarUrl: row.avatar_url ?? undefined,
  createdAt: row.created_at,
});

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProductiveProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = requireSupabase();
      const email = user.email ?? '';
      const { data, error: queryError } = await db
        .from('productive_profiles')
        .select('id,display_name,avatar_url,created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (queryError) throw queryError;

      if (data) {
        setProfile(mapProfile(data as ProfileRow, email));
        return;
      }

      const displayName =
        typeof user.user_metadata.display_name === 'string' && user.user_metadata.display_name.trim()
          ? user.user_metadata.display_name.trim()
          : fallbackName(email);

      const { data: inserted, error: insertError } = await db
        .from('productive_profiles')
        .insert({ id: user.id, display_name: displayName })
        .select('id,display_name,avatar_url,created_at')
        .single();

      if (insertError) throw insertError;
      setProfile(mapProfile(inserted as ProfileRow, email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!user) return;

    const nextName = displayName.trim();
    if (!nextName) throw new Error('Der Name darf nicht leer sein.');

    const previous = profile;
    setProfile(current => (current ? { ...current, displayName: nextName } : current));

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_profiles')
        .update({ display_name: nextName })
        .eq('id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      setProfile(previous);
      throw err instanceof Error ? err : new Error('Name konnte nicht gespeichert werden.');
    }
  }, [profile, user]);

  const submitFeedback = useCallback(async (message: string) => {
    if (!user) return;

    const cleanMessage = message.trim();
    if (cleanMessage.length < 3) throw new Error('Feedback muss mindestens 3 Zeichen haben.');

    const db = requireSupabase();
    const { error: insertError } = await db
      .from('productive_feedback')
      .insert({ user_id: user.id, message: cleanMessage });

    if (insertError) throw insertError;
  }, [user]);

  return { profile, loading, error, updateDisplayName, submitFeedback, reload: loadProfile };
}
