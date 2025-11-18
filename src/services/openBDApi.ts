import type { OpenBDResponse, OpenBDBook } from '../types/openBD';
import type { Book } from '../types/book';
import { API_CONFIG } from '../utils/constants';
import { APIRateLimiter } from './apiRateLimiter';

const rateLimiter = new APIRateLimiter(API_CONFIG.MIN_INTERVAL);

/**
 * リトライ付きfetch
 */
async function fetchWithRetry(
  url: string,
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status < 500) {
        return response;
      }

      // 5xxエラーはリトライ
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * OpenBD APIから書籍情報を取得
 */
export async function fetchBookByISBN(isbn: string): Promise<Book | null> {
  return rateLimiter.enqueue(async () => {
    const url = `${API_CONFIG.OPENBD_BASE_URL}/get?isbn=${isbn}`;

    try {
      const response = await fetchWithRetry(url);
      const data: OpenBDResponse = await response.json();

      if (!data || data.length === 0 || data[0] === null) {
        return null;
      }

      const bookData = data[0];
      return parseOpenBDBook(bookData, isbn);
    } catch (error) {
      console.error('Failed to fetch book from openBD:', error);
      throw error;
    }
  });
}

/**
 * OpenBD APIのレスポンスをBookオブジェクトに変換
 */
function parseOpenBDBook(data: OpenBDBook, isbn: string): Book {
  const summary = data.summary;
  const onix = data.onix;

  // 著者情報の取得
  const authors: string[] = [];
  if (summary.author) {
    authors.push(...summary.author.split(/[,、]/));
  }
  if (onix?.DescriptiveDetail?.Contributor) {
    onix.DescriptiveDetail.Contributor.forEach((contributor) => {
      if (contributor.PersonName?.content) {
        authors.push(contributor.PersonName.content);
      }
    });
  }

  // 重複を除去
  const uniqueAuthors = Array.from(new Set(authors.filter(Boolean)));

  return {
    isbn,
    title: summary.title || '不明',
    authors: uniqueAuthors.length > 0 ? uniqueAuthors : ['不明'],
    publisher: summary.publisher || '不明',
    publishedDate: summary.pubdate || '',
    coverImage: summary.cover || undefined,
    addedAt: new Date(),
  };
}

/**
 * 現在のキューの長さを取得
 */
export function getAPIQueueLength(): number {
  return rateLimiter.getQueueLength();
}
