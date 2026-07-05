import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, CalendarClock, LogIn } from 'lucide-react';
import {
  createViewingAppointmentApi,
  getSlotAvailabilityApi,
  type SlotAvailability,
} from '../../api/viewingAppointments';
import { getAllCarsApi } from '../../api/cars';
import type { Car } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { getApiErrorMessage } from '../../utils/helpers';
import { useAuthStore } from '../../store/authStore';

const viewingSchema = z.object({
  carId: z.number().positive('Vui lòng chọn xe muốn xem'),
  name: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  contactPhone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  preferredDate: z.string().min(1, 'Chọn ngày mong muốn'),
  preferredTime: z.string().min(1, 'Chọn khung giờ'),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().or(z.literal('')),
});

type ViewingForm = z.infer<typeof viewingSchema>;

const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  'Phúc Am, Ngọc Hồi, Hà Nội'
)}&hl=vi&z=16&output=embed`;

const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: 'Điện thoại',
    main: '032 924 8087',
    sub: 'Thứ 2 – CN, 8:00 – 18:00',
    href: 'tel:0329248087',
  },
  {
    icon: Mail,
    title: 'Email',
    main: 'khang08012k4@gmail.com',
    sub: 'Phản hồi trong vài giờ làm việc',
    href: 'mailto:khang08012k4@gmail.com',
  },
  {
    icon: MapPin,
    title: 'Địa chỉ',
    main: 'Phúc Am, Ngọc Hồi, Hà Nội',
    sub: 'Showroom & nhận xe',
    href: undefined as string | undefined,
  },
] as const;

const Contact = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const viewingForm = useForm<ViewingForm>({ resolver: zodResolver(viewingSchema) });

  // Reset form + slots khi mount
  useEffect(() => {
    viewingForm.reset();
    setSlots([]);
    setSelectedDate('');
  }, [viewingForm]);

  const { data: cars = [], isLoading: loadingCars } = useQuery<Car[]>({
    queryKey: ['cars', 'viewing-form'],
    queryFn: getAllCarsApi,
  });

  // Tải slot availability khi chọn ngày
  const fetchSlots = async (date: string) => {
    setSelectedDate(date);
    setSlots([]);
    viewingForm.setValue('preferredTime', '');
    if (!date) return;
    setLoadingSlots(true);
    try {
      const result = await getSlotAvailabilityApi(date);
      setSlots(result);
    } catch {
      setSlots([]);
      showToast('Không thể tải khung giờ trống. Vui lòng thử lại.', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  const viewingMutation = useMutation({
    mutationFn: createViewingAppointmentApi,
    onSuccess: () => {
      showToast('Đặt lịch xem xe thành công! Chúng tôi sẽ xác nhận qua điện thoại hoặc email.', 'success');
      viewingForm.reset();
      setSlots([]);
      setSelectedDate('');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e?.response?.status === 401) {
        showToast('Vui lòng đăng nhập để đặt lịch xem xe.', 'error');
        navigate('/login', { state: { from: { pathname: '/contact' } } });
        return;
      }
      showToast(
        e?.response?.data?.message || getApiErrorMessage(err, 'Có lỗi khi đặt lịch. Vui lòng thử lại hoặc gọi hotline.'),
        'error'
      );
    },
  });

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tối thiểu đặt trước 1 ngày
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="min-h-screen pad-top-nav">
      <div className="bg-navy py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Liên hệ</span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-white mt-2 mb-3">
            AutoHub — Đặt lịch xem xe
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Đăng ký lịch đến showroom tại Phúc Am, Ngọc Hồi. Thông tin liên hệ đồng bộ với chân trang website.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-7">
              <h3 className="font-heading font-semibold text-navy text-lg mb-1">Thông tin liên hệ</h3>
              <p className="text-gray-500 text-sm mb-6">Cùng thông tin hiển thị ở phần chân trang.</p>
              <ul className="space-y-5">
                {CONTACT_ITEMS.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy text-sm">{item.title}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-gray-800 text-sm break-words hover:text-primary transition-colors"
                        >
                          {item.main}
                        </a>
                      ) : (
                        <p className="text-gray-800 text-sm">{item.main}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="font-medium text-navy text-sm">Bản đồ</p>
                <p className="text-gray-500 text-xs">Phúc Am, Ngọc Hồi, Hà Nội</p>
              </div>
              <div className="relative w-full aspect-[4/3] min-h-[220px] bg-navy/5">
                <iframe
                  title="Bản đồ AutoHub — Phúc Am, Ngọc Hồi, Hà Nội"
                  src={MAP_EMBED_SRC}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    'Phúc Am, Ngọc Hồi, Hà Nội'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mở chỉ đường trên Google Maps
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-5 h-5 text-primary" />
                <p className="font-heading font-semibold text-navy text-lg">Đặt lịch xem xe</p>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                Đăng ký lịch đến showroom tại Phúc Am, Ngọc Hồi. Chúng tôi sẽ xác nhận qua điện thoại hoặc email.
              </p>

              {!isAuthenticated && (
                <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <LogIn className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Cần đăng nhập để đặt lịch</p>
                    <p className="text-amber-700 mt-0.5">
                      Lịch xem xe sẽ được lưu vào tài khoản của bạn để quản lý trong dashboard.{' '}
                      <Link
                        to="/login"
                        state={{ from: { pathname: '/contact' } }}
                        className="font-semibold underline hover:text-amber-900"
                      >
                        Đăng nhập ngay
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              <form
                    onSubmit={viewingForm.handleSubmit((d) => {
                      const scheduledAt = `${d.preferredDate}T${d.preferredTime}:00`;
                      const noteParts = [
                        `Họ tên: ${d.name.trim()}`,
                        `Email: ${d.email.trim()}`,
                      ];
                      if (d.note?.trim()) {
                        noteParts.push('', d.note.trim());
                      }
                      viewingMutation.mutate({
                        carId: d.carId,
                        scheduledAt,
                        contactPhone: d.contactPhone.trim(),
                        note: noteParts.join('\n'),
                      });
                    })}
                    className="space-y-4"
                  >
                    {/* Chọn xe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Xe muốn xem *</label>
                      <select
                        {...viewingForm.register('carId', { valueAsNumber: true })}
                        className="input-field"
                        disabled={loadingCars}
                      >
                        <option value={0}>-- Chọn xe --</option>
                        {cars.map((c: Car) => (
                          <option key={c.id} value={c.id}>
                            {c.model?.brand?.name} {c.model?.name} {c.modelYear ? `(${c.modelYear})` : ''}
                          </option>
                        ))}
                      </select>
                      {loadingCars && <p className="text-gray-400 text-xs mt-1">Đang tải danh sách xe…</p>}
                      {viewingForm.formState.errors.carId && (
                        <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.carId.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                        <input {...viewingForm.register('name')} className="input-field" placeholder="Nguyễn Văn An" />
                        {viewingForm.formState.errors.name && (
                          <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          {...viewingForm.register('email')}
                          type="email"
                          className="input-field"
                          placeholder="you@example.com"
                        />
                        {viewingForm.formState.errors.email && (
                          <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        {...viewingForm.register('contactPhone')}
                        className="input-field"
                        placeholder="032 924 8087"
                      />
                      {viewingForm.formState.errors.contactPhone && (
                        <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.contactPhone.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mong muốn *</label>
                        <input
                          {...viewingForm.register('preferredDate')}
                          type="date"
                          className="input-field"
                          min={minDate}
                          onChange={(e) => fetchSlots(e.target.value)}
                        />
                        {viewingForm.formState.errors.preferredDate && (
                          <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.preferredDate.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ *</label>
                        {loadingSlots ? (
                          <div className="input-field flex items-center text-gray-400 text-sm">Đang tải khung giờ…</div>
                        ) : !selectedDate ? (
                          <div className="input-field flex items-center text-gray-400 text-sm">Chọn ngày trước</div>
                        ) : slots.length === 0 ? (
                          <div className="input-field flex items-center text-gray-400 text-sm">Không có khung giờ trống</div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1.5">
                            {slots.map((s) => (
                              <button
                                key={s.startTime}
                                type="button"
                                disabled={!s.available}
                                onClick={() => viewingForm.setValue('preferredTime', s.startTime.substring(0, 5))}
                                className={`text-xs py-2 rounded-lg border transition-colors ${
                                  !s.available
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                    : viewingForm.watch('preferredTime') === s.startTime.substring(0, 5)
                                    ? 'bg-primary text-white border-primary'
                                    : 'hover:bg-primary/10 border-gray-200'
                                }`}
                              >
                                {s.startTime.substring(0, 5)}
                              </button>
                            ))}
                          </div>
                        )}
                        {viewingForm.formState.errors.preferredTime && (
                          <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.preferredTime.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tuỳ chọn)</label>
                      <textarea
                        {...viewingForm.register('note')}
                        rows={3}
                        maxLength={500}
                        className="input-field resize-none"
                        placeholder="Nhu cầu xem xe, số người đi cùng, yêu cầu lái thử…"
                      />
                      {viewingForm.formState.errors.note && (
                        <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.note.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={viewingMutation.isPending || !isAuthenticated}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      {viewingMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CalendarClock className="w-4 h-4" />
                      )}
                      {viewingMutation.isPending ? 'Đang gửi…' : 'Gửi yêu cầu đặt lịch'}
                    </button>
                  </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
