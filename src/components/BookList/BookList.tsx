import { useState } from 'react';
import { Container, Box, Typography, Alert } from '@mui/material';
import { useBookStorage } from '../../hooks/useBookStorage';
import { BookCard } from './BookCard';
import { BookDetail } from './BookDetail';
import { BookListToolbar } from './BookListToolbar';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { exportBooksToCSV } from '../../services/csvExport';
import type { Book } from '../../types/book';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export function BookList() {
  const { books, loading, error, removeBook, clearAllBooks } = useBookStorage();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteISBN, setDeleteISBN] = useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  const handleDetail = (book: Book) => {
    setSelectedBook(book);
    setDetailOpen(true);
  };

  const handleDeleteClick = (isbn: string) => {
    setDeleteISBN(isbn);
  };

  const handleDeleteConfirm = async () => {
    if (deleteISBN) {
      try {
        await removeBook(deleteISBN);
      } catch (err) {
        console.error('Failed to delete book:', err);
      } finally {
        setDeleteISBN(null);
      }
    }
  };

  const handleClearAllConfirm = async () => {
    try {
      await clearAllBooks();
    } catch (err) {
      console.error('Failed to clear all books:', err);
    } finally {
      setClearAllDialogOpen(false);
    }
  };

  const handleExportCSV = () => {
    exportBooksToCSV(books);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (books.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <MenuBookIcon
            sx={{
              fontSize: 120,
              color: 'text.secondary',
              mb: 2,
            }}
          />
          <Typography variant="h5" gutterBottom color="text.secondary">
            書籍がありません
          </Typography>
          <Typography variant="body1" color="text.secondary">
            スキャンページでISBNバーコードをスキャンして書籍を追加しましょう
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BookListToolbar
        bookCount={books.length}
        onClearAll={() => setClearAllDialogOpen(true)}
        onExportCSV={handleExportCSV}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {books.map((book) => (
          <BookCard
            key={book.isbn}
            book={book}
            onDelete={handleDeleteClick}
            onDetail={handleDetail}
          />
        ))}
      </Box>

      <BookDetail
        book={selectedBook}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedBook(null);
        }}
      />

      <ConfirmDialog
        open={deleteISBN !== null}
        title="書籍を削除"
        message="この書籍を削除してもよろしいですか？"
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteISBN(null)}
      />

      <ConfirmDialog
        open={clearAllDialogOpen}
        title="すべて削除"
        message={`${books.length}冊の書籍をすべて削除してもよろしいですか？この操作は取り消せません。`}
        confirmText="すべて削除"
        cancelText="キャンセル"
        onConfirm={handleClearAllConfirm}
        onCancel={() => setClearAllDialogOpen(false)}
      />
    </Container>
  );
}
