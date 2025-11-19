import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
}

export function CameraView({ videoRef, stream, isActive }: CameraViewProps) {
  useEffect(() => {
    if (videoRef.current && stream && isActive) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [videoRef, stream, isActive]);

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
    </Paper>
  );
}
