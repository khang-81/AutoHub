import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Calendar, Gauge, Tag, Palette, Shield, Star, ArrowLeft,
  CheckCircle, Car, MapPin, Fuel, CreditCard, Scale
} from 'lucide-react';
import { getCarByIdApi } from '../../api/cars';
import { getAllRentalsApi, getInsuranceOptionsApi, addRentalApi } from '../../api/rentals';
import { addSaleOrderApi } from '../../api/saleOrders';
import { getProfileApi } from '../../api/users';
import { getReviewsByCarIdApi } from '../../api/reviews';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  formatCurrency,
  calculateRentalDays,
  formatDateForApi,
  formatDate,
  CAR_PLACEHOLDER,
} from '../../utils/helpers';
import { HANOI_DISTRICTS } from '../../data/hanoiDistricts';
import type { Car as CarType, Rental } from '../../types';

const CarDetail = () => {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useAuthStore();
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [salePaymentMethod, setSalePaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [insuranceCode, setInsuranceCode] = useState('NONE');
  const [pickupDistrict, setPickupDistrict] = useState('');
  const [extraFeesAmount, setExtraFeesAmount] = useState('');

  const { data: car, isLoading } = useQuery<CarType>({
    queryKey: ['car', id],
    queryFn: () => getCarByIdApi(Number(id)),
    enabled: !!id,
  });
  const { data: rentals = [] } = useQuery<Rental[]>({ queryKey: ['rentals'], queryFn: getAllRentalsApi });

  const { data: insuranceOptions = [] } = useQuery({
    queryKey: ['insuranceOptions'],
    queryFn: getInsuranceOptionsApi,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfileApi,
    enabled: isAuthenticated,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviewsByCarIdApi(Number(id)),
    enabled: !!id,
  });

  const bookedRanges = rentals
    .filter((r) =>
      r.car?.id === Number(id) &&
      !r.returnDate &&
      r.rentalStatus !== 'COMPLETED' &&
      r.rentalStatus !== 'CANCELLED' &&
      !!r.startDate &&
      !!r.endDate
    )
    .map((r) => ({
      start: new Date(`${r.startDate}T00:00:00`),
      end: new Date(`${r.endDate}T00:00:00`),
      label: `${r.startDate} - ${r.endDate}`,
    }));

  const isBookedDate = (date: Date) =>
    bookedRanges.some((range) => date >= range.start && date <= range.end);
  const getDayClassName = (date: Date) => (isBookedDate(date) ? 'booked-day' : '');

  const rentalDays =
    startDate && endDate && car ? calculateRentalDays(startDate, endDate) : 0;

  const selectedOption = insuranceOptions.find((o) => o.code === insuranceCode);
  const insuranceFeePerDay = selectedOption?.feePerDay ?? 0;

  const baseRental =
    startDate && endDate && car ? car.dailyPrice * rentalDays : 0;
  const insuranceTotal = rentalDays > 0 ? insuranceFeePerDay * rentalDays : 0;
  const extrasNum = Math.max(0, parseFloat(extraFeesAmount.replace(/,/g, '')) || 0);
  const totalPrice = baseRental + insuranceTotal + extrasNum;
  const depositEstimate = totalPrice > 0 ? Math.max(500_000, totalPrice * 0.15) : 0;

  const listingType = (car?.listingType || 'RENT_ONLY').toUpperCase();
  const canRent = !!car && (listingType === 'RENT_ONLY' || listingType === 'BOTH') && car.dailyPrice > 0;
  const canBuy =
    !!car &&
    (listingType === 'SALE_ONLY' || listingType === 'BOTH') &&
    car.saleStatus === 'AVAILABLE' &&
    (car.salePrice ?? 0) > 0;

  const saleMutation = useMutation({
    mutationFn: (pm: 'CASH' | 'BANK_TRANSFER') =>
      addSaleOrderApi({ carId: Number(id), paymentMethod: pm }),
    onSuccess: (res, pm) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', id] });
      queryClient.invalidateQueries({ queryKey: ['mySaleOrders'] });
      const newId = res?.id;
      if (newId && pm === 'BANK_TRANSFER') {
        navigate(`/dashboard/sale-payment/${newId}`);
      } else if (newId) {
        showToast('Đặt mua thành công! Đơn đang chờ admin xác nhận.', 'success');
        navigate('/dashboard/sale-orders');
      } else {
        navigate('/dashboard/sale-orders');
      }
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } | Record<string, string> } };
      const data = apiError?.response?.data;
      const message =
        (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
          ? data.message
          : null) ||
        (typeof data === 'object' && data !== null
          ? Object.values(data).find((v) => typeof v === 'string')
          : null) ||
        'Không thể đặt mua';
      showToast(String(message), 'error');
    },
  });

  const rentalMutation = useMutation({
    mutationFn: addRentalApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['myRentals'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['car', id] });
      // Backend returns { id, result: { success, message } }
      if (res?.id) {
        navigate(`/dashboard/payment/${res.id}`);
      } else {
        navigate('/dashboard/rentals');
      }
    },
    onError: (error: unknown) => {
      const apiError = error as {
        response?: {
          data?: { message?: string } | Record<string, string>;
        };
      };
      const data = apiError?.response?.data;
      const message =
        (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
          ? data.message
          : null) ||
        (typeof data === 'object' && data !== null
          ? Object.values(data).find((v) => typeof v === 'string')
          : null) ||
        'Có lỗi xảy ra khi đặt xe';
      showToast(String(message), 'error');
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
    if (!userId) {
      showToast('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại', 'error');
      navigate('/login');
      return;
    }
    if (!car) return;

    if (isAuthenticated) {
      if (profileLoading) {
        showToast('Đang kiểm tra hồ sơ...', 'info');
        return;
      }
      if (profile?.kycStatus !== 'APPROVED') {
        showToast('Vui lòng đăng tải và được duyệt CCCD + GPLX trước khi đặt xe.', 'info');
        navigate('/dashboard/kyc');
        return;
      }
    }

    const extrasNum = Math.max(0, parseFloat(extraFeesAmount.replace(/,/g, '')) || 0);

    rentalMutation.mutate({
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
      carId: car.id,
      userId,
      paymentMethod,
      insuranceCode: insuranceCode || 'NONE',
      extraFeesAmount: extrasNum,
      pickupDistrict: pickupDistrict || undefined,
    });
  };

  const handleBuySale = () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để đặt mua', 'info');
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }
    if (!userId || !car) return;
    if (profileLoading) {
      showToast('Đang kiểm tra hồ sơ...', 'info');
      return;
    }
    if (profile?.kycStatus !== 'APPROVED') {
      showToast('Vui lòng xác minh CCCD + GPLX trước khi đặt mua.', 'info');
      navigate('/dashboard/kyc');
      return;
    }
    saleMutation.mutate(salePaymentMethod);
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
        <Link to="/cars/tat-ca" className="btn-primary mt-4 inline-block">Quay lại</Link>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Back */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/cars/tat-ca"
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
                  <span className="text-sm font-semibold">
                    {car.reviewCount != null && car.reviewCount > 0 && car.averageRating != null
                      ? car.averageRating.toFixed(1)
                      : '—'}
                  </span>
                  {car.reviewCount != null && car.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">({car.reviewCount})</span>
                  )}
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
                  <p className="text-gray-500 mt-1">
                    {car.color?.name} • {car.modelYear}
                    {car.serviceCity ? ` • ${car.serviceCity}` : ' • Hà Nội'}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  {canRent && car.dailyPrice > 0 && (
                    <div>
                      <p className="font-heading font-bold text-2xl text-primary">
                        {formatCurrency(car.dailyPrice)}
                      </p>
                      <p className="text-gray-400 text-sm">Thuê / ngày</p>
                    </div>
                  )}
                  {canBuy && car.salePrice != null && (
                    <div>
                      <p className="font-heading font-bold text-2xl text-amber-700">
                        {formatCurrency(car.salePrice)}
                      </p>
                      <p className="text-gray-400 text-sm">Giá mua</p>
                    </div>
                  )}
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

            {/* Cancel & deposit policy */}
            <div className="card p-6 border border-amber-100 bg-amber-50/40">
              <h2 className="font-heading font-semibold text-navy text-lg mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-700" />
                Hủy đơn & hoàn cọc
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                Tiền cọc được tính tối thiểu <strong>500.000đ</strong> hoặc <strong>15%</strong> giá trị chuyến (tùy mức nào cao hơn).
              </p>
              <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                <li>
                  Tính theo thời điểm hủy so với <strong>0h ngày nhận xe</strong>: còn trên <strong>48 giờ</strong> — hoàn{' '}
                  <strong>100%</strong> cọc; từ <strong>24–48 giờ</strong> — hoàn <strong>50%</strong>; dưới <strong>24 giờ</strong> —{' '}
                  <strong>không hoàn</strong> cọc.
                </li>
                <li>
                  Sau khi đã nhận xe hoặc quá thời hạn trên, điều kiện áp dụng theo đơn và xác nhận từ công ty.
                </li>
              </ul>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="font-heading font-semibold text-navy text-lg mb-5">
                Đánh giá từ khách hàng
                {car.reviewCount != null && car.reviewCount > 0 && car.averageRating != null && (
                  <span className="text-primary font-bold ml-2">
                    {car.averageRating.toFixed(1)} / 5 ({car.reviewCount} lượt)
                  </span>
                )}
              </h2>
              {reviewsLoading ? (
                <p className="text-gray-400 text-sm">Đang tải đánh giá...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có đánh giá cho xe này.</p>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((rev) => (
                    <li key={rev.id} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-amber-500 tracking-tight">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 inline fill-amber-500 text-amber-500" />
                          ))}
                        </span>
                        <span className="text-xs text-gray-500">{rev.authorLabel}</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(rev.createdDate)}
                        </span>
                      </div>
                      {rev.comment ? (
                        <p className="text-sm text-gray-700 leading-relaxed">{rev.comment}</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Không có nhận xét thêm</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Booking & Buy */}
          <div className="lg:col-span-1 space-y-6">
            {canRent && (
            <div className="card p-6 sticky top-24">
              <h2 className="font-heading font-semibold text-navy text-lg mb-5">Đặt thuê xe</h2>

              {isAuthenticated && !profileLoading && profile?.kycStatus !== 'APPROVED' && (
                <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                  <p className="font-medium mb-1">Cần xác minh danh tính</p>
                  <p className="text-gray-700 mb-2">Tải CCCD và GPLX để đặt xe.</p>
                  <Link to="/dashboard/kyc" className="text-primary font-semibold hover:underline">
                    Đi tới xác minh →
                  </Link>
                </div>
              )}

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
                    dayClassName={getDayClassName}
                    filterDate={(date) => !isBookedDate(date)}
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
                    dayClassName={getDayClassName}
                    filterDate={(date) => !isBookedDate(date)}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                    <span>Xe đã đặt</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
                    <span>Xe có sẵn</span>
                  </div>
                </div>
              </div>

              {/* Location & extras */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Quận nhận xe (Hà Nội)
                  </label>
                  <select
                    value={pickupDistrict}
                    onChange={(e) => setPickupDistrict(e.target.value)}
                    className="input-field"
                  >
                    <option value="">— Chọn quận —</option>
                    {HANOI_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gói bảo hiểm thêm</label>
                  <select
                    value={insuranceCode}
                    onChange={(e) => setInsuranceCode(e.target.value)}
                    className="input-field"
                  >
                    {insuranceOptions.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.name}
                        {o.feePerDay > 0 ? ` (+${formatCurrency(o.feePerDay)}/ngày)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phụ phí khác (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={extraFeesAmount}
                    onChange={(e) => setExtraFeesAmount(e.target.value)}
                    placeholder="0"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">Giao xe tận nơi, phát sinh khác (nếu có)</p>
                </div>
              </div>

              {/* Price breakdown */}
              {rentalDays > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Thuê xe × {rentalDays} ngày</span>
                    <span>{formatCurrency(baseRental)}</span>
                  </div>
                  {insuranceTotal > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Bảo hiểm ({selectedOption?.name || insuranceCode})</span>
                      <span>{formatCurrency(insuranceTotal)}</span>
                    </div>
                  )}
                  {extrasNum > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Phụ phí</span>
                      <span>{formatCurrency(extrasNum)}</span>
                    </div>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-semibold text-navy">
                    <span>Tổng thanh toán dự kiến</span>
                    <span className="text-primary text-lg">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Tiền cọc (ước tính)</span>
                    <span>{formatCurrency(depositEstimate)}</span>
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'BANK_TRANSFER')}
                  className="input-field"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="CASH">Tiền mặt khi nhận xe</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Sau khi đặt xe, bạn sẽ được chuyển đến trang thanh toán theo phương thức đã chọn.
                </p>
              </div>

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
            )}

            {canBuy && (
              <div className="card p-6 border-2 border-amber-100">
                <h2 className="font-heading font-semibold text-navy text-lg mb-2">Mua xe</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Giá niêm yết <span className="font-bold text-amber-700">{formatCurrency(car.salePrice!)}</span>
                </p>
                {isAuthenticated && !profileLoading && profile?.kycStatus !== 'APPROVED' && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                    <Link to="/dashboard/kyc" className="text-primary font-semibold hover:underline">
                      Xác minh KYC để đặt mua →
                    </Link>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">Thanh toán</label>
                <select
                  value={salePaymentMethod}
                  onChange={(e) => setSalePaymentMethod(e.target.value as 'CASH' | 'BANK_TRANSFER')}
                  className="input-field mb-4"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="CASH">Tiền mặt khi giao xe</option>
                </select>
                <button
                  type="button"
                  onClick={handleBuySale}
                  disabled={saleMutation.isPending}
                  className="w-full py-3 rounded-xl font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {saleMutation.isPending ? 'Đang xử lý...' : 'Đặt mua xe'}
                </button>
                {!isAuthenticated && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    <Link to="/login" className="text-primary font-medium">Đăng nhập</Link> để đặt mua
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
