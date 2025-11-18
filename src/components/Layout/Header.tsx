import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuBookIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Book Scanner
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
