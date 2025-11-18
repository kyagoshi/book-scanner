import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BookList } from './BookList';
import * as useBookStorageModule from '../../hooks/useBookStorage';
import type { Book } from '../../types/book';

vi.mock('../../hooks/useBookStorage');

describe('BookList', () => {
  const mockBooks: Book[] = [
    {
      id: 1,
      isbn: '9784873119038',
      title: 'リファクタリング',
      authors: ['Martin Fowler'],
      publisher: 'オライリー・ジャパン',
      publishedDate: '2019-12',
      coverImage: 'https://example.com/cover1.jpg',
      addedAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      isbn: '9784798121963',
      title: 'リーダブルコード',
      authors: ['Dustin Boswell', 'Trevor Foucher'],
      publisher: 'オライリー・ジャパン',
      publishedDate: '2012-06',
      addedAt: new Date('2024-01-02'),
    },
  ];

  const mockUseBookStorage = {
    books: mockBooks,
    loading: false,
    error: null,
    addBook: vi.fn(),
    removeBook: vi.fn(),
    isBookExists: vi.fn(),
    clearAllBooks: vi.fn(),
    reload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useBookStorageModule, 'useBookStorage').mockReturnValue(mockUseBookStorage);
  });

  it('should display loading spinner when loading', () => {
    vi.spyOn(useBookStorageModule, 'useBookStorage').mockReturnValue({
      ...mockUseBookStorage,
      loading: true,
    });

    render(<BookList />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display error message when error occurs', () => {
    vi.spyOn(useBookStorageModule, 'useBookStorage').mockReturnValue({
      ...mockUseBookStorage,
      error: 'エラーが発生しました',
    });

    render(<BookList />);

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('should display empty state when no books', () => {
    vi.spyOn(useBookStorageModule, 'useBookStorage').mockReturnValue({
      ...mockUseBookStorage,
      books: [],
    });

    render(<BookList />);

    expect(screen.getByText('書籍がありません')).toBeInTheDocument();
    expect(screen.getByText(/スキャンページでISBNバーコードをスキャン/)).toBeInTheDocument();
  });

  it('should display book list with correct count', () => {
    render(<BookList />);

    expect(screen.getByText('書籍リスト (2冊)')).toBeInTheDocument();
    expect(screen.getByText('リファクタリング')).toBeInTheDocument();
    expect(screen.getByText('リーダブルコード')).toBeInTheDocument();
  });

  it('should open detail dialog when info button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookList />);

    const infoButtons = screen.getAllByRole('button', { name: /詳細/ });
    await user.click(infoButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('9784873119038')).toBeInTheDocument();
    });
  });

  test('should show delete confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<BookList />);

    const deleteButtons = screen.getAllByLabelText('削除');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('この書籍を削除してもよろしいですか？')).toBeInTheDocument();
    });
  });

  test('should call removeBook when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(<BookList />);

    const deleteButtons = screen.getAllByLabelText('削除');
    await user.click(deleteButtons[0]);

    const confirmButton = await screen.findByRole('button', { name: '削除' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockUseBookStorage.removeBook).toHaveBeenCalledWith('9784873119038');
    });
  });

  test('should show clear all confirmation dialog', async () => {
    const user = userEvent.setup();
    render(<BookList />);

    const clearAllButton = screen.getByLabelText('すべて削除');
    await user.click(clearAllButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('2冊の書籍をすべて削除してもよろしいですか？この操作は取り消せません。')).toBeInTheDocument();
    });
  });

  it('should call clearAllBooks when clear all is confirmed', async () => {
    const user = userEvent.setup();
    render(<BookList />);

    const clearAllButton = screen.getByRole('button', { name: /すべて削除/ });
    await user.click(clearAllButton);

    const confirmButton = await screen.findByRole('button', { name: 'すべて削除' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockUseBookStorage.clearAllBooks).toHaveBeenCalled();
    });
  });
});
