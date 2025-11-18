export const API_CONFIG = {
  OPENBD_BASE_URL: 'https://api.openbd.jp/v1',
  MIN_INTERVAL: 1000, // 1秒
  MAX_RETRIES: 3,
  TIMEOUT: 10000, // 10秒
} as const;

export const SCANNER_CONFIG = {
  VIDEO_CONSTRAINTS: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
} as const;
