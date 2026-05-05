import React, { useMemo, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { StatCard } from '../../../components/StatCard';
import { todayFormatted } from '../../../utils/date';
import { APP_VERSION } from '../../../constants/version';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useBooks } from '../../../hooks/useBooks';
import { useProfile } from '../../../hooks/useProfile';
import { useSchool } from '../../../hooks/useSchool';
import { useSettings } from '../../../hooks/useSettings';
import { useStreak } from '../../../hooks/useStreak';
import { useTasks } from '../../../hooks/useTasks';
import type { IconName } from '../../../components/Icon';
import type { UserSettings } from '../../../hooks/useSettings';

type Panel = 'account' | 'app' | 'feedback' | 'updates' | null;

interface SheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const INPUT: React.CSSProperties = {
  width: '100%',
  background: '#0e0e1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 13,
  padding: '12px 14px',
  fontSize: 16,
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const primaryButton = (accent = ACCENT): React.CSSProperties => ({
  width: '100%',
  padding: 14,
  borderRadius: 15,
  background: `linear-gradient(135deg,${accent},#008888)`,
  border: 'none',
  color: '#050508',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: `0 6px 22px ${accent}50`,
});

const Sheet: React.FC<SheetProps> = ({ title, onClose, children }) => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
    <div style={{ width: '100%', background: '#12121e', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(40px + env(safe-area-inset-bottom, 0px))', animation: 'sheetUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }} onClick={event => event.stopPropagation()}>
      <div style={{ width: 38, height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 99, margin: '0 auto 18px' }} />
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: -0.3 }}>{title}</div>
      {children}
    </div>
  </div>
);

const AccountSheet: React.FC<{
  displayName: string;
  email: string;
  onSaveName: (value: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}> = ({ displayName, email, onSaveName, onSignOut, onClose }) => {
  const [name, setName] = useState(displayName);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const save = async () => {
    setPending(true);
    setError('');
    setStatus('');
    try {
      await onSaveName(name);
      setStatus('Name gespeichert.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Name konnte nicht gespeichert werden.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet title="Account Einstellungen" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={name} onChange={event => setName(event.target.value)} placeholder="Name" style={INPUT} />
        <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
        {(status || error) && <div style={{ color: error ? '#FF7A7A' : GREEN, fontSize: 12, fontWeight: 700 }}>{error || status}</div>}
        <button type="button" disabled={pending} onClick={() => void save()} style={{ ...primaryButton(), opacity: pending ? 0.72 : 1 }}>Speichern</button>
        <button type="button" onClick={() => void onSignOut()} style={{ width: '100%', padding: 12, borderRadius: 14, background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.18)', color: '#FF5252', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Abmelden</button>
      </div>
    </Sheet>
  );
};

const AppSettingsSheet: React.FC<{
  settings: UserSettings;
  onSave: (value: Partial<UserSettings>) => Promise<void>;
  onClose: () => void;
}> = ({ settings, onSave, onClose }) => {
  const [dailyPagesGoal, setDailyPagesGoal] = useState(String(settings.dailyPagesGoal));
  const [yearlyBookGoal, setYearlyBookGoal] = useState(String(settings.yearlyBookGoal));
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [compactMode, setCompactMode] = useState(settings.compactMode);
  const [status, setStatus] = useState('');

  const save = async () => {
    const daily = Math.max(1, parseInt(dailyPagesGoal, 10) || settings.dailyPagesGoal);
    const yearly = Math.max(1, parseInt(yearlyBookGoal, 10) || settings.yearlyBookGoal);
    await onSave({ dailyPagesGoal: daily, yearlyBookGoal: yearly, notificationsEnabled, compactMode });
    setStatus('Einstellungen gespeichert.');
  };

  return (
    <Sheet title="App Einstellungen" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800 }}>Seiten pro Tag</label>
        <input value={dailyPagesGoal} onChange={event => setDailyPagesGoal(event.target.value)} type="number" min={1} inputMode="numeric" style={INPUT} />
        <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 800 }}>Bücher pro Jahr</label>
        <input value={yearlyBookGoal} onChange={event => setYearlyBookGoal(event.target.value)} type="number" min={1} inputMode="numeric" style={INPUT} />
        <button type="button" onClick={() => setNotificationsEnabled(value => !value)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderRadius: 14, background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>Erinnerungen vormerken</span>
          <span style={{ width: 42, height: 24, borderRadius: 99, background: notificationsEnabled ? ACCENT : 'rgba(255,255,255,0.12)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 3, left: notificationsEnabled ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.18s ease' }} />
          </span>
        </button>
        <button type="button" onClick={() => setCompactMode(value => !value)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 13, borderRadius: 14, background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'inherit', cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 800 }}>Kompakter Modus</span>
          <span style={{ color: compactMode ? ACCENT : 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 800 }}>{compactMode ? 'An' : 'Aus'}</span>
        </button>
        {status && <div style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>{status}</div>}
        <button type="button" onClick={() => void save()} style={primaryButton()}>Speichern</button>
      </div>
    </Sheet>
  );
};

const FeedbackSheet: React.FC<{ onSubmit: (value: string) => Promise<void>; onClose: () => void }> = ({ onSubmit, onClose }) => {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setStatus('');
    setError('');
    try {
      await onSubmit(text);
      setText('');
      setStatus('Feedback gespeichert. Danke!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feedback konnte nicht gespeichert werden.');
    }
  };

  return (
    <Sheet title="Feedback & Wünsche" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea value={text} onChange={event => setText(event.target.value)} placeholder="Was soll Productive als Nächstes besser machen?" rows={5} style={{ ...INPUT, minHeight: 120, resize: 'none', lineHeight: 1.4 }} />
        {(status || error) && <div style={{ color: error ? '#FF7A7A' : GREEN, fontSize: 12, fontWeight: 700 }}>{error || status}</div>}
        <button type="button" onClick={() => void submit()} style={primaryButton()}>Feedback senden</button>
      </div>
    </Sheet>
  );
};

const UpdatesSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Sheet title="Updateverlauf" onClose={onClose}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { title: `Version ${APP_VERSION}`, body: 'Supabase Auth, Email-Code Login, Nutzerprofil, remote gespeicherte Aufgaben, Bücher, Fächer und Streaks.' },
        { title: 'Mobile Feinschliff', body: 'Safe-Area-Abstände, Empty-States und skalierende Profilkarten für iPhone-Ansichten.' },
      ].map(item => (
        <div key={item.title} style={{ background: '#0e0e18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 13 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>{item.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, lineHeight: 1.45, marginTop: 4, fontWeight: 600 }}>{item.body}</div>
        </div>
      ))}
    </div>
  </Sheet>
);

export const ProfilScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, updateDisplayName, submitFeedback } = useProfile();
  const { settings, updateSettings } = useSettings();
  const { tasks } = useTasks();
  const { books } = useBooks();
  const { subjects } = useSchool();
  const { streak } = useStreak();
  const [panel, setPanel] = useState<Panel>(null);

  const completedTasks = tasks.filter(task => task.done).length;
  const booksRead = books.filter(book => book.cur >= book.pages && book.pages > 0).length;
  const xp = completedTasks * 10 + booksRead * 120 + streak * 25;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const nextLevelXp = level * 500 - xp;

  const averageGrade = subjects.length ? subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length : 6;
  const achievements = useMemo(() => [
    { name: 'Erstes Buch', icon: 'book' as IconName, earned: books.length > 0 },
    { name: '7-Tage-Serie', icon: 'fire' as IconName, earned: streak >= 7 },
    { name: '50 Aufgaben', icon: 'check' as IconName, earned: completedTasks >= 50 },
    { name: 'Schnitt < 2', icon: 'medal' as IconName, earned: averageGrade < 2 },
    { name: '30-Tage-Serie', icon: 'bolt' as IconName, earned: streak >= 30 },
    { name: '10 Bücher', icon: 'target' as IconName, earned: booksRead >= 10 },
  ], [averageGrade, books.length, booksRead, completedTasks, streak]);

  const stats: { label: string; value: string; icon: IconName; color: string }[] = [
    { label: 'Aufgaben', value: String(completedTasks), icon: 'check', color: GREEN },
    { label: 'Bücher', value: String(booksRead), icon: 'book', color: ACCENT },
    { label: 'Serie', value: `${streak}T`, icon: 'fire', color: '#FF6B2B' },
    { label: 'Punkte', value: String(xp), icon: 'star', color: '#FFD700' },
  ];

  const settingsRows: { label: string; icon: IconName; panel: Panel }[] = [
    { label: 'Account Einstellungen', icon: 'person', panel: 'account' },
    { label: 'App Einstellungen', icon: 'settings', panel: 'app' },
    { label: 'Feedback & Wünsche', icon: 'bell', panel: 'feedback' },
    { label: 'Updateverlauf', icon: 'clock', panel: 'updates' },
  ];

  const displayName = profile?.displayName ?? (profileLoading ? 'Lädt...' : 'Productive User');
  const email = profile?.email ?? '';

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
      <div style={{ padding: 'max(50px, env(safe-area-inset-top)) 18px 0', animation: 'fadeDown 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.8 }}>Profil</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{todayFormatted()}</div>
      </div>

      <div style={{ padding: '12px 18px 0', animation: 'fadeUp 0.42s 0.07s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ background: `linear-gradient(135deg,${ACCENT}d0,#006060)`, borderRadius: 18, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${ACCENT}52`, boxShadow: `0 6px 28px ${ACCENT}35` }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="school" size={27} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Produktiver Schüler</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.4, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>Stufe {level} · {xp} XP</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>XP BIS LEVEL {level + 1}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{nextLevelXp}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '10px 18px 0', animation: 'fadeUp 0.42s 0.12s cubic-bezier(0.22,1,0.36,1) both' }}>
        {stats.map((stat, index) => (
          <div key={stat.label} style={{ animation: `popIn 0.4s ${0.12 + 0.05 * index}s cubic-bezier(0.22,1,0.36,1) both` }}>
            <StatCard icon={stat.icon} value={stat.value} label={stat.label} color={stat.color} radius={CARD_RADIUS - 6} />
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 18px 0', animation: 'fadeUp 0.42s 0.17s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Trophäen</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {achievements.map((achievement, index) => (
            <div key={achievement.name} style={{ background: achievement.earned ? `${ACCENT}12` : '#0e0e18', borderRadius: CARD_RADIUS - 6, padding: '13px 8px', textAlign: 'center', border: `1px solid ${achievement.earned ? `${ACCENT}2e` : 'rgba(255,255,255,0.04)'}`, opacity: achievement.earned ? 1 : 0.32, animation: `popIn 0.38s ${0.18 + 0.04 * index}s cubic-bezier(0.22,1,0.36,1) both` }}>
              <Icon name={achievement.icon} size={22} color={achievement.earned ? ACCENT : 'rgba(255,255,255,0.28)'} />
              <div style={{ fontSize: 9, color: achievement.earned ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.28)', fontWeight: 700, marginTop: 6, lineHeight: 1.3 }}>{achievement.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 18px 0', animation: 'fadeUp 0.42s 0.22s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Einstellungen</div>
        <div style={{ background: '#12121e', borderRadius: CARD_RADIUS, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          {settingsRows.map((item, index) => (
            <button key={item.label}
              type="button"
              onClick={() => setPanel(item.panel)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: 'none', borderBottom: index < settingsRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', background: 'transparent', textAlign: 'left', fontFamily: 'inherit' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 11, background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={item.icon} size={16} color={ACCENT} />
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>{item.label}</div>
              <Icon name="chevron" size={16} color="rgba(255,255,255,0.16)" />
            </button>
          ))}
        </div>
      </div>

      {panel === 'account' && (
        <AccountSheet displayName={displayName} email={email} onSaveName={updateDisplayName} onSignOut={signOut} onClose={() => setPanel(null)} />
      )}
      {panel === 'app' && (
        <AppSettingsSheet settings={settings} onSave={updateSettings} onClose={() => setPanel(null)} />
      )}
      {panel === 'feedback' && (
        <FeedbackSheet onSubmit={submitFeedback} onClose={() => setPanel(null)} />
      )}
      {panel === 'updates' && <UpdatesSheet onClose={() => setPanel(null)} />}
    </div>
  );
};
