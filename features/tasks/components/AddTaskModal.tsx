import React, { useEffect, useMemo, useState } from 'react';
import type { Priority, TaskCategory, TaskTimeOfDay, TaskUnit } from '../../../types';
import type { AddInput } from '../../../hooks/useTasks';
import { useBooks } from '../../../hooks/useBooks';
import { useHideChromeWhileMounted } from '../../../contexts/UIChromeContext';
import { Icon } from '../../../components/Icon';
import { ACCENT, GREEN } from '../../../constants/theme';
import type { IconName } from '../../../components/Icon';

interface AddTaskModalProps {
  onAdd: (input: AddInput) => void;
  onClose: () => void;
  accent: string;
}

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'hoch', label: 'Hoch', color: '#FF5252' },
  { key: 'mittel', label: 'Mittel', color: ACCENT },
  { key: 'niedrig', label: 'Niedrig', color: GREEN },
];

const CATEGORIES: { key: TaskCategory; label: string; icon: IconName; defaultUnit: TaskUnit }[] = [
  { key: 'reading', label: 'Lesen', icon: 'book', defaultUnit: 'pages' },
  { key: 'school', label: 'Schule', icon: 'school', defaultUnit: 'minutes' },
  { key: 'sport', label: 'Sport', icon: 'bolt', defaultUnit: 'minutes' },
  { key: 'work', label: 'Arbeit', icon: 'chart', defaultUnit: 'minutes' },
  { key: 'personal', label: 'Persönlich', icon: 'star', defaultUnit: 'none' },
  { key: 'other', label: 'Sonstiges', icon: 'target', defaultUnit: 'none' },
];

const UNITS: { key: TaskUnit; label: string; suffix: string }[] = [
  { key: 'none', label: 'Ohne', suffix: '' },
  { key: 'pages', label: 'Seiten', suffix: 'S.' },
  { key: 'minutes', label: 'Minuten', suffix: 'min' },
  { key: 'count', label: 'Anzahl', suffix: 'x' },
];

const TIME_OF_DAY: { key: TaskTimeOfDay; label: string; emoji: string }[] = [
  { key: 'any', label: 'Ganzer Tag', emoji: '☀︎' },
  { key: 'morning', label: 'Morgens', emoji: '↑' },
  { key: 'midday', label: 'Mittags', emoji: '◆' },
  { key: 'evening', label: 'Abends', emoji: '↓' },
];

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 10,
  color: 'rgba(255,255,255,0.42)',
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  marginBottom: 8,
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: '#0c0c16',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 13,
  padding: '12px 14px',
  fontSize: 16,
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ onAdd, onClose, accent }) => {
  useHideChromeWhileMounted();

  const { books } = useBooks();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [prio, setPrio] = useState<Priority>('mittel');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [unit, setUnit] = useState<TaskUnit>('none');
  const [target, setTarget] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TaskTimeOfDay>('any');
  const [bookId, setBookId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const def = CATEGORIES.find(item => item.key === category)?.defaultUnit ?? 'none';
    setUnit(def);
    if (category !== 'reading') setBookId(undefined);
  }, [category]);

  useEffect(() => {
    if (category === 'reading' && !bookId && books.length > 0) {
      setBookId(books[0].id);
    }
  }, [category, books, bookId]);

  const targetNumber = useMemo(() => {
    const value = parseInt(target, 10);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [target]);

  const canSubmit = title.trim().length > 0 && (unit === 'none' || targetNumber !== undefined);

  const submit = () => {
    if (!canSubmit) return;
    onAdd({
      title: title.trim(),
      description: desc.trim() || undefined,
      priority: prio,
      category,
      unit,
      target_amount: unit === 'none' ? undefined : targetNumber,
      time_of_day: timeOfDay,
      book_id: category === 'reading' ? bookId : undefined,
    });
    onClose();
  };

  const showUnitPicker = category !== 'personal' && category !== 'other';

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: 16, animation: 'fadeIn 0.18s ease both' }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          maxHeight: 'calc(100dvh - 64px)',
          background: 'linear-gradient(180deg,#15151f 0%,#0f0f18 100%)',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 0.32s cubic-bezier(0.22,1,0.36,1) both',
        }}
        onClick={event => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>Neue Aufgabe</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>Plane einen Schritt für heute.</div>
          </div>
          <button type="button" aria-label="Schließen" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
            ×
          </button>
        </div>

        <div style={{ padding: '4px 18px 16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Titel</div>
            <input autoFocus value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => event.key === 'Enter' && submit()} placeholder="z.B. 20 Seiten lesen" style={INPUT_STYLE} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Kategorie</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES.map(option => {
                const active = category === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setCategory(option.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: '10px 4px',
                      borderRadius: 12,
                      border: `1.5px solid ${active ? accent : 'rgba(255,255,255,0.08)'}`,
                      background: active ? `${accent}1f` : '#0c0c16',
                      color: active ? accent : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <Icon name={option.icon} size={16} color={active ? accent : 'rgba(255,255,255,0.55)'} />
                    <span style={{ fontSize: 11, fontWeight: 700 }}>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {category === 'reading' && (
            <div style={{ marginBottom: 14 }}>
              <div style={FIELD_LABEL}>Buch</div>
              {books.length === 0 ? (
                <div style={{ padding: '10px 12px', borderRadius: 12, background: '#0c0c16', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>
                  Noch kein Buch angelegt — füge zuerst ein Buch hinzu.
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginRight: -18, paddingRight: 18 }}>
                  {books.map(book => {
                    const active = bookId === book.id;
                    return (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => setBookId(book.id)}
                        style={{
                          flexShrink: 0,
                          minWidth: 132,
                          padding: '10px 12px',
                          borderRadius: 12,
                          border: `1.5px solid ${active ? book.color : 'rgba(255,255,255,0.08)'}`,
                          background: active ? `${book.color}1f` : '#0c0c16',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', fontWeight: 600, marginTop: 2 }}>S. {book.cur} / {book.pages}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {showUnitPicker && (
            <div style={{ marginBottom: 14 }}>
              <div style={FIELD_LABEL}>Ziel</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={target}
                  onChange={event => setTarget(event.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="z.B. 20"
                  inputMode="numeric"
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
                <div style={{ display: 'flex', gap: 4, background: '#0c0c16', borderRadius: 13, padding: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
                  {UNITS.filter(item => item.key !== 'none').map(option => {
                    const active = unit === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setUnit(option.key)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 9,
                          border: 'none',
                          background: active ? accent : 'transparent',
                          color: active ? '#050508' : 'rgba(255,255,255,0.55)',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.16s ease',
                        }}
                      >
                        {option.suffix || option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Tageszeit</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {TIME_OF_DAY.map(option => {
                const active = timeOfDay === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTimeOfDay(option.key)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 11,
                      border: `1.5px solid ${active ? accent : 'rgba(255,255,255,0.08)'}`,
                      background: active ? `${accent}1f` : '#0c0c16',
                      color: active ? accent : 'rgba(255,255,255,0.55)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.16s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, lineHeight: 1, opacity: 0.85 }}>{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Priorität</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map(option => {
                const active = prio === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setPrio(option.key)}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      borderRadius: 12,
                      border: `1.5px solid ${active ? option.color : 'rgba(255,255,255,0.08)'}`,
                      background: active ? `${option.color}18` : '#0c0c16',
                      color: active ? option.color : 'rgba(255,255,255,0.42)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <div style={FIELD_LABEL}>Notiz (optional)</div>
            <input value={desc} onChange={event => setDesc(event.target.value)} placeholder="Kurze Beschreibung" style={INPUT_STYLE} />
          </div>
        </div>

        <div style={{ padding: '12px 18px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 15,
              background: canSubmit ? `linear-gradient(135deg,${accent},#008888)` : 'rgba(255,255,255,0.06)',
              border: 'none',
              color: canSubmit ? '#050508' : 'rgba(255,255,255,0.3)',
              fontSize: 15,
              fontWeight: 800,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              boxShadow: canSubmit ? `0 6px 22px ${accent}50` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
};
