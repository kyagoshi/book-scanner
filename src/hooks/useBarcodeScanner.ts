import { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { isValidISBN, normalizeISBN } from '../utils/isbn';

export type BarcodeEngine = 'shape-detection' | 'zxing';

export interface BarcodeDetectionResult {
  isbn: string;
  engine: BarcodeEngine;
}

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedISBN, setLastScannedISBN] = useState<string | null>(null);
  const [engine, setEngine] = useState<BarcodeEngine>('zxing');
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef(false);
  const shapeDetectorRef = useRef<BarcodeDetector | null>(null);

  // スキャナーを初期化
  useEffect(() => {
    const hints = new Map();
    // EAN_13とEAN_8の両方をサポート（ISBN-10/13対応）
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    // より正確な検出のための設定
    hints.set(DecodeHintType.ASSUME_GS1, false);

    readerRef.current = new BrowserMultiFormatReader(hints);

    const detectorSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    if (detectorSupported) {
      const Detector = window.BarcodeDetector;
      if (Detector) {
        try {
          shapeDetectorRef.current = new Detector({ formats: ['ean_13', 'ean_8', 'isbn'] });
          setEngine('shape-detection');
        } catch (error) {
          console.warn('Failed to initialize BarcodeDetector, falling back to ZXing:', error);
          shapeDetectorRef.current = null;
          setEngine('zxing');
        }
      }
    }

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
      shapeDetectorRef.current = null;
    };
  }, []);

  const detectWithShapeDetector = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!shapeDetectorRef.current) {
      return null;
    }

    const canvas = document.createElement('canvas');
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
      return null;
    }
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      return null;
    }
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    try {
      const barcodes = await shapeDetectorRef.current.detect(canvas);
      const isbn = barcodes.find(barcode => barcode.rawValue?.startsWith('9'))?.rawValue;
      if (isbn) {
        return { isbn: normalizeISBN(isbn), engine: 'shape-detection' as const };
      }
    } catch (error) {
      console.warn('BarcodeDetector detection failed:', error);
    }

    return null;
  }, []);

  // スキャンを開始
  const startScanning = useCallback(
    async (
      videoElement: HTMLVideoElement,
      onScan: (result: BarcodeDetectionResult) => void
    ) => {
      if (!readerRef.current || scanningRef.current) {
        console.log('Scanner not ready or already scanning');
        return;
      }

      console.log('🎥 Starting barcode scanning...');
      console.log('📹 Video:', videoElement.videoWidth, 'x', videoElement.videoHeight, 'readyState:', videoElement.readyState);
      
      setIsScanning(true);
      scanningRef.current = true;

      let scanAttempts = 0;
      let lastLogTime = 0;

      const processZXingResult = (rawISBN: string) => {
        if (!rawISBN.startsWith('9')) {
          console.log('⏭️ スキップ: 9から始まらないバーコード:', rawISBN);
          return;
        }

        console.log('✅ バーコード検出:', rawISBN);
        const normalizedISBN = normalizeISBN(rawISBN);
        console.log('🔄 正規化ISBN:', normalizedISBN);

        if (isValidISBN(normalizedISBN)) {
          console.log('✨ 有効なISBN検出:', normalizedISBN);
          setLastScannedISBN(normalizedISBN);
          onScan({ isbn: normalizedISBN, engine: 'zxing' });
        } else {
          console.log('⚠️ 無効なISBN:', normalizedISBN);
        }
      };

      try {
        if (shapeDetectorRef.current) {
          console.log('🔁 Shape Detection + ZXing hybrid scanning active');
          const detectLoop = async () => {
            while (scanningRef.current && videoElement.readyState >= 2) {
              const shapeResult = await detectWithShapeDetector(videoElement);
              if (shapeResult && isValidISBN(shapeResult.isbn)) {
                setLastScannedISBN(shapeResult.isbn);
                onScan(shapeResult);
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 120));
            }
          };

          detectLoop().catch((loopError) => {
            console.warn('Shape detection loop terminated:', loopError);
          });
        }

        await readerRef.current.decodeFromVideoDevice(
          null,
          videoElement,
          (result) => {
            scanAttempts++;
            const now = Date.now();

            if (result) {
              const rawISBN = result.getText();
              console.log('📊 ZXingフォーマット:', result.getBarcodeFormat());
              processZXingResult(rawISBN);
            } else if (now - lastLogTime > 3000) {
              console.log('🔍 スキャン中...', scanAttempts, '回試行');
              lastLogTime = now;
            }
          }
        );
        console.log('✅ バーコードスキャナー初期化完了');
      } catch (err) {
        console.error('❌ スキャンエラー:', err);
        setIsScanning(false);
        scanningRef.current = false;
      }
    },
    [detectWithShapeDetector]
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
    engine,
    startScanning,
    stopScanning,
  };
}
