import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportBooksToCSV } from './csvExport';
import type { Book } from '../types/book';

describe('csvExport', () => {
  let mockCreateElement: HTMLAnchorElement;
  let mockClick: ReturnType<typeof vi.fn>;
  let mockRemove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // モックのaタグを作成
    mockClick = vi.fn();
    mockRemove = vi.fn();
    mockCreateElement = {
      click: mockClick,
      remove: mockRemove,
      href: '',
      download: '',
      style: {},
    } as unknown as HTMLAnchorElement;

    // document.createElementをモック
    vi.spyOn(document, 'createElement').mockReturnValue(mockCreateElement);
    // document.body.appendChildをモック
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockCreateElement);
    // URL.createObjectURLをモック
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    // URL.revokeObjectURLをモック
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportBooksToCSV', () => {
    it('書籍データをCSV形式でエクスポートできる', () => {
      const books: Book[] = [
        {
          isbn: '9784873119038',
          title: 'リファクタリング',
          authors: ['Martin Fowler'],
          publisher: 'オライリー・ジャパン',
          publishedDate: '2019-12',
          addedAt: new Date('2024-01-01T00:00:00Z'),
        },
        {
          isbn: '9784873118222',
          title: 'Clean Code',
          authors: ['Robert C. Martin'],
          publisher: 'アスキー・メディアワークス',
          publishedDate: '2009-01',
          addedAt: new Date('2024-01-02T00:00:00Z'),
        },
      ];

      exportBooksToCSV(books);

      // aタグが作成されたことを確認
      expect(document.createElement).toHaveBeenCalledWith('a');
      // aタグがクリックされたことを確認
      expect(mockClick).toHaveBeenCalled();
      // aタグが削除されたことを確認
      expect(mockRemove).toHaveBeenCalled();
      // ファイル名が正しい形式であることを確認（books_yyyyMMddhhmmss.csv）
      expect(mockCreateElement.download).toMatch(/^books_\d{14}\.csv$/);
    });

    it('UTF-8 BOM付きでCSVを生成する', () => {
      const books: Book[] = [
        {
          isbn: '9784873119038',
          title: 'リファクタリング',
          authors: ['Martin Fowler'],
          publisher: 'オライリー・ジャパン',
          publishedDate: '2019-12',
          addedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      let csvContent = '';
      let blobOptions: BlobPropertyBag | undefined;

      // Blob コンストラクタをモック
      const OriginalBlob = window.Blob;
      window.Blob = vi.fn(function (
        blobParts?: BlobPart[],
        options?: BlobPropertyBag
      ) {
        csvContent = blobParts?.[0] as string;
        blobOptions = options;
        return new OriginalBlob(blobParts || [], options);
      } as any);

      exportBooksToCSV(books);

      // BOM（\uFEFF）が含まれていることを確認
      expect(csvContent).toContain('\uFEFF');
      expect(blobOptions?.type).toBe('text/csv;charset=utf-8;');

      // 後処理
      window.Blob = OriginalBlob;
    });

    it('CSV に正しいヘッダーとデータが含まれる', () => {
      const books: Book[] = [
        {
          isbn: '9784873119038',
          title: 'リファクタリング',
          authors: ['Martin Fowler', 'Kent Beck'],
          publisher: 'オライリー・ジャパン',
          publishedDate: '2019-12',
          addedAt: new Date('2024-01-01T10:30:00Z'),
        },
      ];

      let csvContent = '';
      const OriginalBlob = window.Blob;
      window.Blob = vi.fn(function (blobParts?: BlobPart[]) {
        csvContent = blobParts?.[0] as string;
        return new OriginalBlob(blobParts || []);
      } as any);

      exportBooksToCSV(books);

      // BOMを除いたCSV内容を確認
      const csvWithoutBOM = csvContent.replace('\uFEFF', '');

      // ヘッダーが正しいことを確認
      expect(csvWithoutBOM).toContain('ISBN,タイトル,著者,出版社,出版日,追加日');

      // データが正しいことを確認
      expect(csvWithoutBOM).toContain('9784873119038');
      expect(csvWithoutBOM).toContain('リファクタリング');
      expect(csvWithoutBOM).toContain('Martin Fowler/Kent Beck'); // 複数著者は/で連結
      expect(csvWithoutBOM).toContain('オライリー・ジャパン');
      expect(csvWithoutBOM).toContain('2019-12');
      expect(csvWithoutBOM).toContain('2024-01-01'); // 日付フォーマット

      // 後処理
      window.Blob = OriginalBlob;
    });

    it('空の配列でもエラーが発生しない', () => {
      expect(() => exportBooksToCSV([])).not.toThrow();
    });

    it('著者が空の配列の場合も正しく処理される', () => {
      const books: Book[] = [
        {
          isbn: '9784873119038',
          title: 'テスト書籍',
          authors: [],
          publisher: 'テスト出版社',
          publishedDate: '2024-01',
          addedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      let csvContent = '';
      const OriginalBlob = window.Blob;
      window.Blob = vi.fn(function (blobParts?: BlobPart[]) {
        csvContent = blobParts?.[0] as string;
        return new OriginalBlob(blobParts || []);
      } as any);

      exportBooksToCSV(books);

      const csvWithoutBOM = csvContent.replace('\uFEFF', '');
      // 著者が空の場合、空文字列になる（ダブルクォートなし）
      expect(csvWithoutBOM).toContain('テスト書籍,,');

      // 後処理
      window.Blob = OriginalBlob;
    });
  });
});
