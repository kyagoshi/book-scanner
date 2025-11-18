import Dexie, { Table } from 'dexie';
import { Book } from '../types/book';

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
