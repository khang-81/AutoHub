import axiosInstance from './axiosInstance';

export const getAllUsersApi = async () => {
  const res = await axiosInstance.get('/api/users/getAll');
  return res.data;
};

export const getUserByIdApi = async (id: number) => {
  const res = await axiosInstance.get(`/api/users/getById/${id}`);
  return res.data;
};

export const getUserRolesApi = async (userId: number): Promise<{ name: string }[]> => {
  try {
    const res = await axiosInstance.get(`/api/users/${userId}/roles`);
    return res.data || [];
  } catch {
    return [];
  }
};

export const deleteUserApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/users/delete', { data: { id } });
  return res.data;
};
