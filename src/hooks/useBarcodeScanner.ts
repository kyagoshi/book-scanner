import { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { isValidISBN, normalizeISBN } from '../utils/isbn';

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedISBN, setLastScannedISBN] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef(false);

  // スキャナーを初期化
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    readerRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  // スキャンを開始
  const startScanning = useCallback(
    async (
      videoElement: HTMLVideoElement,
      onScan: (isbn: string) => void
    ) => {
      if (!readerRef.current || scanningRef.current) return;

      setIsScanning(true);
      scanningRef.current = true;

      try {
        await readerRef.current.decodeFromVideoDevice(
          null,
          videoElement,
          (result) => {
            if (result) {
              const rawISBN = result.getText();
              const normalizedISBN = normalizeISBN(rawISBN);

              if (isValidISBN(normalizedISBN)) {
                setLastScannedISBN(normalizedISBN);
                onScan(normalizedISBN);
              }
            }
          }
        );
      } catch (err) {
        console.error('Barcode scanning error:', err);
        setIsScanning(false);
        scanningRef.current = false;
      }
    },
    []
  );

  // スキャンを停止
  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
    scanningRef.current = false;
  }, []);

  return {
    isScanning,
    lastScannedISBN,
    startScanning,
    stopScanning,
  };
}
