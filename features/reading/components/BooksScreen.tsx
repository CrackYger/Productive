import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { todayFormatted } from '../../../utils/date';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';
import { useBooks } from '../../../hooks/useBooks';
import { useSettings } from '../../../hooks/useSettings';
import type { AddBookInput } from '../../../hooks/useBooks';

const COLORS = ['#FF6B2B', ACCENT, GREEN, '#FF5252', '#c084fc', '#FFD700'];

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
  boxSizing: 'border-box',
};

const AddBookModal: React.FC<{ onAdd: (input: AddBookInput) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    const pageCount = parseInt(pages, 10);
    if (!title.trim() || !pageCount || pageCount < 1) return;
    onAdd({ title: title.trim(), author: author.trim() || 'Unbekannt', pages: pageCount, color });
    onClose();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ width: '100%', background: '#12121e', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(40px + env(safe-area-inset-bottom, 0px))', animation: 'sheetUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }} onClick={event => event.stopPropagation()}>
        <div style={{ width: 38, height: 4, background: 'rgba(255,255,255,0.14)', borderRadius: 99, margin: '0 auto 18px' }} />
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: -0.3 }}>Neues Buch</div>

        <input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="Titel..." style={INPUT} />
        <input value={author} onChange={event => setAuthor(event.target.value)} placeholder="Autor (optional)" style={INPUT} />
        <input value={pages} onChange={event => setPages(event.target.value)} placeholder="Seitenanzahl" type="number" min={1} inputMode="numeric" style={INPUT} onKeyDown={event => event.key === 'Enter' && submit()} />

        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Farbe</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {COLORS.map(item => (
            <button key={item} type="button" aria-label={`Farbe ${item}`} onClick={() => setColor(item)} style={{ width: 32, height: 32, borderRadius: 10, background: item, border: color === item ? '2.5px solid #fff' : '2.5px solid transparent', cursor: 'pointer', flexShrink: 0, transition: 'border 0.15s ease' }} />
          ))}
        </div>

        <button type="button" onClick={submit} style={{ width: '100%', padding: 14, borderRadius: 15, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', color: '#050508', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 22px ${ACCENT}50` }}>
          Hinzufügen
        </button>
      </div>
    </div>
  );
};

export const BooksScreen: React.FC = () => {
  const { books, loading, error, updatePage, addBook, removeBook } = useBooks();
  const { settings } = useSettings();
  const [sel, setSel] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editPage, setEditPage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const totalPages = books.reduce((sum, book) => sum + book.cur, 0);
  const booksRead = books.filter(book => book.cur >= book.pages && book.pages > 0).length;
  const yearlyGoal = settings.yearlyBookGoal;
  const pagesPerDay = settings.dailyPagesGoal;

  const startEditPage = (id: string, cur: number) => {
    setEditing(id);
    setEditPage(String(cur));
  };

  const commitPage = (id: string, pages: number) => {
    const value = parseInt(editPage, 10);
    if (!Number.isNaN(value)) void updatePage(id, Math.min(value, pages));
    setEditing(null);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
      <div style={{ padding: 'max(50px, env(safe-area-inset-top)) 18px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', animation: 'fadeDown 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.8 }}>Bücher</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{todayFormatted()}</div>
        </div>
        <button type="button" aria-label="Buch hinzufügen" onClick={() => setModal(true)} style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 16px ${ACCENT}55`, marginTop: 6 }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}><path d="M12 5v14M5 12h14" stroke="#050508" strokeWidth="2.2" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div style={{ padding: '12px 18px 0', animation: 'fadeUp 0.42s 0.07s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ background: 'linear-gradient(135deg,#1a2a5e,#0d1a3a)', borderRadius: 18, padding: 16, border: '1px solid rgba(100,140,255,0.18)', boxShadow: '0 4px 28px rgba(30,60,200,0.22)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Jahresziel</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginTop: 2 }}>{yearlyGoal} Bücher</div>
            </div>
            <div style={{ background: `${ACCENT}22`, borderRadius: 10, padding: '6px 12px', border: `1px solid ${ACCENT}38`, flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT }}>{booksRead} / {yearlyGoal}</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((booksRead / yearlyGoal) * 100, 100)}%`, borderRadius: 99, background: `linear-gradient(90deg,#3060dd,${ACCENT})`, transition: 'width 1.2s cubic-bezier(0.34,1.05,0.64,1)' }} />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 7, fontWeight: 600 }}>{totalPages} Seiten gelesen gesamt</div>
        </div>
      </div>

      <div style={{ padding: '12px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <div style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.42)', fontSize: 13, fontWeight: 700 }}>
            Bücher werden geladen...
          </div>
        )}
        {!loading && error && (
          <div style={{ background: 'rgba(255,82,82,0.1)', borderRadius: CARD_RADIUS, padding: 16, border: '1px solid rgba(255,82,82,0.18)', color: '#FF7A7A', fontSize: 12, fontWeight: 700 }}>
            {error}
          </div>
        )}
        {!loading && !error && books.length === 0 && (
          <div style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: 16, border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.45, fontWeight: 600 }}>
            Noch keine Bücher. Füge dein aktuelles Buch hinzu und tracke den Lesestand.
          </div>
        )}
        {!loading && books.map((book, index) => {
          const progress = book.pages > 0 ? Math.round((book.cur / book.pages) * 100) : 0;
          const isOpen = sel === book.id;
          const remainingPages = Math.max(book.pages - book.cur, 0);

          return (
            <div key={book.id} onClick={() => setSel(isOpen ? null : book.id)}
              style={{ background: '#12121e', borderRadius: CARD_RADIUS, padding: 14, border: `1px solid ${isOpen ? `${book.color}40` : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.24s cubic-bezier(0.22,1,0.36,1)', animation: `slideLeft 0.4s ${0.08 + 0.07 * index}s cubic-bezier(0.22,1,0.36,1) both`, transform: isOpen ? 'scale(1.01)' : 'scale(1)', boxShadow: isOpen ? '0 8px 28px rgba(0,0,0,0.4)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 62, borderRadius: 10, flexShrink: 0, background: `linear-gradient(145deg,${book.color}28,${book.color}0a)`, border: `1.5px solid ${book.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="book" size={20} color={book.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f8', letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 600 }}>{book.cur}/{book.pages} S.</span>
                      <span style={{ fontSize: 10, color: book.color, fontWeight: 800 }}>{progress}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: book.color, transition: 'width 1s cubic-bezier(0.34,1.05,0.64,1)', boxShadow: `0 0 8px ${book.color}80` }} />
                    </div>
                  </div>
                </div>
                <Icon name="chevron" size={16} color="rgba(255,255,255,0.2)" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.24s cubic-bezier(0.34,1.56,0.64,1)' }} />
              </div>

              {isOpen && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'expandDown 0.26s cubic-bezier(0.22,1,0.36,1) both' }} onClick={event => event.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', flex: 1 }}>Aktuelle Seite</div>
                    <button type="button" onClick={() => void updatePage(book.id, book.cur - 10)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    {editing === book.id
                      ? <input
                          autoFocus
                          value={editPage}
                          onChange={event => setEditPage(event.target.value)}
                          onBlur={() => commitPage(book.id, book.pages)}
                          onKeyDown={event => { if (event.key === 'Enter') commitPage(book.id, book.pages); event.stopPropagation(); }}
                          style={{ width: 56, textAlign: 'center', background: '#0e0e1a', border: `1px solid ${book.color}60`, borderRadius: 8, padding: '4px 6px', fontSize: 16, color: '#fff', outline: 'none', fontFamily: 'inherit' }}
                          type="number"
                          min={0}
                          max={book.pages}
                          inputMode="numeric"
                        />
                      : <button type="button" onClick={() => startEditPage(book.id, book.cur)} style={{ minWidth: 56, height: 28, borderRadius: 8, background: '#0e0e1a', border: `1px solid ${book.color}40`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: '0 6px' }}>{book.cur}</button>
                    }
                    <button type="button" onClick={() => void updatePage(book.id, book.cur + 10)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { label: 'Verbleibend', value: `${remainingPages} S.`, icon: 'clock' as const },
                      { label: 'Seiten/Tag', value: String(pagesPerDay), icon: 'bolt' as const },
                      { label: 'Tage', value: `${Math.ceil(remainingPages / pagesPerDay)}d`, icon: 'target' as const },
                    ].map(stat => (
                      <div key={stat.label} style={{ flex: 1, background: '#0e0e18', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', minWidth: 0 }}>
                        <Icon name={stat.icon} size={13} color={book.color} />
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 4 }}>{stat.value}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={() => { setSel(null); void removeBook(book.id); }} style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 10, background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.18)', color: '#FF5252', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Buch entfernen
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && <AddBookModal onAdd={addBook} onClose={() => setModal(false)} />}
    </div>
  );
};
