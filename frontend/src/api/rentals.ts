import axiosInstance from './axiosInstance';
import type { AddRentalRequest } from '../types';

export const getAllRentalsApi = async () => {
  const res = await axiosInstance.get('/api/rentals/getAll');
  return res.data;
};

export const getRentalByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/rentals/getById/${id}`);
  return res.data;
};

export const getRentalsByUserIdApi = async () => {
  try {
    const res = await axiosInstance.get('/api/rentals/getRentalsByUserId');
    return res.data;
  } catch (err: unknown) {
    const e = err as { response?: { status?: number } };
    // Backend throws 404 when no rentals found - treat as empty array
    if (e?.response?.status === 404 || e?.response?.status === 400) {
      return [];
    }
    throw err;
  }
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
