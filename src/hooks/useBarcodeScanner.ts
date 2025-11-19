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
    // EAN_13とEAN_8の両方をサポート（ISBN-10/13対応）
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    // より正確な検出のための設定
    hints.set(DecodeHintType.ASSUME_GS1, false);

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

      try {
        await readerRef.current.decodeFromVideoDevice(
          null,
          videoElement,
          (result) => {
            scanAttempts++;
            const now = Date.now();
            
            if (result) {
              const rawISBN = result.getText();
              
              // 9から始まるバーコード（ISBN-13）のみを処理
              if (!rawISBN.startsWith('9')) {
                console.log('⏭️ スキップ: 9から始まらないバーコード:', rawISBN);
                return;
              }
              
              console.log('✅ バーコード検出:', rawISBN);
              console.log('📊 フォーマット:', result.getBarcodeFormat());
              
              const normalizedISBN = normalizeISBN(rawISBN);
              console.log('🔄 正規化ISBN:', normalizedISBN);

              if (isValidISBN(normalizedISBN)) {
                console.log('✨ 有効なISBN検出:', normalizedISBN);
                setLastScannedISBN(normalizedISBN);
                onScan(normalizedISBN);
              } else {
                console.log('⚠️ 無効なISBN:', normalizedISBN);
              }
            } else if (now - lastLogTime > 3000) {
              // 3秒ごとに進捗ログを表示
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
