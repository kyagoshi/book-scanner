export interface Book {
  id?: number;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  coverImage?: string;
  description?: string;
  pageCount?: number;
  price?: string;
  addedAt: Date;
}
