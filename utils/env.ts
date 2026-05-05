export function getEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value) {
    if (fallback !== undefined) return fallback;
    console.warn(`[env] Missing environment variable: ${key}`);
    return '';
  }
  return value;
}

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
