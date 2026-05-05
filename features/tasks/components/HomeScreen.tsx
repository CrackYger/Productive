import React, { useState } from 'react';
import { ScoreRing } from '../../../components/ScoreRing';
import { StatCard } from '../../../components/StatCard';
import { StreakBadge } from './StreakBadge';
import { XpBanner } from './XpBanner';
import { TaskItem } from './TaskItem';
import { AddTaskModal } from './AddTaskModal';
import { useProfile } from '../../../hooks/useProfile';
import { useTasks } from '../../../hooks/useTasks';
import { useStreak } from '../../../hooks/useStreak';
import { todayFormatted } from '../../../utils/date';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';

export const HomeScreen: React.FC = () => {
  const { profile } = useProfile();
  const { tasks, loading, error, toggle, add } = useTasks();
  const { streak, markToday } = useStreak();
  const [modal, setModal] = useState(false);

  const done = tasks.filter(task => task.done).length;
  const score = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const userName = profile?.displayName ?? 'Heute';

  const handleToggle = (id: string) => {
    const task = tasks.find(item => item.id === id);
    if (task && !task.done) void markToday();
    void toggle(id);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
      <div style={{ padding: 'max(50px, env(safe-area-inset-top)) 18px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', animation: 'fadeDown 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ minWidth: 0, paddingRight: 8 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{todayFormatted()}</div>
        </div>
        <StreakBadge days={streak} />
      </div>

      <div style={{ padding: '12px 18px 0', animation: 'fadeUp 0.42s 0.07s cubic-bezier(0.22,1,0.36,1) both' }}>
        <XpBanner accent={ACCENT} score={score} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 18px 0', animation: 'popIn 0.55s 0.12s cubic-bezier(0.22,1,0.36,1) both' }}>
        <ScoreRing score={score} accent={ACCENT} green={GREEN} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '10px 18px 0', animation: 'fadeUp 0.42s 0.22s cubic-bezier(0.22,1,0.36,1) both' }}>
        <StatCard icon="check" value={done} label="Erledigt" color={GREEN} radius={CARD_RADIUS - 4} />
        <StatCard icon="clock" value={Math.max(tasks.length - done, 0)} label="Offen" color={ACCENT} radius={CARD_RADIUS - 4} />
        <StatCard icon="fire" value={`${streak}T`} label="Serie" color="#FF6B2B" radius={CARD_RADIUS - 4} />
      </div>

      <div style={{ padding: '16px 18px 0', animation: 'fadeUp 0.42s 0.28s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>Aufgaben</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1, fontWeight: 600 }}>{done} von {tasks.length} erledigt</div>
          </div>
          <button type="button" aria-label="Aufgabe hinzufügen" onClick={() => setModal(true)} style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 16px ${ACCENT}55` }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}><path d="M12 5v14M5 12h14" stroke="#050508" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && (
            <div style={{ background: '#12121e', borderRadius: CARD_RADIUS - 4, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.42)', fontSize: 13, fontWeight: 700 }}>
              Aufgaben werden geladen...
            </div>
          )}
          {!loading && error && (
            <div style={{ background: 'rgba(255,82,82,0.1)', borderRadius: CARD_RADIUS - 4, padding: 16, border: '1px solid rgba(255,82,82,0.18)', color: '#FF7A7A', fontSize: 12, fontWeight: 700 }}>
              {error}
            </div>
          )}
          {!loading && !error && tasks.length === 0 && (
            <div style={{ background: '#12121e', borderRadius: CARD_RADIUS - 4, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.45, fontWeight: 600 }}>
              Noch keine Aufgaben. Tippe auf Plus und lege deine erste Aufgabe an.
            </div>
          )}
          {!loading && tasks.map((task, i) => (
            <div key={task.id} style={{ animation: `fadeUp 0.38s ${0.3 + 0.06 * i}s cubic-bezier(0.22,1,0.36,1) both` }}>
              <TaskItem task={task} onToggle={handleToggle} accent={ACCENT} green={GREEN} cardRadius={CARD_RADIUS - 4} />
            </div>
          ))}
        </div>
      </div>

      {modal && <AddTaskModal onAdd={add} onClose={() => setModal(false)} accent={ACCENT} />}
    </div>
  );
};
