import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { useRipple } from '../../../hooks/useRipple';
import type { Task, TaskUnit } from '../../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onAdvance: (id: string, amount: number) => void;
  onSkip: (id: string) => void;
  onRemove: (id: string) => void;
  accent: string;
  green: string;
  cardRadius: number;
}

const SNAP_THRESHOLD = 56;
const LEFT_REVEAL = 168;
const RIGHT_REVEAL = 96;

const UNIT_STEP: Record<TaskUnit, number> = {
  none: 1,
  pages: 5,
  minutes: 15,
  count: 1,
};

const UNIT_SUFFIX: Record<TaskUnit, string> = {
  none: '',
  pages: 'S.',
  minutes: 'min',
  count: 'x',
};

const TIME_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  morning: { label: 'Morgens', bg: 'rgba(255,182,72,0.14)', fg: '#FFB648' },
  midday:  { label: 'Mittags', bg: 'rgba(0,194,194,0.14)',  fg: '#00C2C2' },
  evening: { label: 'Abends',  bg: 'rgba(160,140,255,0.14)', fg: '#a08cff' },
  any:     { label: '',         bg: '',                       fg: '' },
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onAdvance, onSkip, onRemove, accent, green, cardRadius }) => {
  const [pressed, setPressed] = useState(false);
  const [showXP, setShowXP]   = useState(false);
  const [xpKey, setXpKey]     = useState(0);
  const [flash, setFlash]     = useState(false);
  const [ripples, addRipple]  = useRipple();
  const [offset, setOffset]   = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  const step = UNIT_STEP[task.unit];
  const suffix = UNIT_SUFFIX[task.unit];

  useEffect(() => {
    if (offset === 0) return;
    const reset = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-task-card="true"]')) return;
      setOffset(0);
    };
    window.addEventListener('mousedown', reset);
    window.addEventListener('touchstart', reset);
    return () => {
      window.removeEventListener('mousedown', reset);
      window.removeEventListener('touchstart', reset);
    };
  }, [offset]);

  const beginDrag = (clientX: number) => {
    startX.current = clientX;
    startOffset.current = offset;
    moved.current = false;
    setDragging(true);
  };

  const updateDrag = (clientX: number) => {
    const dx = clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    let next = startOffset.current + dx;
    if (next < -LEFT_REVEAL) next = -LEFT_REVEAL - (next + LEFT_REVEAL) * 0.4;
    if (next > RIGHT_REVEAL) next = RIGHT_REVEAL + (next - RIGHT_REVEAL) * 0.4;
    setOffset(next);
  };

  const endDrag = () => {
    setDragging(false);
    if (offset < -SNAP_THRESHOLD) setOffset(-LEFT_REVEAL);
    else if (offset > SNAP_THRESHOLD) setOffset(RIGHT_REVEAL);
    else setOffset(0);
  };

  const onMouseDown = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    setPressed(true);
    beginDrag(event.clientX);
  };
  const onMouseMove = (event: React.MouseEvent) => {
    if (!dragging) return;
    updateDrag(event.clientX);
  };
  const onMouseUp = () => {
    setPressed(false);
    if (dragging) endDrag();
  };
  const onTouchStart = (event: React.TouchEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    setPressed(true);
    beginDrag(event.touches[0].clientX);
  };
  const onTouchMove = (event: React.TouchEvent) => {
    if (!dragging) return;
    updateDrag(event.touches[0].clientX);
  };
  const onTouchEnd = () => {
    setPressed(false);
    if (dragging) endDrag();
  };

  const triggerComplete = (event?: React.MouseEvent) => {
    if (!task.done) {
      setShowXP(true); setXpKey(k => k + 1); setFlash(true);
      setTimeout(() => setShowXP(false), 950);
      setTimeout(() => setFlash(false),  650);
      if (event) addRipple(event);
    }
    onToggle(task.id);
  };

  const onCardClick = (event: React.MouseEvent) => {
    if (moved.current || offset !== 0) {
      moved.current = false;
      return;
    }
    triggerComplete(event);
  };

  const advance = (amount: number) => {
    onAdvance(task.id, amount);
    setOffset(0);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  const handleSkip = () => {
    setOffset(0);
    onSkip(task.id);
  };

  const handleDelete = () => {
    setOffset(0);
    onRemove(task.id);
  };

  const pc = task.priority === 'hoch' ? '#FF5252' : task.priority === 'mittel' ? accent : green;
  const target = task.target_amount;
  const progress = task.progress_amount;
  const progressPct = target ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const timeBadge = TIME_BADGE[task.time_of_day];

  return (
    <div style={{ position: 'relative', borderRadius: cardRadius, overflow: 'hidden' }}>
      <div
        aria-hidden={offset >= 0}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: LEFT_REVEAL,
          display: 'flex',
          alignItems: 'stretch',
          gap: 6,
          padding: 6,
          opacity: offset < -8 ? 1 : 0,
          transition: dragging ? 'none' : 'opacity 0.2s ease',
        }}
      >
        <button
          type="button"
          onClick={() => advance(step)}
          disabled={!target || progress >= target}
          style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: target ? `linear-gradient(135deg,${green}d8,${green}80)` : 'rgba(61,220,132,0.18)', color: '#0a0a14', fontSize: 12, fontWeight: 800, cursor: target ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, opacity: target && progress < target ? 1 : 0.4 }}
        >
          <span style={{ fontSize: 14 }}>+{step}{suffix && ` ${suffix}`}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>Abhaken</span>
        </button>
        <button
          type="button"
          onClick={handleSkip}
          style={{ flex: 1, borderRadius: cardRadius - 6, border: 'none', background: 'rgba(255,182,72,0.16)', color: '#FFB648', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
        >
          <span style={{ fontSize: 14 }}>Skip</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>Heute</span>
        </button>
      </div>

      <div
        aria-hidden={offset <= 0}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: RIGHT_REVEAL,
          padding: 6,
          opacity: offset > 8 ? 1 : 0,
          transition: dragging ? 'none' : 'opacity 0.2s ease',
        }}
      >
        <button
          type="button"
          onClick={handleDelete}
          style={{ width: '100%', height: '100%', borderRadius: cardRadius - 6, border: 'none', background: 'linear-gradient(135deg,#FF5252,#cc2424)', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}
        >
          <span style={{ fontSize: 16 }}>×</span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>Löschen</span>
        </button>
      </div>

      <div
        data-task-card="true"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onCardClick}
        style={{
          background:   flash ? 'rgba(61,220,132,0.11)' : task.done ? '#0e0e18' : '#12121e',
          borderRadius: cardRadius,
          padding:      '13px 14px',
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          border:       `1px solid ${flash ? 'rgba(61,220,132,0.32)' : task.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
          transform:    `translateX(${offset}px) scale(${pressed && !dragging ? 0.962 : 1})`,
          transition:   dragging ? 'none' : 'transform 0.28s cubic-bezier(0.22,1,0.36,1),background 0.38s ease,border-color 0.38s ease,opacity 0.28s ease',
          opacity:      task.done && !flash ? 0.48 : 1,
          position:     'relative',
          overflow:     'hidden',
          cursor:       'pointer',
          boxShadow:    flash ? `0 0 0 1.5px rgba(61,220,132,0.22),0 6px 24px rgba(61,220,132,0.14)` : 'none',
          touchAction:  'pan-y',
          userSelect:   'none',
        }}
      >
        {ripples.map(rp => (
          <div key={rp.id} style={{ position: 'absolute', left: rp.x - 28, top: rp.y - 28, width: 56, height: 56, borderRadius: '50%', background: `${green}38`, pointerEvents: 'none', animation: 'ripple 0.7s ease-out forwards' }} />
        ))}

        <div style={{ width: 3, height: 34, borderRadius: 99, background: pc, flexShrink: 0, opacity: task.done ? 0.2 : 0.95, transform: task.done ? 'scaleY(0.55)' : 'scaleY(1)', transition: 'opacity 0.38s ease,transform 0.38s cubic-bezier(0.34,1.56,0.64,1)' }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: task.done ? 'rgba(255,255,255,0.28)' : '#f0f0f8', letterSpacing: -0.2, transition: 'color 0.32s ease' }}>{task.title}</span>
              {task.done && <div style={{ position: 'absolute', top: '52%', left: 0, right: 0, height: '1.5px', background: 'rgba(255,255,255,0.2)', borderRadius: 2, animation: 'strike 0.42s cubic-bezier(0.25,1,0.5,1) forwards' }} />}
            </div>
            {timeBadge.label && task.time_of_day !== 'any' && (
              <span style={{ fontSize: 9, fontWeight: 800, color: timeBadge.fg, background: timeBadge.bg, padding: '2px 6px', borderRadius: 6, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {timeBadge.label}
              </span>
            )}
          </div>

          {target && task.unit !== 'none' && (
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

          {task.description && !target && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2, fontWeight: 500, opacity: task.done ? 0.45 : 1, transition: 'opacity 0.3s ease' }}>{task.description}</div>}
        </div>

        <button
          onClick={event => { event.stopPropagation(); triggerComplete(event); }}
          style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, border: `1.5px solid ${task.done ? green : 'rgba(255,255,255,0.14)'}`, background: task.done ? green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.26s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: task.done ? `0 0 16px ${green}75` : 'none' }}
        >
          {task.done && <div style={{ animation: 'checkPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both' }}><Icon name="check" size={15} color="#050508" /></div>}
          {showXP && <div key={xpKey} style={{ position: 'absolute', top: -13, right: -5, fontSize: 11, fontWeight: 800, color: green, pointerEvents: 'none', animation: 'floatXP 0.95s cubic-bezier(0.25,1,0.5,1) forwards', zIndex: 10, textShadow: `0 0 12px ${green}` }}>+10</div>}
        </button>
      </div>
    </div>
  );
};
