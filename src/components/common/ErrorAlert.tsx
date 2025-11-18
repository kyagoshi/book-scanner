import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
}

export function ErrorAlert({ title = 'エラー', message, onClose }: ErrorAlertProps) {
  return (
    <Box sx={{ padding: 2 }}>
      <Alert severity="error" onClose={onClose}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
}
