import { useState, useCallback } from 'react';
import { fetchBookByISBN } from '../services/openBDApi';
import type { Book } from '../types/book';

export function useBookAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBook = useCallback(async (isbn: string): Promise<Book | null> => {
    try {
      setLoading(true);
      setError(null);
      const book = await fetchBookByISBN(isbn);
      return book;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '書籍情報の取得に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchBook,
    loading,
    error,
  };
}
