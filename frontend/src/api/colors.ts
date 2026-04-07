import axiosInstance from './axiosInstance';

export const getAllColorsApi = async () => {
  const res = await axiosInstance.get('/api/colors/getAll');
  return res.data;
};

export const addColorApi = async (data: { name: string }) => {
  const res = await axiosInstance.post('/api/colors/add', data);
  return res.data;
};

export const updateColorApi = async (data: { id: number; name: string }) => {
  const res = await axiosInstance.put('/api/colors/update', data);
  return res.data;
};

export const deleteColorApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/colors/delete', { data: { id } });
  return res.data;
};
