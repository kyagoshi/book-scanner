import { describe, it, expect } from 'vitest';
import { isValidISBN, normalizeISBN } from './isbn';

describe('ISBN Utilities', () => {
  describe('normalizeISBN', () => {
    it('should remove hyphens from ISBN', () => {
      expect(normalizeISBN('978-4-1234-5678-9')).toBe('9784123456789');
    });

    it('should return the same string if no hyphens', () => {
      expect(normalizeISBN('9784123456789')).toBe('9784123456789');
    });

    it('should handle empty string', () => {
      expect(normalizeISBN('')).toBe('');
    });
  });

  describe('isValidISBN', () => {
    it('should validate correct ISBN-13', () => {
      // 有効なISBN-13の例
      expect(isValidISBN('9784873119038')).toBe(true); // リファクタリング（第2版）
      expect(isValidISBN('9784798121963')).toBe(true); // リーダブルコード
    });

    it('should reject ISBN with invalid checksum', () => {
      expect(isValidISBN('9784873119039')).toBe(false); // チェックディジットが不正
    });

    it('should reject non-13-digit strings', () => {
      expect(isValidISBN('978487311903')).toBe(false); // 12桁
      expect(isValidISBN('97848731190380')).toBe(false); // 14桁
    });

    it('should reject strings with non-numeric characters after normalization', () => {
      // ハイフン付きは正規化されるので、正規化後の文字列をテスト
      expect(isValidISBN(normalizeISBN('978-4873-11903-8'))).toBe(true);
      expect(isValidISBN('978487311903X')).toBe(false); // 英字含む
      expect(isValidISBN('978 4873 11903 8')).toBe(false); // スペース含む
    });

    it('should reject empty string', () => {
      expect(isValidISBN('')).toBe(false);
    });
  });
});
