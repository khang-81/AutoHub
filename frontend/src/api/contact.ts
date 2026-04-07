import axiosInstance from './axiosInstance';
import type { ContactMailRequest, JoinUsMailRequest } from '../types';

export const sendContactEmailApi = async (data: ContactMailRequest) => {
  const res = await axiosInstance.post('/api/contact/sendContactPageEmail', data);
  return res.data;
};

export const sendJoinUsEmailApi = async (data: JoinUsMailRequest) => {
  const res = await axiosInstance.post('/api/contact/sendJoinUsEmail', data);
  return res.data;
};
