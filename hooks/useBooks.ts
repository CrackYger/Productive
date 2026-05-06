import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requireSupabase } from '../services/supabaseClient';

export interface BookEntry {
  id: string;
  title: string;
  author: string;
  pages: number;
  cur: number;
  color: string;
  coverUrl?: string;
}

export interface AddBookInput {
  title: string;
  author: string;
  pages: number;
  color: string;
  coverUrl?: string;
}

interface BookRow {
  id: string;
  title: string;
  author: string;
  pages: number;
  current_page: number;
  color: string;
  cover_url: string | null;
}

const mapBook = (row: BookRow): BookEntry => ({
  id: row.id,
  title: row.title,
  author: row.author,
  pages: row.pages,
  cur: row.current_page,
  color: row.color,
  coverUrl: row.cover_url ?? undefined,
});

const BOOK_COLUMNS = 'id,title,author,pages,current_page,color,cover_url';

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    if (!user) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = requireSupabase();
      const { data, error: queryError } = await db
        .from('productive_books')
        .select(BOOK_COLUMNS)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      setBooks(((data ?? []) as BookRow[]).map(mapBook));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bücher konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  const updatePage = useCallback(async (id: string, cur: number) => {
    const current = books.find(book => book.id === id);
    if (!current || !user) return;

    const nextPage = Math.max(0, Math.min(cur, current.pages));
    setBooks(items => items.map(book => (book.id === id ? { ...book, cur: nextPage } : book)));

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_books')
        .update({ current_page: nextPage })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lesestand konnte nicht gespeichert werden.');
      setBooks(items => items.map(book => (book.id === id ? current : book)));
    }
  }, [books, user]);

  const addPages = useCallback(async (id: string, delta: number) => {
    const current = books.find(book => book.id === id);
    if (!current || !user || delta === 0) return;
    await updatePage(id, current.cur + delta);
  }, [books, user, updatePage]);

  const addBook = useCallback(async (input: AddBookInput) => {
    if (!user) return;

    const book: BookEntry = { id: crypto.randomUUID(), ...input, cur: 0 };
    setBooks(items => [...items, book]);

    try {
      const db = requireSupabase();
      const { error: insertError } = await db.from('productive_books').insert({
        id: book.id,
        user_id: user.id,
        title: book.title,
        author: book.author,
        pages: book.pages,
        current_page: book.cur,
        color: book.color,
        cover_url: book.coverUrl ?? null,
      });

      if (insertError) throw insertError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buch konnte nicht erstellt werden.');
      setBooks(items => items.filter(item => item.id !== book.id));
    }
  }, [user]);

  const removeBook = useCallback(async (id: string) => {
    const current = books.find(book => book.id === id);
    if (!current || !user) return;

    setBooks(items => items.filter(book => book.id !== id));

    try {
      const db = requireSupabase();
      const { error: deleteError } = await db
        .from('productive_books')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buch konnte nicht entfernt werden.');
      setBooks(items => [...items, current]);
    }
  }, [books, user]);

  const updateBook = useCallback(async (id: string, input: Partial<AddBookInput>) => {
    const current = books.find(b => b.id === id);
    if (!current || !user) return;

    const next: BookEntry = {
      ...current,
      title: input.title ?? current.title,
      author: input.author ?? current.author,
      pages: input.pages ?? current.pages,
      color: input.color ?? current.color,
      coverUrl: 'coverUrl' in input ? input.coverUrl : current.coverUrl,
    };
    setBooks(items => items.map(b => b.id === id ? next : b));

    try {
      const db = requireSupabase();
      const { error: updateError } = await db
        .from('productive_books')
        .update({
          title: next.title,
          author: next.author,
          pages: next.pages,
          color: next.color,
          cover_url: next.coverUrl ?? null,
        })
        .eq('id', id)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buch konnte nicht gespeichert werden.');
      setBooks(items => items.map(b => b.id === id ? current : b));
    }
  }, [books, user]);

  return { books, loading, error, updatePage, addPages, addBook, updateBook, removeBook, reload: loadBooks };
}
