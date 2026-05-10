import axiosInstance from './axiosInstance';
import type { ApplyPromotionRequest, ApplyPromotionResponse } from '../types';

/**
 * Validate + tính giảm giá theo mã. Yêu cầu user đã đăng nhập (axios tự gắn JWT).
 * Backend sẽ throw BusinessException → axios reject → onError nhận message.
 */
export const applyPromotionApi = async (
  data: ApplyPromotionRequest
): Promise<ApplyPromotionResponse> => {
  const res = await axiosInstance.post<ApplyPromotionResponse>('/api/promotions/apply', data);
  return res.data;
};
