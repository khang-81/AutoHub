import axiosInstance from './axiosInstance';
import type {
  CreateViewingAppointmentRequest,
  UpdateViewingStatusRequest,
  ViewingAppointment,
} from '../types';

export interface SlotAvailability {
  startTime: string;
  booked: number;
  maxPerSlot: number;
  available: boolean;
}

export async function createViewingAppointmentApi(
  body: CreateViewingAppointmentRequest
): Promise<ViewingAppointment> {
  const { data } = await axiosInstance.post<ViewingAppointment>('/api/viewing-appointments', body);
  return data;
}

export async function getMyViewingAppointmentsApi(): Promise<ViewingAppointment[]> {
  const { data } = await axiosInstance.get<ViewingAppointment[]>('/api/viewing-appointments/my');
  return data;
}

export async function cancelMyViewingAppointmentApi(id: number): Promise<{ success: boolean; message: string }> {
  const { data } = await axiosInstance.put(`/api/viewing-appointments/${id}/cancel`);
  return data;
}

export async function rescheduleViewingAppointmentApi(
  id: number,
  scheduledAt: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await axiosInstance.put(`/api/viewing-appointments/${id}/reschedule`, { scheduledAt });
  return data;
}

export async function getSlotAvailabilityApi(date: string): Promise<SlotAvailability[]> {
  const { data } = await axiosInstance.get<SlotAvailability[]>('/api/viewing-appointments/availability', {
    params: { date },
  });
  return data;
}

export async function getAllViewingAppointmentsAdminApi(): Promise<ViewingAppointment[]> {
  const { data } = await axiosInstance.get<ViewingAppointment[]>('/api/viewing-appointments/all');
  return data;
}

export async function updateViewingStatusAdminApi(
  id: number,
  body: UpdateViewingStatusRequest
): Promise<{ success: boolean; message: string }> {
  const { data } = await axiosInstance.put(`/api/viewing-appointments/${id}/status`, body);
  return data;
}
