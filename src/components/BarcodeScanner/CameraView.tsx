import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
  onStartScanning: (videoElement: HTMLVideoElement) => void;
}

export function CameraView({ videoRef, stream, isActive, onStartScanning }: CameraViewProps) {
  useEffect(() => {
    if (!videoRef.current || !stream || !isActive) return;

    const video = videoRef.current;
    video.srcObject = stream;

    const handleCanPlay = () => {
      console.log('Video can play, readyState:', video.readyState);
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA以上
        console.log('Video ready, starting barcode scanning');
        onStartScanning(video);
      }
    };

    video.addEventListener('canplay', handleCanPlay);

    video.play().catch(err => {
      console.error('Error playing video:', err);
    });

    // すでに再生可能な状態の場合は即座に呼び出す
    if (video.readyState >= 2) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [stream, isActive]); // videoRefとonStartScanningを依存配列から除外

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 640,
        margin: '0 auto',
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: '#000',
        aspectRatio: '4 / 3',
        minHeight: 480,
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          backgroundColor: '#000',
        }}
      />
      {/* スキャンガイド */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '40%',
          border: '2px solid',
          borderColor: 'primary.main',
          borderRadius: 1,
          pointerEvents: 'none',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: 20,
            height: 20,
            border: '3px solid',
            borderColor: 'primary.main',
          },
          '&::before': {
            top: -2,
            left: -2,
            borderRight: 'none',
            borderBottom: 'none',
          },
          '&::after': {
            bottom: -2,
            right: -2,
            borderLeft: 'none',
            borderTop: 'none',
          },
        }}
      />
      {/* バーコード向きガイド */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 60,
            border: '3px solid',
            borderColor: 'warning.main',
            borderRadius: 1,
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          {/* 横向きバーコードのイメージ */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                width: i % 2 === 0 ? '80%' : '70%',
                height: 6,
                backgroundColor: 'warning.main',
                opacity: 0.8,
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
