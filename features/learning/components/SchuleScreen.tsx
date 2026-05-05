import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { todayFormatted } from '../../../utils/date';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';
import { useSchool } from '../../../hooks/useSchool';
import type { SubjectEntry } from '../../../hooks/useSchool';

const GRADES = [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 5.0, 6.0];
const COLORS = ['#FF6B2B', GREEN, ACCENT, '#c084fc', '#FF5252', '#FFD700'];

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
  marginBottom: 10,
};

const AddSubjectModal: React.FC<{ onAdd: (input: Omit<SubjectEntry, 'id'>) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('2.0');
  const [next, setNext] = useState('');
  const [done, setDone] = useState('0');
  const [total, setTotal] = useState('1');
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    const parsedGrade = parseFloat(grade);
    const parsedDone = Math.max(0, parseInt(done, 10) || 0);
    const parsedTotal = Math.max(parsedDone, parseInt(total, 10) || 0);

    if (!name.trim() || Number.isNaN(parsedGrade)) return;
    onAdd({
      name: name.trim(),
      grade: parsedGrade,
      next: next.trim() || 'Nächsten Termin eintragen',
      color,
      done: parsedDone,
      total: parsedTotal,
    });
    onClose();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ width: '100%', background: '#12121e', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(40px + env(safe-area-inset-bottom, 0px))', animation: 'sheetUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }} onClick={event => event.stopPropagation()}>
        <div style={{ width: 38, height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 99, margin: '0 auto 18px' }} />
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: -0.3 }}>Neues Fach</div>
        <input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Fachname" style={INPUT} />
        <input value={next} onChange={event => setNext(event.target.value)} placeholder="Nächster Termin" style={INPUT} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <input value={grade} onChange={event => setGrade(event.target.value)} placeholder="Note" type="number" min={1} max={6} step={0.1} inputMode="decimal" style={INPUT} />
          <input value={done} onChange={event => setDone(event.target.value)} placeholder="Erledigt" type="number" min={0} inputMode="numeric" style={INPUT} />
          <input value={total} onChange={event => setTotal(event.target.value)} placeholder="Gesamt" type="number" min={0} inputMode="numeric" style={INPUT} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {COLORS.map(item => (
            <button key={item} type="button" aria-label={`Farbe ${item}`} onClick={() => setColor(item)} style={{ width: 32, height: 32, borderRadius: 10, background: item, border: color === item ? '2.5px solid #fff' : '2.5px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
          ))}
        </div>
        <button type="button" onClick={submit} style={{ width: '100%', padding: 14, borderRadius: 15, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', color: '#050508', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 22px ${ACCENT}50` }}>
          Hinzufügen
        </button>
      </div>
    </div>
  );
};

export const SchuleScreen: React.FC = () => {
  const { subjects, loading, error, updateGrade, updateNext, addSubject } = useSchool();
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editingNext, setEditingNext] = useState<string | null>(null);
  const [nextVal, setNextVal] = useState('');
  const [modal, setModal] = useState(false);

  const avgNumber = subjects.length ? subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length : 0;
  const avg = subjects.length ? avgNumber.toFixed(1) : '-';
  const bestPrev = 2.3;
  const improvementNumber = subjects.length ? bestPrev - avgNumber : 0;
  const improvement = subjects.length ? `${improvementNumber > 0 ? '+' : ''}${improvementNumber.toFixed(1)}` : '-';

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
      <div style={{ padding: 'max(50px, env(safe-area-inset-top)) 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', animation: 'fadeDown 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.8 }}>Schule</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{todayFormatted()}</div>
        </div>
        <button type="button" aria-label="Fach hinzufügen" onClick={() => setModal(true)} style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 16px ${ACCENT}55`, marginTop: 6 }}>
          <Icon name="plus" size={18} color="#050508" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '12px 18px 0', animation: 'fadeUp 0.42s 0.07s cubic-bezier(0.22,1,0.36,1) both' }}>
        {[
          { bg: 'linear-gradient(135deg,#1a2a5e,#0d1a3a)', bd: 'rgba(100,140,255,0.18)', icon: 'medal' as const, c: ACCENT, val: avg, lbl: 'Ø Schnitt' },
          { bg: 'linear-gradient(135deg,#0e2a1e,#081810)', bd: 'rgba(60,220,130,0.15)', icon: 'chart' as const, c: GREEN, val: improvement, lbl: 'Verbesserung' },
        ].map((card, index) => (
          <div key={index} style={{ flex: 1, background: card.bg, borderRadius: CARD_RADIUS, padding: 16, border: `1px solid ${card.bd}`, minWidth: 0 }}>
            <Icon name={card.icon} size={18} color={card.c} />
            <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -1, marginTop: 6 }}>{card.val}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{card.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 18px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Fächer - Note tippen zum Bearbeiten</div>
        {loading && (
          <div style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.42)', fontSize: 13, fontWeight: 700 }}>
            Fächer werden geladen...
          </div>
        )}
        {!loading && error && (
          <div style={{ background: 'rgba(255,82,82,0.1)', borderRadius: CARD_RADIUS, padding: 16, border: '1px solid rgba(255,82,82,0.18)', color: '#FF7A7A', fontSize: 12, fontWeight: 700 }}>
            {error}
          </div>
        )}
        {!loading && !error && subjects.length === 0 && (
          <div style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.45, fontWeight: 600 }}>
            Noch keine Fächer. Tippe auf Plus und lege dein erstes Fach an.
          </div>
        )}
        {!loading && subjects.map((sub, index) => {
          const gradeColor = sub.grade <= 2 ? GREEN : sub.grade <= 2.7 ? '#FF6B2B' : '#FF5252';
          const progress = sub.total > 0 ? (sub.done / sub.total) * 100 : 0;

          return (
            <div key={sub.id} style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: '13px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, animation: `slideLeft 0.38s ${0.08 + 0.06 * index}s cubic-bezier(0.22,1,0.36,1) both` }}>
              <div style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, background: `${sub.color}18`, border: `1.5px solid ${sub.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="school" size={17} color={sub.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f8', letterSpacing: -0.2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</div>

                  {editingGrade === sub.name
                    ? <select
                        autoFocus
                        value={sub.grade}
                        onChange={event => { void updateGrade(sub.name, parseFloat(event.target.value)); setEditingGrade(null); }}
                        onBlur={() => setEditingGrade(null)}
                        style={{ background: '#1e1e2e', border: `1px solid ${gradeColor}60`, borderRadius: 8, color: gradeColor, fontSize: 16, fontWeight: 800, padding: '2px 6px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
                      >
                        {GRADES.map(item => <option key={item} value={item}>{item.toFixed(1)}</option>)}
                      </select>
                    : <button type="button" onClick={() => setEditingGrade(sub.name)} style={{ fontSize: 14, fontWeight: 800, color: gradeColor, background: `${gradeColor}18`, borderRadius: 8, padding: '2px 9px', border: `1px solid ${gradeColor}30`, cursor: 'pointer', fontFamily: 'inherit' }}>{sub.grade.toFixed(1)}</button>
                  }
                </div>

                {editingNext === sub.name
                  ? <input
                      autoFocus
                      value={nextVal}
                      onChange={event => setNextVal(event.target.value)}
                      onBlur={() => { void updateNext(sub.name, nextVal || sub.next); setEditingNext(null); }}
                      onKeyDown={event => { if (event.key === 'Enter') { void updateNext(sub.name, nextVal || sub.next); setEditingNext(null); } }}
                      style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', background: '#0e0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 6px', outline: 'none', fontFamily: 'inherit', marginTop: 2, width: '100%', boxSizing: 'border-box' }}
                    />
                  : <button type="button" onClick={() => { setEditingNext(sub.name); setNextVal(sub.next); }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2, cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, fontFamily: 'inherit', textAlign: 'left', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Termin: {sub.next}</button>
                }

                <div style={{ marginTop: 7 }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: sub.color, transition: 'width 1s cubic-bezier(0.34,1.05,0.64,1)' }} />
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 3, fontWeight: 700, letterSpacing: 1 }}>{sub.done}/{sub.total} AUFGABEN</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && <AddSubjectModal onAdd={addSubject} onClose={() => setModal(false)} />}
    </div>
  );
};
