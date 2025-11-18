import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import type { Book } from '../types/book';

export function useBookStorage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 書籍リストを読み込み
  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const allBooks = await db.books.orderBy('addedAt').reverse().toArray();
      setBooks(allBooks);
      setError(null);
    } catch (err) {
      setError('書籍の読み込みに失敗しました');
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 書籍を追加
  const addBook = useCallback(async (book: Book): Promise<boolean> => {
    try {
      // 既存チェック
      const existing = await db.books.where('isbn').equals(book.isbn).first();
      if (existing) {
        return false; // 既に存在
      }

      await db.books.add(book);
      await loadBooks(); // リストを再読み込み
      return true;
    } catch (err) {
      console.error('Failed to add book:', err);
      throw err;
    }
  }, [loadBooks]);

  // 書籍を削除
  const removeBook = useCallback(async (isbn: string): Promise<void> => {
    try {
      await db.books.where('isbn').equals(isbn).delete();
      await loadBooks();
    } catch (err) {
      console.error('Failed to remove book:', err);
      throw err;
    }
  }, [loadBooks]);

  // ISBNが既に存在するかチェック
  const isBookExists = useCallback(async (isbn: string): Promise<boolean> => {
    const existing = await db.books.where('isbn').equals(isbn).first();
    return !!existing;
  }, []);

  // 全書籍を削除
  const clearAllBooks = useCallback(async (): Promise<void> => {
    try {
      await db.books.clear();
      await loadBooks();
    } catch (err) {
      console.error('Failed to clear books:', err);
      throw err;
    }
  }, [loadBooks]);

  return {
    books,
    loading,
    error,
    addBook,
    removeBook,
    isBookExists,
    clearAllBooks,
    reload: loadBooks,
  };
}
