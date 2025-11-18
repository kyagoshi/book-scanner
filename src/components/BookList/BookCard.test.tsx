import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BookCard } from './BookCard';
import type { Book } from '../../types/book';

describe('BookCard', () => {
  const mockBook: Book = {
    id: 1,
    isbn: '9784873119038',
    title: 'リファクタリング',
    authors: ['Martin Fowler'],
    publisher: 'オライリー・ジャパン',
    publishedDate: '2019-12',
    coverImage: 'https://example.com/cover.jpg',
    addedAt: new Date('2024-01-01'),
  };

  it('should render book information', () => {
    render(<BookCard book={mockBook} onDelete={vi.fn()} onDetail={vi.fn()} />);

    expect(screen.getByText('リファクタリング')).toBeInTheDocument();
    expect(screen.getByText(/Martin Fowler/)).toBeInTheDocument();
    expect(screen.getByText('オライリー・ジャパン')).toBeInTheDocument();
  });

  it('should display cover image when available', () => {
    render(<BookCard book={mockBook} onDelete={vi.fn()} onDetail={vi.fn()} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
    expect(img).toHaveAttribute('alt', 'リファクタリング');
  });

  it('should display placeholder when no cover image', () => {
    const bookWithoutCover = { ...mockBook, coverImage: undefined };
    render(<BookCard book={bookWithoutCover} onDelete={vi.fn()} onDetail={vi.fn()} />);

    expect(screen.getByTestId('book-icon')).toBeInTheDocument();
  });

  it('should call onDetail when card is clicked', async () => {
    const user = userEvent.setup();
    const handleDetail = vi.fn();
    render(<BookCard book={mockBook} onDelete={vi.fn()} onDetail={handleDetail} />);

    await user.click(screen.getByRole('button', { name: /詳細/ }));

    expect(handleDetail).toHaveBeenCalledWith(mockBook);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    render(<BookCard book={mockBook} onDelete={handleDelete} onDetail={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /削除/ }));

    expect(handleDelete).toHaveBeenCalledWith(mockBook.isbn);
  });

  it('should display multiple authors correctly', () => {
    const bookWithMultipleAuthors = {
      ...mockBook,
      authors: ['著者1', '著者2', '著者3'],
    };
    render(<BookCard book={bookWithMultipleAuthors} onDelete={vi.fn()} onDetail={vi.fn()} />);

    expect(screen.getByText('著者1, 著者2, 著者3')).toBeInTheDocument();
  });
});
