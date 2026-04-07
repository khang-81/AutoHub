import axiosInstance from './axiosInstance';
import type { LoginRequest, RegisterRequest } from '../types';

export const loginApi = async (data: LoginRequest) => {
  const res = await axiosInstance.post('/api/auth/login', data);
  return res.data;
};

export const registerApi = async (data: RegisterRequest) => {
  const res = await axiosInstance.post('/api/auth/register', data);
  return res.data;
};
