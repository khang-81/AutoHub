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
 * URL đầy đủ để mở file / <img src> (cùng origin với SPA hoặc VITE_API_URL).
 * GET /files/** được API permitAll — không cần Bearer trên thẻ img.
 */
export function kycFileAbsoluteUrl(fileUrl: string): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  if (!base) return path;
  return `${base}${path}`;
}
