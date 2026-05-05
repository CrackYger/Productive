import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

type AuthMode = 'login' | 'register';

interface RequestCodeInput {
  email: string;
  mode: AuthMode;
  displayName?: string;
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  requestEmailCode: (input: RequestCodeInput) => Promise<void>;
  verifyEmailCode: (email: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function authNotConfiguredError() {
  return new Error('Bitte trage zuerst VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY ein.');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const requestEmailCode = useCallback(async ({ email, mode, displayName }: RequestCodeInput) => {
    if (!supabase) throw authNotConfiguredError();

    const cleanEmail = normalizeEmail(email);
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: mode === 'register',
        emailRedirectTo: window.location.origin,
        data: displayName?.trim() ? { display_name: displayName.trim() } : undefined,
      },
    });

    if (error) throw error;
  }, []);

  const verifyEmailCode = useCallback(async (email: string, token: string) => {
    if (!supabase) throw authNotConfiguredError();

    const cleanToken = token.replace(/\D/g, '');
    if (cleanToken.length !== 6) {
      throw new Error('Der Code muss genau 6 Ziffern haben.');
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: cleanToken,
      type: 'email',
    });

    if (error) throw error;
    setSession(data.session);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw authNotConfiguredError();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      requestEmailCode,
      verifyEmailCode,
      signOut,
    }),
    [loading, requestEmailCode, session, signOut, verifyEmailCode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden.');
  return ctx;
}
