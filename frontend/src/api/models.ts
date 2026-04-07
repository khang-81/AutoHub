import axiosInstance from './axiosInstance';

export const getAllModelsApi = async () => {
  const res = await axiosInstance.get('/api/models/getAll');
  return res.data;
};

export const addModelApi = async (data: { name: string; brandId: number }) => {
  const res = await axiosInstance.post('/api/models/add', data);
  return res.data;
};

export const updateModelApi = async (data: { id: number; name: string; brandId: number }) => {
  const res = await axiosInstance.put('/api/models/update', data);
  return res.data;
};

export const deleteModelApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/models/delete', { data: { id } });
  return res.data;
};
