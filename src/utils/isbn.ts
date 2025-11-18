/**
 * ISBNが有効かどうかを検証
 */
export function isValidISBN(isbn: string): boolean {
  // ハイフンを除去
  const cleanISBN = isbn.replace(/-/g, '');
  
  // 13桁の数字かチェック
  if (!/^\d{13}$/.test(cleanISBN)) {
    return false;
  }
  
  // チェックディジットの検証
  const digits = cleanISBN.split('').map(Number);
  const checksum = digits.reduce((sum, digit, index) => {
    return sum + digit * (index % 2 === 0 ? 1 : 3);
  }, 0);
  
  return checksum % 10 === 0;
}

/**
 * ISBNを正規化（ハイフンを除去して13桁の文字列に）
 */
export function normalizeISBN(isbn: string): string {
  return isbn.replace(/-/g, '');
}
