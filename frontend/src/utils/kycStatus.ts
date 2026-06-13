export interface KycDocLike {
  documentType: string;
  status: string;
}

/**
 * Xác định KYC đã duyệt đủ (CCCD + GPLX).
 * Dùng cả profile.kycStatus và trạng thái từng giấy tờ — tránh cache profile cũ sau khi admin duyệt.
 */
export function isKycApproved(
  profile?: { kycStatus?: string | null } | null,
  docs?: KycDocLike[] | null
): boolean {
  if (profile?.kycStatus === 'APPROVED') return true;
  if (!docs?.length) return false;
  const cccd = docs.find((d) => d.documentType === 'CCCD');
  const gplx = docs.find((d) => d.documentType === 'GPLX');
  return cccd?.status === 'APPROVED' && gplx?.status === 'APPROVED';
}
