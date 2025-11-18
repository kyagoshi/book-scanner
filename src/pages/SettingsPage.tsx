import { Container, Typography, Box } from '@mui/material';

export function SettingsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          設定
        </Typography>
        <Typography variant="body1" color="text.secondary">
          アプリの設定を行います
        </Typography>
      </Box>
    </Container>
  );
}
