import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  CardMedia,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { Book } from '../../types/book';

interface BookDetailProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
}

export function BookDetail({ book, open, onClose }: BookDetailProps) {
  if (!book) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>{book.title}</DialogTitle>

      <DialogContent dividers>
        {book.coverImage ? (
          <CardMedia
            component="img"
            image={book.coverImage}
            alt={book.title}
            sx={{
              maxHeight: 300,
              objectFit: 'contain',
              mb: 2,
            }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              mb: 2,
              borderRadius: 1,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            ISBN
          </Typography>
          <Typography variant="body1">{book.isbn}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            著者
          </Typography>
          <Typography variant="body1">{book.authors.join(', ')}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            出版社
          </Typography>
          <Typography variant="body1">{book.publisher}</Typography>
        </Box>

        {book.publishedDate && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              発行日
            </Typography>
            <Typography variant="body1">{book.publishedDate}</Typography>
          </Box>
        )}

        {book.pageCount && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              ページ数
            </Typography>
            <Typography variant="body1">{book.pageCount}ページ</Typography>
          </Box>
        )}

        {book.price && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              価格
            </Typography>
            <Typography variant="body1">{book.price}</Typography>
          </Box>
        )}

        {book.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              説明
            </Typography>
            <Typography variant="body2">{book.description}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            登録日時
          </Typography>
          <Typography variant="body2">
            {new Date(book.addedAt).toLocaleString('ja-JP')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
