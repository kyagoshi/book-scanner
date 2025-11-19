import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DownloadIcon from '@mui/icons-material/Download';

interface BookListToolbarProps {
  bookCount: number;
  onClearAll: () => void;
  onExportCSV: () => void;
}

export function BookListToolbar({ bookCount, onClearAll, onExportCSV }: BookListToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        px: 1,
      }}
    >
      <Typography variant="h6" component="h2">
        書籍リスト ({bookCount}冊)
      </Typography>

      {bookCount > 0 && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="CSVエクスポート">
            <IconButton
              color="primary"
              onClick={onExportCSV}
              aria-label="CSVエクスポート"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="すべて削除">
            <IconButton
              color="error"
              onClick={onClearAll}
              aria-label="すべて削除"
            >
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
