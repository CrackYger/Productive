import React, { useMemo, useRef, useState } from 'react';
import { ACCENT, GREEN } from '../../../constants/theme';
import { APP_NAME } from '../../../constants/version';
import { useAuth } from '../../../contexts/AuthContext';

type AuthMode = 'login' | 'register';
type AuthStep = 'email' | 'code';

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 48,
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 14,
  background: '#0e0e1a',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: 16,
  fontWeight: 600,
  outline: 'none',
  padding: '0 14px',
};

function readableAuthError(message: string) {
  if (message.toLowerCase().includes('signup')) {
    return 'Für diese Email existiert noch kein Account. Bitte registriere dich zuerst.';
  }
  if (message.toLowerCase().includes('token')) {
    return 'Der Code ist ungültig oder abgelaufen.';
  }
  if (message.toLowerCase().includes('rate')) {
    return 'Bitte warte kurz, bevor du einen neuen Code anforderst.';
  }
  return message;
}

export const AuthScreen: React.FC = () => {
  const { configured, requestEmailCode, verifyEmailCode } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const title = mode === 'register' ? 'Account erstellen' : 'Willkommen zurück';
  const actionLabel = useMemo(() => {
    if (pending) return step === 'email' ? 'Code wird gesendet...' : 'Code wird geprüft...';
    return step === 'email' ? 'Email-Code senden' : 'Einloggen';
  }, [pending, step]);

  const submitEmail = async () => {
    setError('');
    setMessage('');

    if (!email.trim() || !email.includes('@')) {
      setError('Bitte gib eine gültige Email-Adresse ein.');
      return;
    }
    if (mode === 'register' && !displayName.trim()) {
      setError('Bitte gib deinen Namen ein.');
      return;
    }

    setPending(true);
    try {
      await requestEmailCode({ email, mode, displayName });
      setStep('code');
      setMessage('Der 6-stellige Code wurde per Email verschickt.');
      window.setTimeout(() => codeInputRef.current?.focus(), 80);
    } catch (err) {
      setError(readableAuthError(err instanceof Error ? err.message : 'Der Code konnte nicht gesendet werden.'));
    } finally {
      setPending(false);
    }
  };

  const submitCode = async () => {
    setError('');
    setMessage('');
    setPending(true);
    try {
      await verifyEmailCode(email, code);
    } catch (err) {
      setError(readableAuthError(err instanceof Error ? err.message : 'Der Code konnte nicht geprüft werden.'));
    } finally {
      setPending(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    if (step === 'email') void submitEmail();
    else void submitCode();
  };

  if (!configured) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: 'max(46px, env(safe-area-inset-top)) 18px 28px', color: '#fff' }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.8 }}>{APP_NAME}</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,0.54)', fontWeight: 600 }}>
              Supabase ist bereit verdrahtet. Es fehlen nur noch deine Projektwerte in <span style={{ color: ACCENT }}>.env</span>.
            </div>
          </div>

          <div style={{ background: '#12121e', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
            <div style={{ fontSize: 12, color: GREEN, fontWeight: 800, marginBottom: 10 }}>Setup</div>
            <pre style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.72)', fontSize: 12, lineHeight: 1.45, fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' }}>{`VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key`}</pre>
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.45, fontWeight: 600 }}>
              In Supabase unter Authentication &gt; Email Templates muss die Vorlage den Platzhalter <span style={{ color: ACCENT }}>{'{{ .Token }}'}</span> enthalten, damit die Email einen 6-stelligen Code sendet.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'max(42px, env(safe-area-inset-top)) 18px 26px', color: '#fff' }}>
      <form onSubmit={submit} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <div>
          <div style={{ width: 54, height: 54, borderRadius: 18, background: `linear-gradient(135deg,${ACCENT},#008888)`, boxShadow: `0 8px 30px ${ACCENT}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#050508', fontWeight: 900, fontSize: 22 }}>
            P
          </div>
          <div style={{ marginTop: 22, fontSize: 30, lineHeight: 1, fontWeight: 800, letterSpacing: -1 }}>{title}</div>
          <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,0.52)', fontWeight: 600 }}>
            {step === 'email' ? 'Melde dich per Email an. Beim Registrieren bekommst du einen 6-stelligen Code.' : `Code für ${email.trim().toLowerCase()} eingeben.`}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#10101b', padding: 4, borderRadius: 15, border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['login', 'register'] as AuthMode[]).map(option => (
            <button
              type="button"
              key={option}
              onClick={() => {
                setMode(option);
                setStep('email');
                setCode('');
                setError('');
                setMessage('');
              }}
              style={{ height: 40, borderRadius: 12, border: 'none', background: mode === option ? `linear-gradient(135deg,${ACCENT},#008888)` : 'transparent', color: mode === option ? '#050508' : 'rgba(255,255,255,0.48)', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              {option === 'login' ? 'Login' : 'Registrieren'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'register' && step === 'email' && (
            <input
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              placeholder="Dein Name"
              autoComplete="name"
              style={inputStyle}
            />
          )}
          <input
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Email-Adresse"
            autoComplete="email"
            inputMode="email"
            disabled={step === 'code'}
            style={{ ...inputStyle, opacity: step === 'code' ? 0.6 : 1 }}
          />
          {step === 'code' && (
            <input
              ref={codeInputRef}
              value={code}
              onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              style={{ ...inputStyle, height: 58, textAlign: 'center', fontSize: 28, letterSpacing: 8, fontWeight: 800 }}
            />
          )}
        </div>

        {(error || message) && (
          <div style={{ borderRadius: 14, padding: '11px 13px', background: error ? 'rgba(255,82,82,0.1)' : 'rgba(61,220,132,0.1)', border: `1px solid ${error ? 'rgba(255,82,82,0.22)' : 'rgba(61,220,132,0.22)'}`, color: error ? '#FF7A7A' : GREEN, fontSize: 12, lineHeight: 1.35, fontWeight: 700 }}>
            {error || message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="submit"
            disabled={pending}
            style={{ width: '100%', minHeight: 50, borderRadius: 16, border: 'none', background: `linear-gradient(135deg,${ACCENT},#008888)`, color: '#050508', fontFamily: 'inherit', fontSize: 15, fontWeight: 900, cursor: pending ? 'default' : 'pointer', boxShadow: `0 8px 26px ${ACCENT}45`, opacity: pending ? 0.75 : 1 }}
          >
            {actionLabel}
          </button>
          {step === 'code' && (
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
                setMessage('');
              }}
              style={{ width: '100%', minHeight: 42, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: '#10101b', color: 'rgba(255,255,255,0.62)', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
            >
              Email ändern oder Code neu senden
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
