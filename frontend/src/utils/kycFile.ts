const KYC_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'] as const;

export function kycFileExtension(name: string): string {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf('.');
  if (dot < 0) return '';
  return lower.slice(dot);
}

export function isAllowedKycImage(file: File): boolean {
  const ext = kycFileExtension(file.name);
  if (KYC_IMAGE_EXTENSIONS.includes(ext as (typeof KYC_IMAGE_EXTENSIONS)[number])) {
    return true;
  }
  if (file.type.startsWith('image/')) {
    const mime = file.type.toLowerCase();
    return mime === 'image/png' || mime === 'image/jpeg' || mime === 'image/jpg';
  }
  return false;
}

export function isLikelyKycImageUrl(fileUrl: string): boolean {
  const u = fileUrl.split('?')[0].toLowerCase();
  return KYC_IMAGE_EXTENSIONS.some((ext) => u.endsWith(ext));
}
