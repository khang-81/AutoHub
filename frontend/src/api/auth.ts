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

export const forgotPasswordApi = async (data: { email: string }) => {
  const res = await axiosInstance.post('/api/auth/forgot-password', data);
  return res.data;
};

export const resetPasswordApi = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const res = await axiosInstance.post('/api/auth/reset-password', data);
  return res.data;
};
