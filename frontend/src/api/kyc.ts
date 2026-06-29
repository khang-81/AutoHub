import axiosInstance from './axiosInstance';
import { API_BASE_URL } from '../config/api';

export interface UserDocumentDto {
  id: number;
  userId?: number;
  documentType: string;
  fileUrl: string;
  status: string;
  adminNote?: string | null;
  reviewedAt?: string | null;
}

export const getMyKycDocumentsApi = async (): Promise<UserDocumentDto[]> => {
  const res = await axiosInstance.get('/api/kyc/my');
  return res.data;
};

export const uploadKycDocumentApi = async (
  documentType: 'CCCD' | 'GPLX',
  file: File
): Promise<UserDocumentDto> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  const res = await axiosInstance.post('/api/kyc/upload', formData);
  return res.data;
};

export const getPendingKycAdminApi = async (): Promise<UserDocumentDto[]> => {
  const res = await axiosInstance.get('/api/admin/kyc/pending');
  return res.data;
};

/** Toàn bộ giấy tờ KYC của một user (admin — duyệt & đã duyệt). */
export const getAdminKycDocumentsByUserIdApi = async (userId: number): Promise<UserDocumentDto[]> => {
  const res = await axiosInstance.get(`/api/admin/kyc/user/${userId}`);
  return res.data;
};

export const approveKycApi = async (id: number): Promise<UserDocumentDto> => {
  const res = await axiosInstance.put(`/api/admin/kyc/${id}/approve`);
  return res.data;
};

export const rejectKycApi = async (id: number, adminNote?: string): Promise<UserDocumentDto> => {
  const res = await axiosInstance.put(`/api/admin/kyc/${id}/reject`, { adminNote: adminNote || '' });
  return res.data;
};

/**
 * BUGFIX #2: KYC file PHẢI dùng Bearer token. Vì <img src> không gửi Authorization header mặc định,
 * ta chuyển sang dùng một endpoint controller có @PreAuthorize và gọi qua axios với header.
 *
 * Helper này giờ trả về URL tuyệt đối dạng `/files/secure/kyc/<userId>/<uuid>.ext` — frontend
 * sẽ fetch qua API với Authorization header rồi hiển thị bằng blob URL.
 */

/**
 * Fetch file KYC với Bearer token và trả về blob URL để hiển thị trong <img src>.
 * Dùng cho user xem ảnh của chính mình.
 */
export async function fetchKycFileAsBlobUrl(fileUrl: string): Promise<string> {
  if (!fileUrl) return '';
  // Backend sẽ map URL cũ → URL mới khi trả về (đã làm ở backend).
  const cleanUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  const fullUrl = cleanUrl.startsWith('http')
      ? cleanUrl
      : `${API_BASE_URL.replace(/\/+$/, '')}${cleanUrl}`;
  const res = await axiosInstance.get<Blob>(fullUrl, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}

/**
 * URL đầy đủ cho file PUBLIC (ảnh xe, brand logo) — không cần auth.
 */
export function kycFileAbsoluteUrl(fileUrl: string): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  if (!base) return path;
  return `${base}${path}`;
}
