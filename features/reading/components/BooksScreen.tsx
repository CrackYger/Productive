import React, { useRef, useState } from 'react';
import { Icon } from '../../../components/Icon';
import { todayFormatted } from '../../../utils/date';
import { ACCENT, GREEN, CARD_RADIUS } from '../../../constants/theme';
import { useBooks } from '../../../hooks/useBooks';
import { useSettings } from '../../../hooks/useSettings';
import { useHideChromeWhileMounted } from '../../../contexts/UIChromeContext';
import type { AddBookInput } from '../../../hooks/useBooks';

const COLORS = ['#FF6B2B', ACCENT, GREEN, '#FF5252', '#c084fc', '#FFD700'];

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 10,
  color: 'rgba(255,255,255,0.42)',
  fontWeight: 700,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  marginBottom: 8,
};

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

const COVER_MAX_BYTES = 1_400_000; // ~1.4MB raw image budget after resize

async function fileToCoverDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Datei konnte nicht gelesen werden.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'));
    img.src = dataUrl;
  });

  const maxSide = 480;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.85;
  let result = canvas.toDataURL('image/jpeg', quality);
  while (result.length > COVER_MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    result = canvas.toDataURL('image/jpeg', quality);
  }
  return result;
}

const AddBookModal: React.FC<{ onAdd: (input: AddBookInput) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  useHideChromeWhileMounted();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const handleCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCoverError('Bitte wähle eine Bilddatei.');
      return;
    }
    try {
      const dataUrl = await fileToCoverDataUrl(file);
      setCoverUrl(dataUrl);
      setCoverError(null);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Bild konnte nicht verarbeitet werden.');
    }
  };

  const submit = () => {
    const pageCount = parseInt(pages, 10);
    if (!title.trim() || !pageCount || pageCount < 1) return;
    onAdd({ title: title.trim(), author: author.trim() || 'Unbekannt', pages: pageCount, color, coverUrl });
    onClose();
  };

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
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>Neues Buch</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>Lege ein neues Buch in deiner Bibliothek an.</div>
          </div>
          <button type="button" aria-label="Schließen" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
            ×
          </button>
        </div>

        <div style={{ padding: '4px 18px 16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Cover</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                style={{
                  width: 80,
                  height: 104,
                  borderRadius: 12,
                  border: `1.5px dashed ${coverUrl ? 'transparent' : 'rgba(255,255,255,0.18)'}`,
                  background: coverUrl ? '#0c0c16' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)' }}>
                    <Icon name="plus" size={18} color="rgba(255,255,255,0.55)" />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6 }}>Foto</span>
                  </div>
                )}
              </button>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {coverUrl ? 'Anderes Foto' : 'Foto wählen'}
                </button>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl(undefined)}
                    style={{ padding: '8px 12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,82,82,0.2)', color: '#FF7A7A', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Foto entfernen
                  </button>
                )}
                {coverError && <div style={{ fontSize: 11, color: '#FF7A7A', fontWeight: 600 }}>{coverError}</div>}
              </div>
              <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={event => void handleCover(event)} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={FIELD_LABEL}>Titel</div>
            <input autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="Buchtitel" style={INPUT} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={FIELD_LABEL}>Autor</div>
            <input value={author} onChange={event => setAuthor(event.target.value)} placeholder="Autor (optional)" style={INPUT} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={FIELD_LABEL}>Seitenanzahl</div>
            <input value={pages} onChange={event => setPages(event.target.value.replace(/[^0-9]/g, ''))} placeholder="z.B. 320" inputMode="numeric" style={INPUT} onKeyDown={event => event.key === 'Enter' && submit()} />
          </div>

          <div style={{ marginBottom: 4 }}>
            <div style={FIELD_LABEL}>Farbe</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(item => (
                <button key={item} type="button" aria-label={`Farbe ${item}`} onClick={() => setColor(item)} style={{ width: 32, height: 32, borderRadius: 10, background: item, border: color === item ? '2.5px solid #fff' : '2.5px solid transparent', cursor: 'pointer', flexShrink: 0, transition: 'border 0.15s ease' }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 18px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button type="button" onClick={submit} style={{ width: '100%', padding: 14, borderRadius: 15, background: `linear-gradient(135deg,${ACCENT},#008888)`, border: 'none', color: '#050508', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 6px 22px ${ACCENT}50` }}>
            Hinzufügen
          </button>
        </div>
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
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
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
                {book.coverUrl ? (
                  <div style={{ width: 48, height: 62, borderRadius: 10, flexShrink: 0, overflow: 'hidden', border: `1.5px solid ${book.color}35`, boxShadow: '0 4px 14px rgba(0,0,0,0.32)' }}>
                    <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: 48, height: 62, borderRadius: 10, flexShrink: 0, background: `linear-gradient(145deg,${book.color}28,${book.color}0a)`, border: `1.5px solid ${book.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="book" size={20} color={book.color} />
                  </div>
                )}
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
                  {book.coverUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                      <div style={{ width: 130, height: 184, borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', border: `1px solid ${book.color}30` }}>
                        <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    </div>
                  )}

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
