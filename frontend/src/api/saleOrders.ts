import axiosInstance from './axiosInstance';
import type { AddSaleOrderRequest, AddSaleOrderResponse, SaleOrder } from '../types';

export const addSaleOrderApi = async (data: AddSaleOrderRequest) => {
  const res = await axiosInstance.post<AddSaleOrderResponse>('/api/sale-orders/add', data);
  return res.data;
};

export const getAllSaleOrdersApi = async () => {
  const res = await axiosInstance.get<SaleOrder[]>('/api/sale-orders/getAll');
  return res.data;
};

export const getSaleOrderByIdApi = async (id: number) => {
  const res = await axiosInstance.get<SaleOrder>(`/api/sale-orders/getById/${id}`);
  return res.data;
};

export const getMySaleOrdersApi = async () => {
  const res = await axiosInstance.get<SaleOrder[]>('/api/sale-orders/getByUserId');
  return res.data;
};

export const submitSaleTransferApi = async (id: number) => {
  const res = await axiosInstance.put(`/api/sale-orders/submitTransfer/${id}`);
  return res.data;
};

export const confirmSaleOrderAdminApi = async (id: number) => {
  const res = await axiosInstance.put(`/api/sale-orders/confirm/${id}`);
  return res.data;
};

export const cancelSaleOrderApi = async (id: number, reason?: string) => {
  const res = await axiosInstance.put(`/api/sale-orders/cancel/${id}`, reason ? { reason } : {});
  return res.data;
};
