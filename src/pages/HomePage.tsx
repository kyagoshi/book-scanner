import { Container, Typography, Box } from '@mui/material';

export function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          書籍リスト
        </Typography>
        <Typography variant="body1" color="text.secondary">
          スキャンした書籍がここに表示されます
        </Typography>
      </Box>
    </Container>
  );
}
