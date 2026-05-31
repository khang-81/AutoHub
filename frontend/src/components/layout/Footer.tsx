import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

// Các component SVG được tối ưu để đồng bộ hoàn toàn với style của lucide-react
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* 1. Brand Info */}
          <div className="space-y-6">
            <BrandLogo to="/" size="lg" variant="light" />
            <p className="text-sm leading-relaxed text-gray-400">
              AutoHub – Nền tảng thuê và mua bán ô tô uy tín hàng đầu Việt Nam. 
              Chúng tôi mang đến trải nghiệm lái xe tuyệt vời với giá cả minh bạch.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/"
                className="w-10 h-10 bg-navy-400/50 rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300 group"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.instagram.com/"
                className="w-10 h-10 bg-navy-400/50 rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com/"
                className="w-10 h-10 bg-navy-400/50 rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-lg tracking-wide">Trang chủ</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Thuê xe', to: '/cars' },
                { label: 'Mua xe', to: '/cars/mua' },
                { label: 'Giới thiệu', to: '/about' },
                { label: 'Liên hệ', to: '/contact' },
                { label: 'Điều khoản dịch vụ', to: '/terms' },
                { label: 'Chính sách bảo mật', to: '/privacy' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="inline-block text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Services */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-lg tracking-wide">Dịch vụ</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Thuê xe tự lái',
                'Thuê xe có tài xế',
                'Thuê xe dài ngày',
                'Xe đón sân bay',
                'Du lịch theo tour',
              ].map((service) => (
                <li key={service} className="flex items-center gap-3 text-gray-400 group cursor-default">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                  <span className="group-hover:text-white transition-colors duration-300">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-6 text-lg tracking-wide">Liên hệ</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-white transition-colors duration-300">Phúc Am, Ngọc Hồi, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a href="tel:0329248087" className="group-hover:text-primary transition-colors duration-300">032 924 8087</a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a href="mailto:khang08012k4@gmail.com" className="group-hover:text-primary transition-colors duration-300">khang08012k4@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-400/50 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AutoHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;