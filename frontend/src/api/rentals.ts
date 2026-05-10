import axiosInstance from './axiosInstance';
import type { AddRentalRequest } from '../types';

export interface InsuranceOptionDto {
  code: string;
  name: string;
  feePerDay: number;
}

export const getInsuranceOptionsApi = async (): Promise<InsuranceOptionDto[]> => {
  const res = await axiosInstance.get('/api/rentals/insurance-options');
  return res.data;
};

/** Add-on multi-package options (Sprint 2). */
export const getAddonOptionsApi = async (): Promise<InsuranceOptionDto[]> => {
  const res = await axiosInstance.get('/api/rentals/addon-options');
  return res.data;
};

/** Khoảng ngày đã có đơn (công khai, không token) — dùng cho lịch trên trang chi tiết xe. */
export const getPublicBusyRangesForCarApi = async (
  carId: number
): Promise<{ startDate: string; endDate: string }[]> => {
  const res = await axiosInstance.get(`/api/rentals/public/busy-ranges/${carId}`);
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export const getAllRentalsApi = async () => {
  const res = await axiosInstance.get('/api/rentals/getAll');
  return res.data;
};

export const getRentalByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/rentals/getById/${id}`);
  return res.data;
};

export const getRentalsByUserIdApi = async () => {
  const res = await axiosInstance.get('/api/rentals/getRentalsByUserId');
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export const addRentalApi = async (data: AddRentalRequest) => {
  const res = await axiosInstance.post('/api/rentals/add', data);
  return res.data;
};

export const updateRentalApi = async (data: { id: number; startDate: string; endDate: string; carId: number; userId: number }) => {
  const res = await axiosInstance.put('/api/rentals/update', data);
  return res.data;
};

export const deleteRentalApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/rentals/delete', { data: { id } });
  return res.data;
};

export const getRentalIdApi = async (
  startDate: string,
  endDate: string,
  carId: number,
  userId: number
) => {
  const res = await axiosInstance.get('/api/rentals/getRentalId', {
    params: { startDate, endDate, carId, userId },
  });
  return res.data;
};

/**
 * Form đối chiếu trả xe (Sprint 3 — UC #15). Dùng chung cho khách & admin.
 * Backend tự tính lateFee/overKmFee/missingFuelFee dựa trên snapshot lúc tạo đơn.
 */
export interface ReturnRentalFormBody {
  endKilometer: number;
  returnDate?: string;
  /** % xăng thực tế khi trả (0..100). */
  actualFuelLevel?: number;
  damageNotes?: string;
  /** CSV URL ảnh hư hại (giữ đơn giản — chưa upload binary). */
  damagePhotoUrls?: string;
  additionalIncidentalFees?: number;
  /** Admin-only: đẩy đơn sang DISPUTE thay vì COMPLETED. */
  markDispute?: boolean;
}

/** Khách xác nhận trả xe (đơn CONFIRMED). */
export const returnRentalByUserApi = async (
  rentalId: number,
  body: ReturnRentalFormBody
) => {
  const res = await axiosInstance.put(`/api/rentals/${rentalId}/return`, body);
  return res.data;
};

/** Admin đối chiếu trả xe (Sprint 3) — kèm cờ markDispute để mở DISPUTE. */
export const adminReturnRentalApi = async (
  rentalId: number,
  body: ReturnRentalFormBody
) => {
  const res = await axiosInstance.put(`/api/rentals/admin/${rentalId}/return`, body);
  return res.data;
};

export const returnCarApi = async (data: {
  id: number;
  startDate: string;
  endDate: string;
  returnDate: string;
  endKilometer: number;
  totalPrice: number;
  carId: number;
  userId: number;
}) => {
  const res = await axiosInstance.put('/api/rentals/update', data);
  return res.data;
};

export const confirmRentalApi = async (id: number) => {
  const res = await axiosInstance.put(`/api/rentals/confirm/${id}`);
  return res.data;
};

export const submitTransferApi = async (id: number) => {
  const res = await axiosInstance.put(`/api/rentals/submitTransfer/${id}`);
  return res.data;
};

export const cancelRentalApi = async (id: number, reason?: string) => {
  const res = await axiosInstance.put(`/api/rentals/cancel/${id}`, reason ? { reason } : {});
  return res.data;
};
