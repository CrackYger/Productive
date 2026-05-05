import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../utils/env';

const SUPABASE_TIMEOUT_MS = 8000;

const hasRealValue = (value: string, placeholder: string) =>
  Boolean(value && !value.includes(placeholder));

const fetchWithTimeout: typeof fetch = async (input, init = {}) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  const externalSignal = init.signal;

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
};

export const isSupabaseConfigured =
  hasRealValue(SUPABASE_URL, 'your-project') &&
  hasRealValue(SUPABASE_ANON_KEY, 'your-anon-key');

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
      global: {
        fetch: fetchWithTimeout,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase ist noch nicht konfiguriert.');
  }

  return supabase;
}
