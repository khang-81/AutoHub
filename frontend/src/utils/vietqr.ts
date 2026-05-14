import type { BankInfo } from '../api/payment';

/** Chuẩn hóa số TK VietQR (bỏ khoảng trắng). */
export function normalizeBankAccountNumber(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw.replace(/\s+/g, '').trim();
}

export function buildVietQrImageUrl(
  bankInfo: BankInfo | undefined,
  amountVnd: number,
  transferContent: string
): string {
  const code = (bankInfo?.bankCode ?? '').trim().toUpperCase();
  const acct = normalizeBankAccountNumber(bankInfo?.accountNumber);
  const name = (bankInfo?.accountName ?? '').trim();
  if (!code || !acct || !Number.isFinite(amountVnd) || amountVnd <= 0) return '';
  const amt = Math.round(amountVnd);
  const addInfo = transferContent.replace(/\s+/g, ' ').trim();
  return `https://img.vietqr.io/image/${code}-${acct}-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(
    addInfo
  )}&accountName=${encodeURIComponent(name)}`;
}
