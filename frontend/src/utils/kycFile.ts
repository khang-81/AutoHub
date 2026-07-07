import { useEffect, useState } from 'react';
import { fetchKycFileAsBlobUrl } from '../api/kyc';

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

/**
 * Hook trả về blob URL cho file KYC để hiển thị trong <img src>.
 * Ảnh KYC ở /files/secure/kyc/... yêu cầu Bearer token mà <img> không gửi,
 * nên ta fetch qua axios (có interceptor gắn token) rồi wrap thành blob URL.
 *
 * Returns: { url, loading, error }
 *   - url: blob URL sẵn dùng cho <img src>, '' khi chưa load xong hoặc file rỗng
 *   - loading: true khi đang fetch
 *   - error: thông báo lỗi nếu fail
 */
export function useKycFileBlobUrl(fileUrl: string | undefined | null): {
  url: string;
  loading: boolean;
  error: string | null;
} {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl) {
      setUrl('');
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const blobUrl = await fetchKycFileAsBlobUrl(fileUrl);
        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        createdUrl = blobUrl;
        setUrl(blobUrl);
        setLoading(false);
      } catch (e: unknown) {
        if (cancelled) return;
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        setError(err?.response?.data?.message || err?.message || 'Không thể tải ảnh');
        setUrl('');
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [fileUrl]);

  return { url, loading, error };
}
