import React, { useState } from 'react';
import type { Priority } from '../../../types';
import type { AddInput } from '../../../hooks/useTasks';

interface AddTaskModalProps {
  onAdd: (input: AddInput) => void;
  onClose: () => void;
  accent: string;
}

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'hoch', label: 'Hoch', color: '#FF5252' },
  { key: 'mittel', label: 'Mittel', color: '#00C2C2' },
  { key: 'niedrig', label: 'Niedrig', color: '#3DDC84' },
];

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: '#0e0e1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 13,
  padding: '12px 14px',
  fontSize: 16,
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  marginBottom: 10,
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose, accent }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [prio, setPrio] = useState<Priority>('mittel');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: desc.trim() || undefined, priority: prio });
    onClose();
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', background: '#12121e', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(40px + env(safe-area-inset-bottom, 0px))', animation: 'sheetUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}
        onClick={event => event.stopPropagation()}
      >
        <div style={{ width: 38, height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 99, margin: '0 auto 18px' }} />
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: -0.3 }}>Neue Aufgabe</div>

        <input autoFocus value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => event.key === 'Enter' && submit()} placeholder="Aufgabentitel..." style={INPUT_STYLE} />
        <input value={desc} onChange={event => setDesc(event.target.value)} placeholder="Beschreibung (optional)" style={INPUT_STYLE} />

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Priorität</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {PRIORITIES.map(option => (
            <button key={option.key} type="button" onClick={() => setPrio(option.key)} style={{ flex: 1, padding: '9px 0', borderRadius: 12, border: `1.5px solid ${prio === option.key ? option.color : 'rgba(255,255,255,0.08)'}`, background: prio === option.key ? `${option.color}18` : 'transparent', color: prio === option.key ? option.color : 'rgba(255,255,255,0.38)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s ease' }}>
              {option.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={submit} style={{ width: '100%', padding: '14px', borderRadius: 15, background: `linear-gradient(135deg,${accent},#008888)`, border: 'none', color: '#050508', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 22px ${accent}50` }}>
          Hinzufügen
        </button>
      </div>
    </div>
  );
};
