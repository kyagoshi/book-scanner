import { Box, Fade } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

interface ScanFeedbackProps {
  type: 'success' | 'error' | 'warning' | null;
  visible: boolean;
}

export function ScanFeedback({ type, visible }: ScanFeedbackProps) {
  if (!type) return null;

  const config = {
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: 80 }} />,
      color: 'success.main',
      bgColor: 'rgba(76, 175, 80, 0.1)',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: 80 }} />,
      color: 'error.main',
      bgColor: 'rgba(244, 67, 54, 0.1)',
    },
    warning: {
      icon: <WarningIcon sx={{ fontSize: 80 }} />,
      color: 'warning.main',
      bgColor: 'rgba(255, 152, 0, 0.1)',
    },
  };

  const { icon, color, bgColor } = config[type];

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            color: color,
            animation: 'pulse 0.3s ease-in-out',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.8)', opacity: 0 },
              '50%': { transform: 'scale(1.2)', opacity: 1 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          {icon}
        </Box>
      </Box>
    </Fade>
  );
}
