import axiosInstance from './axiosInstance';

export interface BankInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountNumberDisplay: string;
  accountName: string;
}

export const getBankInfoApi = async (): Promise<BankInfo> => {
  const res = await axiosInstance.get<BankInfo>('/api/payment/bank-info');
  return res.data;
};
