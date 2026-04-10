import axiosInstance from './axiosInstance';

const BASE = 'http://localhost:8081';

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

export const approveKycApi = async (id: number): Promise<UserDocumentDto> => {
  const res = await axiosInstance.put(`/api/admin/kyc/${id}/approve`);
  return res.data;
};

export const rejectKycApi = async (id: number, adminNote?: string): Promise<UserDocumentDto> => {
  const res = await axiosInstance.put(`/api/admin/kyc/${id}/reject`, { adminNote: adminNote || '' });
  return res.data;
};

/** URL đầy đủ để hiển thị ảnh (ảnh nằm trên API server) */
export function kycFileAbsoluteUrl(fileUrl: string): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `${BASE}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}
