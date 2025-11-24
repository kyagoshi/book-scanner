import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Button,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { useCamera } from '../../hooks/useCamera';
import { useBarcodeScanner, type BarcodeDetectionResult } from '../../hooks/useBarcodeScanner';
import { useBookAPI } from '../../hooks/useBookAPI';
import { useBookStorage } from '../../hooks/useBookStorage';
import { CameraView } from './CameraView';
import { ScanFeedback } from './ScanFeedback';

type FeedbackType = 'success' | 'error' | 'warning' | null;

export function BarcodeScanner() {
  const { videoRef, stream, isActive, error: cameraError, startCamera, stopCamera } = useCamera();
  const { startScanning, stopScanning, engine } = useBarcodeScanner();
  const { searchBook } = useBookAPI();
  const { addBook, isBookExists } = useBookStorage();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  // フィードバック表示
  const showFeedback = useCallback((type: FeedbackType, message: string, severity: 'success' | 'error' | 'warning') => {
    setFeedbackType(type);
    setFeedbackVisible(true);
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);

    // バイブレーション
    if (navigator.vibrate) {
      if (type === 'success') {
        navigator.vibrate(200);
      } else if (type === 'warning') {
        navigator.vibrate([100, 50, 100]);
      } else if (type === 'error') {
        navigator.vibrate([50, 100, 50]);
      }
    }

    // フィードバックを消す
    setTimeout(() => {
      setFeedbackVisible(false);
      setTimeout(() => setFeedbackType(null), 300);
    }, 800);
  }, []);

  // ISBNスキャン時の処理
  const handleScan = useCallback(
    async ({ isbn, engine: detectionEngine }: BarcodeDetectionResult) => {
      if (processingRef.current) return;

      processingRef.current = true;
      setProcessing(true);

      const engineLabel = detectionEngine === 'shape-detection' ? 'Shape Detection API' : 'ZXing';

      try {
        // 既存チェック
        const exists = await isBookExists(isbn);
        if (exists) {
          showFeedback('warning', `この書籍は既に登録済みです（${engineLabel}）`, 'warning');
          processingRef.current = false;
          setProcessing(false);
          return;
        }

        // API呼び出し
        const book = await searchBook(isbn);

        if (!book) {
          showFeedback('error', `書籍情報が見つかりませんでした（${engineLabel}）`, 'error');
          processingRef.current = false;
          setProcessing(false);
          return;
        }

        // 保存
        await addBook(book);
        showFeedback('success', `「${book.title}」を追加しました（${engineLabel}）`, 'success');
      } catch (error) {
        console.error('Failed to process scanned ISBN:', error);
        showFeedback('error', '書籍の追加に失敗しました', 'error');
      } finally {
        processingRef.current = false;
        setProcessing(false);
      }
    },
    [isBookExists, searchBook, addBook, showFeedback]
  );

  // スキャン開始
  const handleStartScanning = useCallback(async () => {
    try {
      console.log('handleStartScanning called');
      await startCamera();
      console.log('Camera started');
    } catch (error) {
      console.error('Failed to start scanning:', error);
    }
  }, [startCamera]);

  // video要素が準備できたらスキャニングを開始
  const handleVideoReady = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      console.log('Video element ready, starting barcode scanner');
      await startScanning(videoElement, handleScan);
      console.log('Barcode scanning started');
    } catch (error) {
      console.error('Failed to start barcode scanning:', error);
    }
  }, [startScanning, handleScan]);

  // スキャン停止
  const handleStopScanning = useCallback(() => {
    stopScanning();
    stopCamera();
  }, [stopScanning, stopCamera]);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      handleStopScanning();
    };
  }, [handleStopScanning]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          バーコードスキャン
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          ISBNバーコードをカメラに向けてスキャンしてください
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
            mt: 2,
          }}
        >
          <Chip
            label={`検出モード: ${engine === 'shape-detection' ? 'Shape Detection API' : 'ZXingフォールバック'}`}
            color={engine === 'shape-detection' ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
          <Chip
            label={engine === 'shape-detection' ? '横向きバーコード対応' : '横向きはフォールバック中'}
            color="info"
            variant="outlined"
            size="small"
          />
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 1 }}
        >
          {engine === 'shape-detection'
            ? 'Shape Detection APIが有効なため、横向きでも緑の枠に合わせれば検出できます。'
            : 'ブラウザがShape Detection APIに未対応のためZXingモードで動作中です。横向きバーコードは縦向きにして合わせてください。'}
        </Typography>
        {isActive && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            💡 9から始まるバーコード（ISBN-13）を緑の枠内に収めてください
          </Typography>
        )}
      </Box>

      {cameraError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {cameraError}
        </Alert>
      )}

      {isActive ? (
        <>
          <CameraView 
            videoRef={videoRef} 
            stream={stream} 
            isActive={isActive}
            onStartScanning={handleVideoReady}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<StopIcon />}
              onClick={handleStopScanning}
              disabled={processing}
            >
              停止
            </Button>
          </Box>
          {processing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                処理中...
              </Typography>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartScanning}
          >
            スキャン開始
          </Button>
        </Box>
      )}

      <ScanFeedback type={feedbackType} visible={feedbackVisible} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
