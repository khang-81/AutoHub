import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

// Các component SVG được tối ưu để đồng bộ hoàn toàn với style của lucide-react
const FacebookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TiktokIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
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
                href="#" 
                className="w-10 h-10 bg-navy-400/50 rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300 group"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-navy-400/50 rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300 group"
                aria-label="TikTok"
              >
                <TiktokIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-navy-400/50 rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300 group"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
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
                <span className="group-hover:text-white transition-colors duration-300">Ngoc Hoi, Ha Noi</span>
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