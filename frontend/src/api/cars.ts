import axiosInstance from './axiosInstance';
import type { AddCarRequest, UpdateCarRequest } from '../types';

export const getAllCarsApi = async () => {
  const res = await axiosInstance.get('/api/cars/getAll');
  return res.data;
};

export const getCarByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/cars/getById/${id}`);
  return res.data;
};

export const addCarApi = async (data: AddCarRequest) => {
  const res = await axiosInstance.post('/api/cars/add', data);
  return res.data;
};

export const updateCarApi = async (data: UpdateCarRequest) => {
  const res = await axiosInstance.put('/api/cars/update', data);
  return res.data;
};

export const deleteCarApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/cars/delete', { data: { id } });
  return res.data;
};
