import { createTheme } from '@mui/material/styles';
import { jaJP } from '@mui/material/locale';

export const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      success: {
        main: '#4caf50',
      },
      warning: {
        main: '#ff9800',
      },
      error: {
        main: '#f44336',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Hiragino Sans',
        'Hiragino Kaku Gothic ProN',
        'Yu Gothic',
        'Meiryo',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  },
  jaJP
);
