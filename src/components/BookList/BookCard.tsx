import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import type { Book } from '../../types/book';

interface BookCardProps {
  book: Book;
  onDelete: (isbn: string) => void;
  onDetail: (book: Book) => void;
}

export function BookCard({ book, onDelete, onDetail }: BookCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {book.coverImage ? (
        <CardMedia
          component="img"
          height="200"
          image={book.coverImage}
          alt={book.title}
          sx={{ objectFit: 'contain', backgroundColor: '#f5f5f5' }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <MenuBookIcon
            data-testid="book-icon"
            sx={{ fontSize: 80, color: 'text.secondary' }}
          />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {book.authors.join(', ')}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {book.publisher}
        </Typography>
        {book.publishedDate && (
          <Typography variant="caption" color="text.secondary">
            {book.publishedDate}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <IconButton
          aria-label="詳細"
          size="small"
          color="primary"
          onClick={() => onDetail(book)}
        >
          <InfoIcon />
        </IconButton>
        <IconButton
          aria-label="削除"
          size="small"
          color="error"
          onClick={() => onDelete(book.isbn)}
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}
