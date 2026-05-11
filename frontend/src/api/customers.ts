import axiosInstance from './axiosInstance';
import type { AddCustomerRequest, UpdateCustomerRequest, Customer } from '../types';

export const getAllCustomersApi = async () => {
  const res = await axiosInstance.get('/api/customers/getAll');
  return res.data;
};

export const getCustomerByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/customers/getById/${id}`);
  return res.data;
};

/**
 * Lấy hồ sơ Customer của user đang đăng nhập.
 * Backend trả 204 No Content khi user chưa từng tạo hồ sơ — helper trả null.
 */
export const getMyCustomerApi = async (): Promise<Customer | null> => {
  const res = await axiosInstance.get('/api/customers/me', { validateStatus: (s) => s === 200 || s === 204 });
  if (res.status === 204) return null;
  return res.data as Customer;
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
