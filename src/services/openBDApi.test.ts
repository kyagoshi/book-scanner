import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchBookByISBN } from './openBDApi';

// globalFetchをモック
globalThis.fetch = vi.fn();

describe('openBDApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchBookByISBN', () => {
    it('should fetch and parse book data successfully', async () => {
      const mockResponse = [
        {
          summary: {
            isbn: '9784873119038',
            title: 'リファクタリング 既存のコードを安全に改善する（第2版）',
            author: 'Martin Fowler',
            publisher: 'オライリー・ジャパン',
            pubdate: '2019-12',
            cover: 'https://example.com/cover.jpg',
          },
          onix: {
            DescriptiveDetail: {
              Contributor: [
                { PersonName: { content: 'マーチン・ファウラー' } },
              ],
            },
          },
        },
      ];

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const promise = fetchBookByISBN('9784873119038');
      const book = await promise;

      expect(book).toBeDefined();
      expect(book?.isbn).toBe('9784873119038');
      expect(book?.title).toBe('リファクタリング 既存のコードを安全に改善する（第2版）');
      expect(book?.publisher).toBe('オライリー・ジャパン');
      expect(book?.authors).toContain('Martin Fowler');
    });

    it('should return null when book is not found', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [null],
      });

      const book = await fetchBookByISBN('9999999999999');

      expect(book).toBeNull();
    });

    it('should handle network errors with retry', async () => {
      (globalThis.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              summary: {
                isbn: '9784873119038',
                title: 'Test Book',
                author: 'Test Author',
                publisher: 'Test Publisher',
                pubdate: '2020-01',
                cover: '',
              },
            },
          ],
        });

      const book = await fetchBookByISBN('9784873119038');

      expect(book).toBeDefined();
      expect(book?.title).toBe('Test Book');
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should throw error after max retries', async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(fetchBookByISBN('9784873119038')).rejects.toThrow();
      expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    }, 10000);
  });
});
