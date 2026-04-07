import axiosInstance from './axiosInstance';

export const getAllBrandsApi = async () => {
  const res = await axiosInstance.get('/api/brands/getAll');
  return res.data;
};

export const getBrandByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/brands/getById/${id}`);
  return res.data;
};

export const addBrandApi = async (data: { name: string }) => {
  const res = await axiosInstance.post('/api/brands/add', data);
  return res.data;
};

export const updateBrandApi = async (data: { id: number; name: string }) => {
  const res = await axiosInstance.put('/api/brands/update', data);
  return res.data;
};

export const deleteBrandApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/brands/delete', { data: { id } });
  return res.data;
};
