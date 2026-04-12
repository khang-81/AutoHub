import axiosInstance from './axiosInstance';
import type { AddCarRequest, PagedCarsResponse, UpdateCarRequest } from '../types';

export const getAllCarsApi = async () => {
  const res = await axiosInstance.get('/api/cars/getAll');
  return res.data;
};

export type SearchCarsParams = {
  page: number;
  size?: number;
  brandId?: number;
  colorId?: number;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  listing?: '' | 'rent' | 'sale';
  q?: string;
};

export const searchCarsApi = async (params: SearchCarsParams): Promise<PagedCarsResponse> => {
  const sp = new URLSearchParams();
  sp.set('page', String(params.page));
  sp.set('size', String(params.size ?? 9));
  if (params.brandId != null) sp.set('brandId', String(params.brandId));
  if (params.colorId != null) sp.set('colorId', String(params.colorId));
  if (params.minPrice != null) sp.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  if (params.minYear != null) sp.set('minYear', String(params.minYear));
  if (params.listing) sp.set('listing', params.listing);
  if (params.q != null && params.q !== '') sp.set('q', params.q);
  const res = await axiosInstance.get<PagedCarsResponse>(`/api/cars/search?${sp.toString()}`);
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
