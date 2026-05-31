import axiosInstance from './axiosInstance';
import type {
  ApplyPromotionRequest,
  ApplyPromotionResponse,
  AddPromotionRequest,
  UpdatePromotionRequest,
  Promotion,
} from '../types';

export const applyPromotionApi = async (
  data: ApplyPromotionRequest
): Promise<ApplyPromotionResponse> => {
  const res = await axiosInstance.post<ApplyPromotionResponse>('/api/promotions/apply', data);
  return res.data;
};

export const getAllPromotionsApi = async (): Promise<Promotion[]> => {
  const res = await axiosInstance.get<Promotion[]>('/api/promotions/getAll');
  return res.data;
};

export const addPromotionApi = async (data: AddPromotionRequest) => {
  const res = await axiosInstance.post('/api/promotions/add', data);
  return res.data;
};

export const updatePromotionApi = async (data: UpdatePromotionRequest) => {
  const res = await axiosInstance.put('/api/promotions/update', data);
  return res.data;
};

export const deletePromotionApi = async (id: number) => {
  const res = await axiosInstance.delete(`/api/promotions/delete/${id}`);
  return res.data;
};
