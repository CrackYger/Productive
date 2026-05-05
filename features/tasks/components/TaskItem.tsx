import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { useRipple } from '../../../hooks/useRipple';
import type { Task } from '../../../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  accent: string;
  green: string;
  cardRadius: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, accent, green, cardRadius }) => {
  const [pressed, setPressed] = useState(false);
  const [showXP, setShowXP]   = useState(false);
  const [xpKey, setXpKey]     = useState(0);
  const [flash, setFlash]     = useState(false);
  const [ripples, addRipple]  = useRipple();

  const toggle = (e: React.MouseEvent) => {
    if (!task.done) {
      setShowXP(true); setXpKey(k => k + 1); setFlash(true);
      setTimeout(() => setShowXP(false), 950);
      setTimeout(() => setFlash(false),  650);
      addRipple(e);
    }
    onToggle(task.id);
  };

  const pc = task.priority === 'hoch' ? '#FF5252' : task.priority === 'mittel' ? accent : green;

  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={toggle}
      style={{
        background:   flash ? 'rgba(61,220,132,0.11)' : task.done ? '#0e0e18' : '#12121e',
        borderRadius: cardRadius,
        padding:      '13px 14px',
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        border:       `1px solid ${flash ? 'rgba(61,220,132,0.32)' : task.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
        transform:    pressed ? 'scale(0.962)' : 'scale(1)',
        transition:   'transform 0.12s cubic-bezier(0.34,1.56,0.64,1),background 0.38s ease,border-color 0.38s ease,opacity 0.28s ease',
        opacity:      task.done && !flash ? 0.48 : 1,
        position:     'relative',
        overflow:     'hidden',
        cursor:       'pointer',
        boxShadow:    flash ? `0 0 0 1.5px rgba(61,220,132,0.22),0 6px 24px rgba(61,220,132,0.14)` : 'none',
      }}
    >
      {ripples.map(rp => (
        <div key={rp.id} style={{ position: 'absolute', left: rp.x - 28, top: rp.y - 28, width: 56, height: 56, borderRadius: '50%', background: `${green}38`, pointerEvents: 'none', animation: 'ripple 0.7s ease-out forwards' }} />
      ))}

      <div style={{ width: 3, height: 34, borderRadius: 99, background: pc, flexShrink: 0, opacity: task.done ? 0.2 : 0.95, transform: task.done ? 'scaleY(0.55)' : 'scaleY(1)', transition: 'opacity 0.38s ease,transform 0.38s cubic-bezier(0.34,1.56,0.64,1)' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: task.done ? 'rgba(255,255,255,0.28)' : '#f0f0f8', letterSpacing: -0.2, transition: 'color 0.32s ease' }}>{task.title}</span>
          {task.done && <div style={{ position: 'absolute', top: '52%', left: 0, height: '1.5px', background: 'rgba(255,255,255,0.2)', borderRadius: 2, animation: 'strike 0.42s cubic-bezier(0.25,1,0.5,1) forwards' }} />}
        </div>
        {task.description && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2, fontWeight: 500, opacity: task.done ? 0.45 : 1, transition: 'opacity 0.3s ease' }}>{task.description}</div>}
      </div>

      <button
        onClick={e => { e.stopPropagation(); toggle(e); }}
        style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, border: `1.5px solid ${task.done ? green : 'rgba(255,255,255,0.14)'}`, background: task.done ? green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.26s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: task.done ? `0 0 16px ${green}75` : 'none' }}
      >
        {task.done && <div style={{ animation: 'checkPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both' }}><Icon name="check" size={15} color="#050508" /></div>}
        {showXP && <div key={xpKey} style={{ position: 'absolute', top: -13, right: -5, fontSize: 11, fontWeight: 800, color: green, pointerEvents: 'none', animation: 'floatXP 0.95s cubic-bezier(0.25,1,0.5,1) forwards', zIndex: 10, textShadow: `0 0 12px ${green}` }}>+10</div>}
      </button>
    </div>
  );
};
