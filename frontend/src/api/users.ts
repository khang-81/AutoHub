import axiosInstance from './axiosInstance';

export interface ProfileResponse {
  id: number;
  email: string;
  password?: string;
  kycStatus?: string;
}

export const getProfileApi = async (): Promise<ProfileResponse> => {
  const res = await axiosInstance.get('/api/users/getProfile');
  return res.data;
};

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

export const changePasswordApi = async (data: { currentPassword: string; newPassword: string }) => {
  const res = await axiosInstance.put('/api/users/changePassword', data);
  return res.data;
};

export const deleteUserApi = async (id: number) => {
  const res = await axiosInstance.delete('/api/users/delete', { data: { id } });
  return res.data;
};
