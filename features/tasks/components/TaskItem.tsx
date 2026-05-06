import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { useRipple } from '../../../hooks/useRipple';
import { isEffectiveDone, isScheduledToday } from '../../../utils/tasks';
import type { Task, TaskUnit } from '../../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onAdvance: (id: string, amount: number) => void;
  onSkip: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (task: Task) => void;
  accent: string;
  green: string;
  cardRadius: number;
}

const UNIT_STEP: Record<TaskUnit, number> = { none: 1, pages: 5, minutes: 15, count: 1 };
const UNIT_SUFFIX: Record<TaskUnit, string> = { none: '', pages: 'S.', minutes: 'min', count: 'x' };

const RECURRENCE_LABEL: Record<string, string> = {
  daily:    'Täglich',
  weekly:   'Wöchentlich',
  weekdays: '',
};

const WEEKDAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const TIME_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  morning: { label: 'Morgens', bg: 'rgba(255,182,72,0.14)',  fg: '#FFB648' },
  midday:  { label: 'Mittags',  bg: 'rgba(0,194,194,0.14)',  fg: '#00C2C2' },
  evening: { label: 'Abends',   bg: 'rgba(160,140,255,0.14)', fg: '#a08cff' },
  any:     { label: '',          bg: '',                        fg: '' },
};

const REVEAL_LEFT  = 168;   // swipe right → reveals edit + delete
const REVEAL_RIGHT = 168;   // swipe left  → reveals advance + skip
const SNAP         = 56;    // distance after which drawer snaps open
const HORIZONTAL_LOCK = 8;  // px before we claim the gesture as horizontal
const CLICK_TOLERANCE = 5;  // dx below this counts as a tap

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onAdvance, onSkip, onRemove, onEdit, accent, green, cardRadius }) => {
  const [showXP, setShowXP] = useState(false);
  const [xpKey, setXpKey] = useState(0);
  const [flash, setFlash] = useState(false);
  const [ripples, addRipple] = useRipple();
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartOffset = useRef(0);
  const horizontal = useRef(false);
  const moved = useRef(false);
  const justSwiped = useRef(false);

  const step = UNIT_STEP[task.unit];
  const suffix = UNIT_SUFFIX[task.unit];

  const effectiveDone = isEffectiveDone(task);
  const scheduledToday = isScheduledToday(task);

  const recurrenceLabel = task.recurrence === 'weekdays'
    ? task.recurrence_days.map(d => WEEKDAY_SHORT[d]).join(' ')
    : RECURRENCE_LABEL[task.recurrence] ?? '';

  // Outside-tap closes drawer
  useEffect(() => {
    if (offset === 0) return;
    const reset = (e: MouseEvent | TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(`[data-task-id="${task.id}"]`)) return;
      setOffset(0);
    };
    window.addEventListener('mousedown', reset);
    window.addEventListener('touchstart', reset, { passive: true });
    return () => {
      window.removeEventListener('mousedown', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, [offset, task.id]);

  const beginDrag = (x: number, y: number) => {
    dragStartX.current = x;
    dragStartY.current = y;
    dragStartOffset.current = offset;
    horizontal.current = false;
    moved.current = false;
  };

  const updateDrag = (x: number, y: number): boolean => {
    const dx = x - dragStartX.current;
    const dy = y - dragStartY.current;
    if (!horizontal.current) {
      if (Math.abs(dx) < HORIZONTAL_LOCK && Math.abs(dy) < HORIZONTAL_LOCK) return false;
      if (Math.abs(dy) > Math.abs(dx)) {
        setDragging(false);
        return false;
      }
      horizontal.current = true;
      setDragging(true);
    }
    if (Math.abs(dx) > CLICK_TOLERANCE) moved.current = true;
    let next = dragStartOffset.current + dx;
    if (next < -REVEAL_RIGHT) next = -REVEAL_RIGHT + (next + REVEAL_RIGHT) * 0.32;
    if (next >  REVEAL_LEFT)  next =  REVEAL_LEFT  + (next - REVEAL_LEFT)  * 0.32;
    setOffset(next);
    return true;
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    let snapTo = 0;
    if (offset <= -SNAP) snapTo = -REVEAL_RIGHT;
    else if (offset >= SNAP) snapTo = REVEAL_LEFT;
    setOffset(snapTo);
    if (snapTo !== 0) justSwiped.current = true;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const t = e.touches[0];
    beginDrag(t.clientX, t.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (updateDrag(t.clientX, t.clientY) && e.cancelable) e.preventDefault();
  };
  const onTouchEnd = () => endDrag();

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    beginDrag(e.clientX, e.clientY);
    const move = (ev: MouseEvent) => updateDrag(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      endDrag();
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const triggerComplete = (e?: React.MouseEvent) => {
    if (!effectiveDone) {
      setShowXP(true); setXpKey(k => k + 1); setFlash(true);
      setTimeout(() => setShowXP(false), 950);
      setTimeout(() => setFlash(false),  650);
      if (e) addRipple(e);
    }
    onToggle(task.id);
  };

  const onCardClick = (e: React.MouseEvent) => {
    // suppress click that follows a swipe / drawer-open state
    if (moved.current || offset !== 0 || justSwiped.current) {
      moved.current = false;
      justSwiped.current = false;
      if (offset !== 0) setOffset(0);
      return;
    }
    triggerComplete(e);
  };

  const advance = (amount: number) => {
    const newProgress = Math.min(task.progress_amount + amount, task.target_amount ?? Infinity);
    const willComplete = task.target_amount ? newProgress >= task.target_amount : false;
    onAdvance(task.id, amount);
    setOffset(0);
    if (willComplete) {
      setFlash(true);
      setShowXP(true); setXpKey(k => k + 1);
      setTimeout(() => { setFlash(false); setShowXP(false); }, 700);
    }
  };

  const handleSkip   = () => { setOffset(0); onSkip(task.id); };
  const handleDelete = () => { setOffset(0); onRemove(task.id); };
  const handleEdit   = () => { setOffset(0); onEdit(task); };
  const handleToggleFromDrawer = () => { setOffset(0); onToggle(task.id); };

  const pc = task.priority === 'hoch' ? '#FF5252' : task.priority === 'mittel' ? accent : green;
  const target = task.target_amount;
  const progress = task.progress_amount;
  const progressPct = target ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const timeBadge = TIME_BADGE[task.time_of_day];
  const hasTarget = task.unit !== 'none' && !!target;
  const notToday = !scheduledToday && !effectiveDone;

  const cardBorderColor = flash
    ? 'rgba(61,220,132,0.32)'
    : task.skipped
    ? 'rgba(255,182,72,0.18)'
    : 'rgba(255,255,255,0.07)';

  const cardBg = flash
    ? 'rgba(61,220,132,0.11)'
    : task.skipped
    ? 'rgba(255,182,72,0.07)'
    : '#12121e';

  const drawerOpacity = (revealed: number) => {
    if (dragging) return Math.min(1, revealed / SNAP);
    return revealed > 4 ? 1 : 0;
  };

  const cardTransition = dragging
    ? 'none'
    : 'transform 0.34s cubic-bezier(0.22,1,0.36,1), background 0.32s ease, border-color 0.32s ease, opacity 0.32s ease, box-shadow 0.32s ease';

  return (
    <div data-task-id={task.id} style={{ position: 'relative', borderRadius: cardRadius, overflow: 'hidden' }}>
      {/* Right drawer (revealed by swiping LEFT) */}
      <div
        aria-hidden={offset >= 0}
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: REVEAL_RIGHT,
          display: 'flex', alignItems: 'stretch', gap: 6, padding: 6,
          opacity: drawerOpacity(-offset),
          transition: dragging ? 'none' : 'opacity 0.22s ease',
          pointerEvents: offset < 0 ? 'auto' : 'none',
        }}
      >
        {hasTarget && !effectiveDone ? (
          <button
            type="button"
            onClick={() => advance(step)}
            style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: `linear-gradient(135deg,${green}d8,${green}80)`, color: '#0a0a14', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <span style={{ fontSize: 14 }}>+{step}{suffix ? ` ${suffix}` : ''}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>Abhaken</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggleFromDrawer}
            style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: effectiveDone ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${green}d8,${green}80)`, color: effectiveDone ? 'rgba(255,255,255,0.6)' : '#0a0a14', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <span style={{ fontSize: 14 }}>{effectiveDone ? '↺' : '✓'}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>{effectiveDone ? 'Zurück' : 'Fertig'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleSkip}
          style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: 'rgba(255,182,72,0.2)', color: '#FFB648', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
        >
          <span style={{ fontSize: 14 }}>↷</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>Skip</span>
        </button>
      </div>

      {/* Left drawer (revealed by swiping RIGHT) */}
      <div
        aria-hidden={offset <= 0}
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: REVEAL_LEFT,
          display: 'flex', alignItems: 'stretch', gap: 6, padding: 6,
          opacity: drawerOpacity(offset),
          transition: dragging ? 'none' : 'opacity 0.22s ease',
          pointerEvents: offset > 0 ? 'auto' : 'none',
        }}
      >
        <button
          type="button"
          onClick={handleEdit}
          style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: `${accent}28`, color: accent, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
        >
          <span style={{ fontSize: 15 }}>✎</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>Bearbeiten</span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: 'linear-gradient(135deg,#FF5252,#cc2424)', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
        >
          <span style={{ fontSize: 15 }}>×</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Löschen</span>
        </button>
      </div>

      {/* Main card */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onClick={onCardClick}
        style={{
          background: cardBg,
          borderRadius: cardRadius,
          padding: '13px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          border: `1px solid ${cardBorderColor}`,
          opacity: (effectiveDone || notToday) && !flash ? 0.55 : task.skipped ? 0.7 : 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: flash ? `0 0 0 1.5px rgba(61,220,132,0.22),0 6px 24px rgba(61,220,132,0.14)` : 'none',
          userSelect: 'none',
          touchAction: 'pan-y',
          transform: `translate3d(${offset}px, 0, 0)`,
          transition: cardTransition,
          willChange: 'transform',
        }}
      >
        {ripples.map(rp => (
          <div key={rp.id} style={{ position: 'absolute', left: rp.x - 28, top: rp.y - 28, width: 56, height: 56, borderRadius: '50%', background: `${green}38`, pointerEvents: 'none', animation: 'ripple 0.7s ease-out forwards' }} />
        ))}

        <div style={{ width: 3, height: 34, borderRadius: 99, background: task.skipped ? '#FFB648' : pc, flexShrink: 0, marginTop: 4, opacity: (effectiveDone || task.skipped) ? 0.22 : 0.95, transform: (effectiveDone || task.skipped) ? 'scaleY(0.55)' : 'scaleY(1)', transition: 'opacity 0.38s ease,transform 0.38s cubic-bezier(0.34,1.56,0.64,1)' }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: effectiveDone || task.skipped ? 'rgba(255,255,255,0.32)' : '#f0f0f8', letterSpacing: -0.2, transition: 'color 0.32s ease' }}>{task.title}</span>
              {(effectiveDone || task.skipped) && <div style={{ position: 'absolute', top: '52%', left: 0, right: 0, height: '1.5px', background: task.skipped ? 'rgba(255,182,72,0.5)' : 'rgba(255,255,255,0.2)', borderRadius: 2, animation: 'strike 0.42s cubic-bezier(0.25,1,0.5,1) forwards' }} />}
            </div>

            {task.skipped && (
              <span style={{ fontSize: 9, fontWeight: 800, color: '#FFB648', background: 'rgba(255,182,72,0.15)', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.6, textTransform: 'uppercase' }}>Übersprungen</span>
            )}

            {!task.skipped && timeBadge.label && task.time_of_day !== 'any' && (
              <span style={{ fontSize: 9, fontWeight: 800, color: timeBadge.fg, background: timeBadge.bg, padding: '2px 6px', borderRadius: 6, letterSpacing: 0.6, textTransform: 'uppercase' }}>{timeBadge.label}</span>
            )}

            {task.recurrence !== 'none' && recurrenceLabel && (
              <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.4 }}>{recurrenceLabel}</span>
            )}

            {notToday && (
              <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 6, letterSpacing: 0.6 }}>Nicht heute</span>
            )}
          </div>

          {hasTarget && (
            <div style={{ marginTop: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', fontWeight: 700 }}>{progress} / {target} {suffix}</span>
                <span style={{ fontSize: 10, color: pc, fontWeight: 800 }}>{progressPct}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 99, background: pc, transition: 'width 0.6s cubic-bezier(0.34,1.05,0.64,1)' }} />
              </div>
            </div>
          )}

          {task.description && !hasTarget && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 3, fontWeight: 500 }}>{task.description}</div>
          )}

          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: 0.8, marginTop: 7, textTransform: 'uppercase' }}>← Bearbeiten / Löschen · Skip / Abhaken →</div>
        </div>

        <button
          type="button"
          onClick={e => { e.stopPropagation(); triggerComplete(e); }}
          aria-label={effectiveDone ? 'Erledigt' : 'Abhaken'}
          style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 4, border: `1.5px solid ${effectiveDone ? green : task.skipped ? '#FFB648' : 'rgba(255,255,255,0.14)'}`, background: effectiveDone ? green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.26s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: effectiveDone ? `0 0 16px ${green}75` : 'none', fontFamily: 'inherit', padding: 0 }}
        >
          {effectiveDone && <div style={{ animation: 'checkPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both' }}><Icon name="check" size={15} color="#050508" /></div>}
          {showXP && <div key={xpKey} style={{ position: 'absolute', top: -13, right: -5, fontSize: 11, fontWeight: 800, color: green, pointerEvents: 'none', animation: 'floatXP 0.95s cubic-bezier(0.25,1,0.5,1) forwards', zIndex: 10, textShadow: `0 0 12px ${green}` }}>+10</div>}
        </button>
      </div>
    </div>
  );
};
