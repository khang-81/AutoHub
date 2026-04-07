import axiosInstance from './axiosInstance';
import type { AddCustomerRequest, UpdateCustomerRequest } from '../types';

export const getAllCustomersApi = async () => {
  const res = await axiosInstance.get('/api/customers/getAll');
  return res.data;
};

export const getCustomerByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/customers/getById/${id}`);
  return res.data;
};

export const addCustomerApi = async (data: AddCustomerRequest) => {
  const res = await axiosInstance.post('/api/customers/add', data);
  return res.data;
};

export const updateCustomerApi = async (data: UpdateCustomerRequest) => {
  const res = await axiosInstance.put('/api/customers/update', data);
  return res.data;
};

export const deleteCustomerApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/customers/delete', { data: { id } });
  return res.data;
};
