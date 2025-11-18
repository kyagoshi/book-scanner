import Dexie, { type Table } from 'dexie';
import type { Book } from '../types/book';

export class BookDatabase extends Dexie {
  books!: Table<Book, number>;

  constructor() {
    super('BookScannerDB');
    this.version(1).stores({
      books: '++id, &isbn, title, addedAt',
    });
  }
}

export const db = new BookDatabase();
