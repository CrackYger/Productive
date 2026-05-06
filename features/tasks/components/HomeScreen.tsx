import React, { useMemo, useState } from 'react';
import { ScoreRing } from '../../../components/ScoreRing';
import { StatCard } from '../../../components/StatCard';
import { StreakBadge } from './StreakBadge';
import { TaskItem } from './TaskItem';
import { AddTaskModal } from './AddTaskModal';
import { useProfile } from '../../../hooks/useProfile';
import { useTasks } from '../../../hooks/useTasks';
import { useStreak } from '../../../hooks/useStreak';
import { useBooks } from '../../../hooks/useBooks';
import { todayFormatted } from '../../../utils/date';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';
import type { Task, TaskTimeOfDay } from '../../../types';

type DaypartFilter = 'all' | TaskTimeOfDay;

const FILTERS: { key: DaypartFilter; label: string }[] = [
  { key: 'all', label: 'Ganzer Tag' },
  { key: 'morning', label: 'Morgens' },
  { key: 'midday', label: 'Mittags' },
  { key: 'evening', label: 'Abends' },
];

export const HomeScreen: React.FC = () => {
  const { profile } = useProfile();
  const { tasks, loading, error, toggle, advanceProgress, skip, remove, add, updateTask } = useTasks();
  const { streak, markToday } = useStreak();
  const { books, addPages } = useBooks();
  const [modal, setModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<DaypartFilter>('all');

  const visibleTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.time_of_day === filter || task.time_of_day === 'any');
  }, [tasks, filter]);

  const done = visibleTasks.filter(task => task.done).length;
  const score = visibleTasks.length > 0 ? Math.round((done / visibleTasks.length) * 100) : 0;
  const userName = profile?.displayName ?? 'Heute';

  const syncReadingProgress = (task: Task, deltaPages: number) => {
    if (task.category !== 'reading' || !task.book_id || deltaPages <= 0) return;
    const book = books.find(item => item.id === task.book_id);
    if (!book) return;
    void addPages(task.book_id, deltaPages);
  };

  const handleToggle = (id: string) => {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    if (!task.done) {
      void markToday();
      const remaining = task.target_amount ? Math.max(0, task.target_amount - task.progress_amount) : 0;
      if (task.unit === 'pages' && remaining > 0) {
        syncReadingProgress(task, remaining);
      }
    }
    void toggle(id);
  };

  const handleAdvance = (id: string, amount: number) => {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    if (!task.done) void markToday();
    if (task.unit === 'pages') {
      const remainingBefore = task.target_amount ? Math.max(0, task.target_amount - task.progress_amount) : amount;
      const applied = Math.min(amount, remainingBefore || amount);
      if (applied > 0) syncReadingProgress(task, applied);
    }
    void advanceProgress(id, amount);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={{ padding: 'max(50px, env(safe-area-inset-top)) 18px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', animation: 'fadeDown 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ minWidth: 0, paddingRight: 8 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{todayFormatted()}</div>
        </div>
        <StreakBadge days={streak} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 18px 0', animation: 'popIn 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both' }}>
        <ScoreRing score={score} accent={ACCENT} green={GREEN} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '10px 18px 0', animation: 'fadeUp 0.42s 0.18s cubic-bezier(0.22,1,0.36,1) both' }}>
        <StatCard icon="check" value={done} label="Erledigt" color={GREEN} radius={CARD_RADIUS - 4} />
        <StatCard icon="clock" value={Math.max(visibleTasks.length - done, 0)} label="Offen" color={ACCENT} radius={CARD_RADIUS - 4} />
        <StatCard icon="fire" value={`${streak}T`} label="Serie" color="#FF6B2B" radius={CARD_RADIUS - 4} />
      </div>

      <div style={{ padding: '14px 18px 0', animation: 'fadeUp 0.42s 0.22s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ display: 'flex', gap: 6, background: '#0c0c16', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
          {FILTERS.map(option => {
            const active = filter === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? `linear-gradient(135deg,${ACCENT},#008888)` : 'transparent',
                  color: active ? '#050508' : 'rgba(255,255,255,0.55)',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: 0.2,
                  transition: 'all 0.22s ease',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '14px 18px 0', animation: 'fadeUp 0.42s 0.26s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>Aufgaben</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1, fontWeight: 600 }}>{done} von {visibleTasks.length} erledigt</div>
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
          {!loading && !error && visibleTasks.length === 0 && (
            <div style={{ background: '#12121e', borderRadius: CARD_RADIUS - 4, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.45, fontWeight: 600 }}>
              {filter === 'all'
                ? 'Noch keine Aufgaben. Tippe auf Plus und lege deine erste Aufgabe an.'
                : 'Für diese Tageszeit ist nichts geplant. Lege oben rechts eine neue Aufgabe an.'}
            </div>
          )}
          {!loading && visibleTasks.map((task, i) => (
            <div key={task.id} style={{ animation: `fadeUp 0.38s ${0.28 + 0.06 * i}s cubic-bezier(0.22,1,0.36,1) both` }}>
              <TaskItem
                task={task}
                onToggle={handleToggle}
                onAdvance={handleAdvance}
                onSkip={skip}
                onRemove={remove}
                onEdit={setEditTask}
                accent={ACCENT}
                green={GREEN}
                cardRadius={CARD_RADIUS - 4}
              />
            </div>
          ))}
        </div>
      </div>

      {modal && <AddTaskModal onAdd={add} onClose={() => setModal(false)} accent={ACCENT} />}
      {editTask && (
        <AddTaskModal
          onAdd={add}
          onUpdate={(id, input) => { void updateTask(id, input); }}
          initialTask={editTask}
          onClose={() => setEditTask(null)}
          accent={ACCENT}
        />
      )}
    </div>
  );
};
