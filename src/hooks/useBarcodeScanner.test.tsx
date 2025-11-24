import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBarcodeScanner } from './useBarcodeScanner';

describe('useBarcodeScanner', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  });

  it('falls back to the ZXing engine when BarcodeDetector is unavailable', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    expect(result.current.engine).toBe('zxing');
  });

  it('prefers the Shape Detection API when available', async () => {
    const detectMock = vi.fn<[CanvasImageSource], Promise<DetectedBarcode[]>>().mockResolvedValue([]);

    class MockBarcodeDetector implements BarcodeDetector {
      constructor(_options?: BarcodeDetectorOptions) {}

      detect(source: CanvasImageSource): Promise<DetectedBarcode[]> {
        return detectMock(source);
      }
    }

    (window as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector = MockBarcodeDetector as unknown as BarcodeDetectorConstructor;

    const { result } = renderHook(() => useBarcodeScanner());

    await waitFor(() => {
      expect(result.current.engine).toBe('shape-detection');
    });
  });
});
