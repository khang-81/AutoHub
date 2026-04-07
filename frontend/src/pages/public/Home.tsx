import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Shield, Clock, ThumbsUp, ChevronRight,
  Star, MapPin, ArrowRight, Car, Users, Award, Headphones
} from 'lucide-react';
import { getAllCarsApi } from '../../api/cars';
import { getAllBrandsApi } from '../../api/brands';
import CarCard from '../../components/ui/CarCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Car as CarType, Brand } from '../../types';

const heroImages = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=85',
];

const testimonials = [
  {
    name: 'Nguyễn Văn An',
    location: 'TP. Hồ Chí Minh',
    rating: 5,
    comment: 'Dịch vụ tuyệt vời! Xe sạch sẽ, thủ tục nhanh gọn. Tôi đã thuê xe nhiều lần và rất hài lòng.',
    avatar: 'https://i.pravatar.cc/60?img=1',
  },
  {
    name: 'Trần Thị Bình',
    location: 'Hà Nội',
    rating: 5,
    comment: 'AutoHub có danh mục xe phong phú, giá cả hợp lý. Nhân viên hỗ trợ nhiệt tình.',
    avatar: 'https://i.pravatar.cc/60?img=5',
  },
  {
    name: 'Lê Minh Châu',
    location: 'Đà Nẵng',
    rating: 4,
    comment: 'Đặt xe dễ dàng qua app, nhận xe đúng hẹn. Chắc chắn sẽ quay lại thuê tiếp.',
    avatar: 'https://i.pravatar.cc/60?img=8',
  },
];

const steps = [
  {
    icon: Search,
    title: 'Tìm & Chọn xe',
    desc: 'Duyệt hàng trăm xe từ các thương hiệu hàng đầu, lọc theo nhu cầu của bạn.',
    step: '01',
  },
  {
    icon: MapPin,
    title: 'Đặt xe & Thanh toán',
    desc: 'Chọn ngày thuê, điền thông tin và thanh toán an toàn qua nhiều hình thức.',
    step: '02',
  },
  {
    icon: Car,
    title: 'Nhận xe & Khởi hành',
    desc: 'Nhận xe tại địa điểm thuận tiện và bắt đầu hành trình của bạn.',
    step: '03',
  },
];

const stats = [
  { icon: Car, value: '500+', label: 'Xe cho thuê' },
  { icon: Users, value: '10,000+', label: 'Khách hàng' },
  { icon: Award, value: '50+', label: 'Thành phố' },
  { icon: Headphones, value: '24/7', label: 'Hỗ trợ' },
];

const Home = () => {
  const [searchBrand, setSearchBrand] = useState('');
  const navigate = useNavigate();

  const { data: cars = [], isLoading: carsLoading } = useQuery<CarType[]>({
    queryKey: ['cars'],
    queryFn: getAllCarsApi,
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: getAllBrandsApi,
  });

  const featuredCars = cars.slice(0, 6);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchBrand) params.set('brand', searchBrand);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(27,42,74,0.93) 0%, rgba(27,42,74,0.75) 100%), url(${heroImages[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-medium">Nền tảng thuê xe #1 Việt Nam</span>
          </div>

          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
            Thuê xe nhanh chóng
            <br />
            <span className="text-primary">An toàn & Tiện lợi</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Khám phá hàng trăm xe từ các thương hiệu hàng đầu. Đặt xe ngay hôm nay và trải nghiệm sự khác biệt cùng AutoHub.
          </p>

          {/* Search box */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="btn-primary flex items-center justify-center gap-2 sm:w-auto"
              >
                <Search className="w-5 h-5" />
                Tìm xe
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-heading font-bold text-3xl text-primary mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Quy trình</span>
            <h2 className="section-title mt-2">Thuê xe chỉ 3 bước đơn giản</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

            {steps.map((step) => (
              <div key={step.step} className="relative text-center group">
                <div className="inline-flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-navy rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300 shadow-lg">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-navy mb-3">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Cars ────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Xe nổi bật</span>
              <h2 className="section-title mt-2">Xe được thuê nhiều nhất</h2>
            </div>
            <Link
              to="/cars"
              className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Xem tất cả <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {carsLoading ? (
            <LoadingSpinner text="Đang tải danh sách xe..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/cars" className="btn-outline inline-flex items-center gap-2">
              Xem tất cả xe <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why choose us ───────────────────────────────────────────── */}
      <section className="py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Tại sao chọn chúng tôi</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mt-2 mb-6">
                Trải nghiệm thuê xe <br />
                <span className="text-primary">đẳng cấp khác biệt</span>
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                AutoHub cam kết mang đến dịch vụ thuê xe chất lượng cao nhất với đội xe đa dạng,
                quy trình đơn giản và hỗ trợ khách hàng 24/7.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: 'Bảo hiểm đầy đủ', desc: 'Tất cả xe đều có bảo hiểm toàn diện' },
                  { icon: Clock, title: 'Linh hoạt 24/7', desc: 'Hỗ trợ và nhận xe bất cứ lúc nào' },
                  { icon: ThumbsUp, title: 'Giá tốt nhất', desc: 'Cam kết giá tốt, không phát sinh' },
                  { icon: Star, title: 'Xe chất lượng', desc: 'Đội xe mới, được bảo dưỡng thường xuyên' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                      <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80"
                  alt="Premium car"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-2xl text-navy">4.9/5</p>
                    <p className="text-gray-500 text-xs">Từ 2,500+ đánh giá</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Đánh giá</span>
            <h2 className="section-title mt-2">Khách hàng nói gì về chúng tôi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? 'text-primary fill-primary' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-navy text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{
          background: 'linear-gradient(135deg, #C9A227 0%, #A8871F 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white mb-4">
            Sẵn sàng lên đường cùng AutoHub?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Hàng trăm xe chờ bạn khám phá. Đặt ngay hôm nay!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cars"
              className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Khám phá xe ngay <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Liên hệ chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
