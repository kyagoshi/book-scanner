import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: 8, // padding bottom for bottom navigation
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
      <Navigation />
    </Box>
  );
}
