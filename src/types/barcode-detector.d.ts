declare global {
  interface DetectedBarcode {
    rawValue?: string;
    format?: string;
    boundingBox?: DOMRectReadOnly;
  }

  interface BarcodeDetectorOptions {
    formats?: string[];
  }

  interface BarcodeDetector {
    detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
  }

  interface BarcodeDetectorConstructor {
    new (options?: BarcodeDetectorOptions): BarcodeDetector;
    getSupportedFormats?: () => Promise<string[]>;
  }

  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export {};
