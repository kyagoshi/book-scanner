import Papa from 'papaparse';
import type { Book } from '../types/book';

/**
 * 書籍リストをCSV形式でエクスポートする
 * @param books エクスポートする書籍の配列
 */
export function exportBooksToCSV(books: Book[]): void {
  // CSVデータの準備
  const csvData = books.map((book) => ({
    ISBN: book.isbn,
    タイトル: book.title,
    著者: book.authors.join('/'), // 複数著者は/で連結
    出版社: book.publisher,
    出版日: book.publishedDate,
    追加日: book.addedAt.toISOString().split('T')[0], // YYYY-MM-DD形式
  }));

  // papaparse でCSVに変換
  const csv = Papa.unparse(csvData, {
    header: true,
    columns: ['ISBN', 'タイトル', '著者', '出版社', '出版日', '追加日'],
  });

  // UTF-8 BOM を追加（Excel互換性のため）
  const csvWithBOM = '\uFEFF' + csv;

  // Blob を作成
  const blob = new Blob([csvWithBOM], {
    type: 'text/csv;charset=utf-8;',
  });

  // ダウンロード用のリンクを作成
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // ファイル名を生成（books_yyyyMMddhhmmss.csv）
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  link.download = `books_${timestamp}.csv`;

  // ダウンロードを実行
  document.body.appendChild(link);
  link.click();

  // クリーンアップ
  link.remove();
  URL.revokeObjectURL(url);
}
