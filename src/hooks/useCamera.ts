import { useState, useRef, useCallback, useEffect } from 'react';
import { SCANNER_CONFIG } from '../utils/constants';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // カメラを起動
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: SCANNER_CONFIG.VIDEO_CONSTRAINTS,
        audio: false,
      });

      setStream(mediaStream);
      streamRef.current = mediaStream;
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'カメラへのアクセスが拒否されました'
            : err.name === 'NotFoundError'
            ? 'カメラが見つかりませんでした'
            : 'カメラの起動に失敗しました'
          : 'カメラの起動に失敗しました';
      setError(errorMessage);
      setIsActive(false);
      throw new Error(errorMessage);
    }
  }, []);

  // カメラを停止
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setIsActive(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  // コンポーネントアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    stream,
    isActive,
    error,
    startCamera,
    stopCamera,
  };
}
