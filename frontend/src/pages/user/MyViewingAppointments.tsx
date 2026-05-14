import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Car, Eye, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelMyViewingAppointmentApi,
  getMyViewingAppointmentsApi,
  rescheduleViewingAppointmentApi,
  getSlotAvailabilityApi,
  type SlotAvailability,
} from '../../api/viewingAppointments';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';
import { CAR_PLACEHOLDER, formatDateTime } from '../../utils/helpers';
import type { ViewingAppointment } from '../../types';

const statusLabel = (s: string) => {
  switch (s) {
    case 'PENDING':
      return 'Chờ xác nhận';
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'COMPLETED':
      return 'Đã xem xong';
    case 'NO_SHOW':
      return 'Không đến';
    default:
      return s;
  }
};

const MyViewingAppointments = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [minRescheduleDate] = useState(() =>
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['myViewingAppointments'],
    queryFn: getMyViewingAppointmentsApi,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelMyViewingAppointmentApi(id),
    onSuccess: (data) => {
      showToast(data?.message || 'Đã hủy lịch', 'success');
      queryClient.invalidateQueries({ queryKey: ['myViewingAppointments'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể hủy lịch', 'error');
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: number; scheduledAt: string }) =>
      rescheduleViewingAppointmentApi(id, scheduledAt),
    onSuccess: (data) => {
      showToast(data?.message || 'Đã dời lịch', 'success');
      setRescheduleId(null);
      queryClient.invalidateQueries({ queryKey: ['myViewingAppointments'] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(e?.response?.data?.message || 'Không thể dời lịch', 'error');
    },
  });

  const handleDateChange = async (date: string) => {
    setRescheduleDate(date);
    setRescheduleTime('');
    if (date) {
      try {
        const result = await getSlotAvailabilityApi(date);
        setSlots(result);
      } catch {
        setSlots([]);
      }
    } else {
      setSlots([]);
    }
  };

  const submitReschedule = () => {
    if (!rescheduleId || !rescheduleDate || !rescheduleTime) return;
    const scheduledAt = `${rescheduleDate}T${rescheduleTime}:00`;
    rescheduleMutation.mutate({ id: rescheduleId, scheduledAt });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-navy">Lịch xem xe</h1>
        </div>
        <p className="text-gray-400 text-sm">Các lịch hẹn xem xe bạn đã đặt tại showroom / điểm hẹn</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-navy text-lg mb-2">Chưa có lịch xem xe</h3>
          <p className="text-gray-400 mb-6">Đặt lịch từ trang chi tiết xe đang bán.</p>
          <Link to="/cars/mua" className="btn-primary inline-flex items-center gap-2">
            <Car className="w-4 h-4" />
            Xem xe đang bán
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Reschedule modal */}
          {rescheduleId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="font-heading font-semibold text-navy text-lg mb-4">Dời lịch hẹn</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Ngày mới</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={minRescheduleDate}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  {slots.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Chọn khung giờ</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {slots.map((s) => (
                          <button
                            key={s.startTime}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setRescheduleTime(s.startTime.substring(0, 5))}
                            className={`text-xs py-1.5 rounded-lg border transition-colors ${
                              !s.available
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : rescheduleTime === s.startTime.substring(0, 5)
                                ? 'bg-primary text-white border-primary'
                                : 'hover:bg-primary/10 border-gray-200'
                            }`}
                          >
                            {s.startTime.substring(0, 5)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setRescheduleId(null)}
                    className="flex-1 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={submitReschedule}
                    disabled={!rescheduleDate || !rescheduleTime || rescheduleMutation.isPending}
                    className="flex-1 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          )}

          {items.map((row: ViewingAppointment) => (
            <div
              key={row.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
                  <img
                    src={row.car?.imagePath || CAR_PLACEHOLDER}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CAR_PLACEHOLDER;
                    }}
                  />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-navy">
                        {row.car?.model?.brand?.name} {row.car?.model?.name}
                      </h3>
                      <p className="text-gray-400 text-sm">#{row.id}</p>
                    </div>
                    <span className="badge text-sm bg-amber-100 text-amber-800">
                      {statusLabel(row.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-gray-400">Thời gian: </span>
                    <strong>{formatDateTime(row.scheduledAt)}</strong>
                  </p>
                  {row.note && (
                    <p className="text-sm text-gray-500 mb-2">
                      Ghi chú: {row.note}
                    </p>
                  )}
                  {row.contactPhone && (
                    <p className="text-sm text-gray-500 mb-2">SĐT: {row.contactPhone}</p>
                  )}
                  {row.adminNote && (
                    <p className="text-sm text-primary/90 mb-3 p-2 bg-primary/5 rounded-lg">
                      Phản hồi: {row.adminNote}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(row.status === 'PENDING' || row.status === 'CONFIRMED') && (
                      <button
                        type="button"
                        onClick={() => { setRescheduleId(row.id); setRescheduleDate(''); setRescheduleTime(''); setSlots([]); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Dời lịch
                      </button>
                    )}
                    {row.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => cancelMutation.mutate(row.id)}
                        disabled={cancelMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                      >
                        <X className="w-3.5 h-3.5" />
                        Hủy lịch
                      </button>
                    )}
                    <Link
                      to={`/cars/${row.car?.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem xe
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyViewingAppointments;
