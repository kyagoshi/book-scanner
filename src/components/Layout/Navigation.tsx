import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveValue = () => {
    if (location.pathname === '/scan') return 1;
    if (location.pathname === '/settings') return 2;
    return 0;
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getActiveValue()}
        onChange={(_, newValue) => {
          if (newValue === 0) navigate('/');
          if (newValue === 1) navigate('/scan');
          if (newValue === 2) navigate('/settings');
        }}
      >
        <BottomNavigationAction label="ホーム" icon={<HomeIcon />} />
        <BottomNavigationAction label="スキャン" icon={<QrCodeScannerIcon />} />
        <BottomNavigationAction label="設定" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
