import axiosInstance from './axiosInstance';

export interface ReviewDto {
  id: number;
  rentalId: number | null;
  saleOrderId: number | null;
  sourceType: 'RENTAL' | 'SALE_ORDER' | string;
  carId?: number | null;
  carLabel?: string | null;
  rating: number;
  comment: string | null;
  adminReply?: string | null;
  createdDate: string;
  authorLabel: string;
  hiddenFromPublic?: boolean;
}

export const getReviewsByCarIdApi = async (carId: number, minRating?: number): Promise<ReviewDto[]> => {
  const params = minRating ? { minRating } : {};
  const res = await axiosInstance.get(`/api/reviews/car/${carId}`, { params });
  return res.data;
};

export const addReviewApi = async (data: { rentalId?: number; saleOrderId?: number; rating: number; comment?: string }) => {
  const res = await axiosInstance.post('/api/reviews/add', data);
  return res.data;
};

export const getAllReviewsAdminApi = async (): Promise<ReviewDto[]> => {
  const res = await axiosInstance.get('/api/reviews/admin/getAll');
  return res.data;
};

export const adminReplyReviewApi = async (id: number, reply: string) => {
  const res = await axiosInstance.put(`/api/reviews/admin/${id}/reply`, { reply });
  return res.data;
};

export const deleteReviewAdminApi = async (id: number) => {
  const res = await axiosInstance.delete(`/api/reviews/admin/delete/${id}`);
  return res.data;
};

export const adminSetReviewHiddenApi = async (id: number, hidden: boolean) => {
  const res = await axiosInstance.put(`/api/reviews/admin/${id}/hidden`, { hidden });
  return res.data;
};
