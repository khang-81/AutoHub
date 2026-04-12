import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Share2, Heart, Play } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                Auto<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              AutoHub – Nền tảng thuê và mua bán ô tô uy tín hàng đầu Việt Nam.
              Chúng tôi mang đến trải nghiệm lái xe tuyệt vời với giá cả minh bạch.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-navy-400 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-navy-400 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Heart className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-navy-400 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Play className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">Liên kết nhanh</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Trang chủ', to: '/' },
                { label: 'Thuê xe', to: '/cars' },
                { label: 'Mua xe', to: '/cars/mua' },
                { label: 'Tất cả xe', to: '/cars/tat-ca' },
                { label: 'Giới thiệu', to: '/about' },
                { label: 'Liên hệ', to: '/contact' },
                { label: 'Điều khoản dịch vụ', to: '/terms' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">Dịch vụ</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Thuê xe tự lái',
                'Thuê xe có tài xế',
                'Thuê xe dài ngày',
                'Xe đón sân bay',
                'Du lịch theo tour',
              ].map((service) => (
                <li key={service} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-5">Liên hệ</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:1900xxxx" className="hover:text-primary transition-colors">1900 xxxx</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:hello@autohub.vn" className="hover:text-primary transition-colors">hello@autohub.vn</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>&copy; {new Date().getFullYear()} AutoHub. All rights reserved.</p>
          <p>Designed with ❤️ for Vietnam</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
