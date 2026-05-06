import React, { useEffect, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { todayFormatted } from '../../../utils/date';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';
import { useSchool } from '../../../hooks/useSchool';
import { useSubjectDetails } from '../../../hooks/useSubjectDetails';
import { useHideChromeWhileMounted } from '../../../contexts/UIChromeContext';
import type { SubjectEntry } from '../../../hooks/useSchool';

const COLORS = ['#FF6B2B', GREEN, ACCENT, '#c084fc', '#FF5252', '#FFD700'];

const INPUT: React.CSSProperties = {
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

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 10,
  color: 'rgba(255,255,255,0.42)',
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  marginBottom: 8,
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 10,
  color: 'rgba(255,255,255,0.38)',
  fontWeight: 700,
  letterSpacing: 1.3,
  textTransform: 'uppercase',
  marginBottom: 7,
};

interface SubjectModalProps {
  onAdd: (input: Omit<SubjectEntry, 'id'>) => void;
  onClose: () => void;
  initialSubject?: SubjectEntry;
  onUpdate?: (id: string, patch: Partial<Omit<SubjectEntry, 'id'>>) => void;
}

const SubjectModal: React.FC<SubjectModalProps> = ({ onAdd, onClose, initialSubject, onUpdate }) => {
  useHideChromeWhileMounted();
  const isEdit = !!initialSubject;

  const [name, setName] = useState(initialSubject?.name ?? '');
  const [grade, setGrade] = useState(initialSubject ? String(initialSubject.grade) : '2.0');
  const [next, setNext] = useState(initialSubject?.next ?? '');
  const [done, setDone] = useState(initialSubject ? String(initialSubject.done) : '0');
  const [total, setTotal] = useState(initialSubject ? String(initialSubject.total) : '1');
  const [color, setColor] = useState(initialSubject?.color ?? COLORS[0]);

  const submit = () => {
    const parsedGrade = parseFloat(grade);
    const parsedDone = Math.max(0, parseInt(done, 10) || 0);
    const parsedTotal = Math.max(parsedDone, parseInt(total, 10) || 0);
    if (!name.trim() || Number.isNaN(parsedGrade)) return;

    if (isEdit && onUpdate && initialSubject) {
      onUpdate(initialSubject.id, {
        name: name.trim(),
        grade: parsedGrade,
        next: next.trim() || initialSubject.next,
        color,
        done: parsedDone,
        total: parsedTotal,
      });
    } else {
      onAdd({
        name: name.trim(),
        grade: parsedGrade,
        next: next.trim() || 'Nächsten Termin eintragen',
        color,
        done: parsedDone,
        total: parsedTotal,
      });
    }
    onClose();
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: 16, animation: 'fadeIn 0.18s ease both' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 380, maxHeight: 'calc(100dvh - 64px)', background: 'linear-gradient(180deg,#15151f 0%,#0f0f18 100%)', borderRadius: 22, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalIn 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
        onClick={event => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{isEdit ? 'Fach bearbeiten' : 'Neues Fach'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>{isEdit ? 'Änderungen speichern.' : 'Mit Farbe und Fortschritt anlegen.'}</div>
          </div>
          <button type="button" aria-label="Schließen" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
            ×
          </button>
        </div>

        <div style={{ padding: '4px 18px 16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={FIELD_LABEL}>Fach</div>
            <input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Fachname" style={INPUT} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={FIELD_LABEL}>Nächster Termin</div>
            <input value={next} onChange={event => setNext(event.target.value)} placeholder="z.B. Klausur 12.05." style={INPUT} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Note & Fortschritt</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input value={grade} onChange={event => setGrade(event.target.value)} placeholder="Note" type="number" min={1} max={6} step={0.1} inputMode="decimal" style={INPUT} />
              <input value={done} onChange={event => setDone(event.target.value)} placeholder="Erledigt" type="number" min={0} inputMode="numeric" style={INPUT} />
              <input value={total} onChange={event => setTotal(event.target.value)} placeholder="Gesamt" type="number" min={0} inputMode="numeric" style={INPUT} />
            </div>
          </div>
          <div style={{ marginBottom: 4 }}>
            <div style={FIELD_LABEL}>Farbe</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(item => (
                <button key={item} type="button" aria-label={`Farbe ${item}`} onClick={() => setColor(item)} style={{ width: 32, height: 32, borderRadius: 10, background: item, border: color === item ? '2.5px solid #fff' : '2.5px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 18px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button type="button" onClick={submit} style={{ width: '100%', padding: 14, borderRadius: 15, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', color: '#050508', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 22px ${ACCENT}50` }}>
            {isEdit ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  );
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface SubjectDetailProps {
  subjectId: string;
  color: string;
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ subjectId, color }) => {
  const {
    homework, grades, absences,
    addHomework, toggleHomework, removeHomework,
    addGrade, removeGrade,
    addAbsence, toggleAbsenceExcused, removeAbsence,
  } = useSubjectDetails(subjectId);

  const [hwText, setHwText] = useState('');
  const [hwDue, setHwDue] = useState('');

  const [grLabel, setGrLabel] = useState('');
  const [grValue, setGrValue] = useState('');
  const [grType, setGrType] = useState<'exam' | 'quarterly'>('exam');
  const [grDate, setGrDate] = useState(todayIso());
  const [grOpen, setGrOpen] = useState(false);

  const [absDate, setAbsDate] = useState(todayIso());
  const [absHours, setAbsHours] = useState('1');
  const [absOpen, setAbsOpen] = useState(false);

  useEffect(() => {
    setHwText('');
    setHwDue('');
    setGrLabel('');
    setGrValue('');
    setGrType('exam');
    setGrDate(todayIso());
    setGrOpen(false);
    setAbsDate(todayIso());
    setAbsHours('1');
    setAbsOpen(false);
  }, [subjectId]);

  const submitHw = () => {
    if (!hwText.trim()) return;
    void addHomework(hwText.trim(), hwDue || undefined);
    setHwText('');
    setHwDue('');
  };

  const submitGrade = () => {
    const val = parseFloat(grValue);
    if (!grLabel.trim() || Number.isNaN(val)) return;
    void addGrade(grLabel.trim(), val, grType, grDate);
    setGrLabel('');
    setGrValue('');
    setGrType('exam');
    setGrDate(todayIso());
    setGrOpen(false);
  };

  const submitAbsence = () => {
    const h = parseInt(absHours, 10);
    if (!absDate || !h || h < 1) return;
    void addAbsence(absDate, h);
    setAbsDate(todayIso());
    setAbsHours('1');
    setAbsOpen(false);
  };

  const examGrades = grades.filter(g => g.type === 'exam');
  const quarterlyGrades = grades.filter(g => g.type === 'quarterly');
  const totalAbsHours = absences.reduce((sum, a) => sum + a.hours, 0);
  const excusedHours = absences.filter(a => a.excused).reduce((sum, a) => sum + a.hours, 0);

  const inlineInput: React.CSSProperties = {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 9,
    padding: '7px 10px',
    fontSize: 13,
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    minWidth: 0,
  };

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'expandDown 0.26s cubic-bezier(0.22,1,0.36,1) both' }} onClick={event => event.stopPropagation()}>

      {/* ── Hausaufgaben ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={SECTION_TITLE}>Hausaufgaben</div>
        {homework.length === 0 && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 600, marginBottom: 8 }}>Keine Hausaufgaben.</div>
        )}
        {homework.map(hw => (
          <div key={hw.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => void toggleHomework(hw.id)}
              style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',
                background: hw.done ? color : 'transparent',
                border: `2px solid ${hw.done ? color : 'rgba(255,255,255,0.22)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {hw.done && <svg viewBox="0 0 10 8" fill="none" style={{ width: 10, height: 10 }}><path d="M1 4l3 3 5-6" stroke="#050508" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: hw.done ? 'rgba(255,255,255,0.38)' : '#e8e8f0', fontWeight: 600, textDecoration: hw.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{hw.title}</span>
              {hw.due_date && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{hw.due_date}</span>}
            </div>
            <button type="button" onClick={() => void removeHomework(hw.id)} style={{ width: 22, height: 22, borderRadius: 6, background: 'transparent', border: 'none', color: 'rgba(255,82,82,0.55)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <input value={hwText} onChange={event => setHwText(event.target.value)} onKeyDown={event => event.key === 'Enter' && submitHw()} placeholder="Neue Hausaufgabe..." style={inlineInput} />
          <input value={hwDue} onChange={event => setHwDue(event.target.value)} type="date" style={{ ...inlineInput, flex: '0 0 120px', fontSize: 12 }} />
          <button type="button" onClick={submitHw} disabled={!hwText.trim()} style={{ width: 30, height: 30, borderRadius: 8, background: hwText.trim() ? color : 'rgba(255,255,255,0.06)', border: 'none', color: hwText.trim() ? '#050508' : 'rgba(255,255,255,0.3)', cursor: hwText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s ease' }}>+</button>
        </div>
      </div>

      {/* ── Noten ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div style={SECTION_TITLE}>Noten</div>
          <button type="button" onClick={() => setGrOpen(v => !v)} style={{ fontSize: 10, fontWeight: 700, color: grOpen ? color : 'rgba(255,255,255,0.42)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5 }}>{grOpen ? 'Abbrechen' : '+ Note'}</button>
        </div>

        {examGrades.length === 0 && quarterlyGrades.length === 0 && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 600, marginBottom: 8 }}>Keine Noten eingetragen.</div>
        )}

        {examGrades.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>Klausuren</div>
            {examGrades.map(g => {
              const gc = g.grade <= 2 ? GREEN : g.grade <= 2.7 ? '#FF6B2B' : '#FF5252';
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: gc, minWidth: 28, flexShrink: 0 }}>{g.grade.toFixed(1)}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, flexShrink: 0 }}>{g.date}</span>
                  <button type="button" onClick={() => void removeGrade(g.id)} style={{ width: 22, height: 22, borderRadius: 6, background: 'transparent', border: 'none', color: 'rgba(255,82,82,0.55)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {quarterlyGrades.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>Quartalsnoten</div>
            {quarterlyGrades.map(g => {
              const gc = g.grade <= 2 ? GREEN : g.grade <= 2.7 ? '#FF6B2B' : '#FF5252';
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: gc, minWidth: 28, flexShrink: 0 }}>{g.grade.toFixed(1)}</span>
                  <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, flexShrink: 0 }}>{g.date}</span>
                  <button type="button" onClick={() => void removeGrade(g.id)} style={{ width: 22, height: 22, borderRadius: 6, background: 'transparent', border: 'none', color: 'rgba(255,82,82,0.55)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {grOpen && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 10px 8px', border: '1px solid rgba(255,255,255,0.07)', marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input value={grLabel} onChange={event => setGrLabel(event.target.value)} placeholder="Bezeichnung" style={{ ...inlineInput, flex: 2 }} />
              <input value={grValue} onChange={event => setGrValue(event.target.value)} placeholder="Note" type="number" min={1} max={6} step={0.1} inputMode="decimal" style={{ ...inlineInput, flex: '0 0 64px' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <button type="button" onClick={() => setGrType('exam')} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: `1.5px solid ${grType === 'exam' ? color : 'rgba(255,255,255,0.08)'}`, background: grType === 'exam' ? `${color}1f` : 'transparent', color: grType === 'exam' ? color : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Klausur</button>
              <button type="button" onClick={() => setGrType('quarterly')} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: `1.5px solid ${grType === 'quarterly' ? color : 'rgba(255,255,255,0.08)'}`, background: grType === 'quarterly' ? `${color}1f` : 'transparent', color: grType === 'quarterly' ? color : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Quartalsnote</button>
              <input value={grDate} onChange={event => setGrDate(event.target.value)} type="date" style={{ ...inlineInput, flex: '0 0 130px', fontSize: 12 }} />
            </div>
            <button type="button" onClick={submitGrade} disabled={!grLabel.trim() || !grValue} style={{ width: '100%', padding: '7px', borderRadius: 8, background: (grLabel.trim() && grValue) ? color : 'rgba(255,255,255,0.06)', border: 'none', color: (grLabel.trim() && grValue) ? '#050508' : 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 800, cursor: (grLabel.trim() && grValue) ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s ease' }}>Note speichern</button>
          </div>
        )}
      </div>

      {/* ── Fehlstunden ── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <div style={{ ...SECTION_TITLE, marginBottom: 0 }}>
            Fehlstunden
            {totalAbsHours > 0 && <span style={{ marginLeft: 6, fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}>{excusedHours}/{totalAbsHours} entsch.</span>}
          </div>
          <button type="button" onClick={() => setAbsOpen(v => !v)} style={{ fontSize: 10, fontWeight: 700, color: absOpen ? color : 'rgba(255,255,255,0.42)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.5 }}>{absOpen ? 'Abbrechen' : '+ Fehlstunde'}</button>
        </div>

        {absences.length === 0 && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 600, marginBottom: 8 }}>Keine Fehlstunden.</div>
        )}
        {absences.map(ab => (
          <div key={ab.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ab.date}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 700, flexShrink: 0 }}>{ab.hours} Std.</span>
            <button
              type="button"
              onClick={() => void toggleAbsenceExcused(ab.id)}
              style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s ease',
                background: ab.excused ? `${GREEN}1f` : 'rgba(255,82,82,0.1)',
                border: `1px solid ${ab.excused ? `${GREEN}40` : 'rgba(255,82,82,0.25)'}`,
                color: ab.excused ? GREEN : '#FF7A7A',
              }}
            >
              {ab.excused ? 'entsch.' : 'unentsch.'}
            </button>
            <button type="button" onClick={() => void removeAbsence(ab.id)} style={{ width: 22, height: 22, borderRadius: 6, background: 'transparent', border: 'none', color: 'rgba(255,82,82,0.55)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
          </div>
        ))}

        {absOpen && (
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 10px 8px', border: '1px solid rgba(255,255,255,0.07)', marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input value={absDate} onChange={event => setAbsDate(event.target.value)} type="date" style={{ ...inlineInput, flex: 2, fontSize: 13 }} />
              <input value={absHours} onChange={event => setAbsHours(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Std." inputMode="numeric" style={{ ...inlineInput, flex: '0 0 64px' }} />
            </div>
            <button type="button" onClick={submitAbsence} style={{ width: '100%', padding: '7px', borderRadius: 8, background: color, border: 'none', color: '#050508', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Fehlstunde eintragen</button>
          </div>
        )}
      </div>
    </div>
  );
};

export const SchuleScreen: React.FC = () => {
  const { subjects, loading, error, addSubject, updateSubject, removeSubject } = useSchool();
  const [sel, setSel] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectEntry | null>(null);

  const avgNumber = subjects.length ? subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length : 0;
  const avg = subjects.length ? avgNumber.toFixed(1) : '-';
  const bestPrev = 2.3;
  const improvementNumber = subjects.length ? bestPrev - avgNumber : 0;
  const improvement = subjects.length ? `${improvementNumber > 0 ? '+' : ''}${improvementNumber.toFixed(1)}` : '-';

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
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
          const isOpen = sel === sub.id;

          return (
            <div
              key={sub.id}
              style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: '13px 14px', border: `1px solid ${isOpen ? `${sub.color}35` : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.24s cubic-bezier(0.22,1,0.36,1)', animation: `slideLeft 0.38s ${0.08 + 0.06 * index}s cubic-bezier(0.22,1,0.36,1) both`, boxShadow: isOpen ? '0 6px 24px rgba(0,0,0,0.35)' : 'none' }}
              onClick={() => setSel(isOpen ? null : sub.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, background: `${sub.color}18`, border: `1.5px solid ${sub.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="school" size={17} color={sub.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f8', letterSpacing: -0.2, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: gradeColor, background: `${gradeColor}18`, borderRadius: 8, padding: '2px 9px', border: `1px solid ${gradeColor}30`, flexShrink: 0 }}>{sub.grade.toFixed(1)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Termin: {sub.next}</div>
                  <div style={{ marginTop: 6 }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: sub.color, transition: 'width 1s cubic-bezier(0.34,1.05,0.64,1)' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginTop: 3, fontWeight: 700, letterSpacing: 1 }}>{sub.done}/{sub.total} AUFGABEN</div>
                  </div>
                </div>
                <Icon name="chevron" size={16} color="rgba(255,255,255,0.2)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.24s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }} />
              </div>

              {isOpen && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 2 }} onClick={event => event.stopPropagation()}>
                    <button type="button" onClick={() => setEditSubject(sub)} style={{ flex: 1, padding: '7px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Bearbeiten</button>
                    <button type="button" onClick={() => { setSel(null); void removeSubject(sub.id); }} style={{ flex: 1, padding: '7px', borderRadius: 9, background: 'rgba(255,82,82,0.07)', border: '1px solid rgba(255,82,82,0.16)', color: '#FF7A7A', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Löschen</button>
                  </div>
                  <SubjectDetail subjectId={sub.id} color={sub.color} />
                </>
              )}
            </div>
          );
        })}
      </div>

      {modal && <SubjectModal onAdd={addSubject} onClose={() => setModal(false)} />}
      {editSubject && (
        <SubjectModal
          onAdd={addSubject}
          initialSubject={editSubject}
          onUpdate={(id, patch) => { void updateSubject(id, patch); }}
          onClose={() => setEditSubject(null)}
        />
      )}
    </div>
  );
};
