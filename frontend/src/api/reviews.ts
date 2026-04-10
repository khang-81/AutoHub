import axiosInstance from './axiosInstance';

export interface ReviewDto {
  id: number;
  rentalId: number;
  rating: number;
  comment: string | null;
  createdDate: string;
  authorLabel: string;
}

export const getReviewsByCarIdApi = async (carId: number): Promise<ReviewDto[]> => {
  const res = await axiosInstance.get(`/api/reviews/car/${carId}`);
  return res.data;
};

export const addReviewApi = async (data: { rentalId: number; rating: number; comment?: string }) => {
  const res = await axiosInstance.post('/api/reviews/add', data);
  return res.data;
};
