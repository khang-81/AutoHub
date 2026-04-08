import axiosInstance from './axiosInstance';

export const getAllInvoicesApi = async () => {
  const res = await axiosInstance.get('/api/invoices/getAll');
  return res.data;
};

export const getMyInvoicesApi = async () => {
  const res = await axiosInstance.get('/api/invoices/getMyInvoices');
  return res.data;
};

export const getInvoiceByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/invoices/getById/${id}`);
  return res.data;
};
