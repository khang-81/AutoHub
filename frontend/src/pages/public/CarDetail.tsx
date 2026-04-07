import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Calendar, Gauge, Tag, Palette, Shield, Star, ArrowLeft,
  CheckCircle, Car, MapPin, Fuel
} from 'lucide-react';
import { getCarByIdApi } from '../../api/cars';
import { addRentalApi } from '../../api/rentals';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatCurrency, calculateTotalPrice, formatDateForApi, CAR_PLACEHOLDER } from '../../utils/helpers';
import type { Car as CarType } from '../../types';

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuthStore();
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: car, isLoading } = useQuery<CarType>({
    queryKey: ['car', id],
    queryFn: () => getCarByIdApi(Number(id)),
    enabled: !!id,
  });

  const totalPrice = startDate && endDate && car
    ? calculateTotalPrice(car.dailyPrice, startDate, endDate)
    : 0;

  const days = startDate && endDate
    ? Math.max(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), 1)
    : 0;

  const rentalMutation = useMutation({
    mutationFn: addRentalApi,
    onSuccess: (res) => {
      // Backend returns { id, result: { success, message } }
      if (res?.id) {
        showToast(`Đặt xe thành công! Mã đơn: #${res.id}`, 'success');
        navigate('/dashboard/rentals');
      } else {
        showToast(res?.result?.message || 'Đặt xe thành công!', 'success');
        navigate('/dashboard/rentals');
      }
    },
    onError: () => {
      showToast('Có lỗi xảy ra khi đặt xe', 'error');
    },
  });

  const handleBook = () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để đặt xe', 'info');
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }
    if (!startDate || !endDate) {
      showToast('Vui lòng chọn ngày thuê và trả xe', 'info');
      return;
    }
    if (!car) return;

    rentalMutation.mutate({
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
      carId: car.id,
      userId: userId!,
    });
  };

  if (isLoading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Đang tải thông tin xe..." />
    </div>
  );

  if (!car) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 text-xl">Không tìm thấy xe</p>
        <Link to="/cars" className="btn-primary mt-4 inline-block">Quay lại</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Back */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách xe
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Car info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="card overflow-hidden">
              <div className="relative h-80 md:h-96 bg-gray-100">
                <img
                  src={car.imagePath || CAR_PLACEHOLDER}
                  alt={`${car.model?.brand?.name} ${car.model?.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = CAR_PLACEHOLDER; }}
                />
                <div className="absolute top-4 left-4">
                  <span className="badge bg-navy text-white">{car.model?.brand?.name}</span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 rounded-full px-3 py-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-semibold">4.9</span>
                </div>
              </div>
            </div>

            {/* Car name & price */}
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading font-bold text-2xl md:text-3xl text-navy">
                    {car.model?.brand?.name} {car.model?.name}
                  </h1>
                  <p className="text-gray-500 mt-1">{car.color?.name} • {car.modelYear}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-3xl text-primary">
                    {formatCurrency(car.dailyPrice)}
                  </p>
                  <p className="text-gray-400 text-sm">/ngày</p>
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-navy text-lg mb-5">Thông số kỹ thuật</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: 'Năm sản xuất', value: car.modelYear.toString() },
                  { icon: Gauge, label: 'Số km đã đi', value: `${(car.kilometer / 1000).toFixed(0)}k km` },
                  { icon: Palette, label: 'Màu sắc', value: car.color?.name },
                  { icon: Tag, label: 'Model', value: car.model?.name },
                  { icon: Car, label: 'Thương hiệu', value: car.model?.brand?.name },
                  { icon: Fuel, label: 'Nhiên liệu', value: 'Xăng' },
                ].map((spec) => (
                  <div key={spec.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <spec.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">{spec.label}</p>
                      <p className="font-semibold text-navy text-sm">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-navy text-lg mb-5">Tiện ích & Chính sách</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Bảo hiểm xe toàn diện',
                  'Hỗ trợ 24/7 trong chuyến đi',
                  'Xe đã được kiểm định kỹ thuật',
                  'Giao nhận xe tận nơi',
                  'Xe sạch sẽ, khử khuẩn',
                  'Hoàn tiền nếu huỷ sớm 24h',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-heading font-semibold text-navy text-lg mb-5">Đặt xe</h2>

              {/* Date pickers */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Ngày nhận xe
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => {
                      setStartDate(date);
                      if (endDate && date && date >= endDate) setEndDate(null);
                    }}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày nhận xe"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Ngày trả xe
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày trả xe"
                    className="input-field"
                    disabled={!startDate}
                  />
                </div>
              </div>

              {/* Price breakdown */}
              {days > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(car.dailyPrice)} × {days} ngày</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Phí dịch vụ</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-semibold text-navy">
                    <span>Tổng cộng</span>
                    <span className="text-primary text-lg">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

              {/* Book button */}
              <button
                onClick={handleBook}
                disabled={rentalMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {rentalMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {rentalMutation.isPending ? 'Đang xử lý...' : 'Đặt xe ngay'}
              </button>

              {!isAuthenticated && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  <Link to="/login" className="text-primary font-medium">Đăng nhập</Link> để đặt xe
                </p>
              )}

              {/* Info */}
              <div className="mt-5 space-y-2">
                {[
                  { icon: Shield, text: 'Thanh toán an toàn & bảo mật' },
                  { icon: MapPin, text: 'Giao xe tận địa điểm của bạn' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-gray-400">
                    <item.icon className="w-4 h-4 text-primary" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
