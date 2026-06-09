import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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

const SITE_ADDRESS = 'Phúc Am, Ngọc Hồi, Hà Nội';
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  SITE_ADDRESS
)}&hl=vi&z=16&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_ADDRESS)}`;

const QUICK_LINKS = [
  { label: 'Thuê xe', to: '/cars' },
  { label: 'Mua xe', to: '/cars/mua' },
  { label: 'Giới thiệu', to: '/about' },
  { label: 'Liên hệ', to: '/contact' },
  { label: 'Điều khoản dịch vụ', to: '/terms' },
  { label: 'Chính sách bảo mật', to: '/privacy' },
] as const;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 w-fit">
      <h4 className="font-heading font-semibold text-white text-lg tracking-wide">{children}</h4>
      <span className="mt-2 block h-0.5 w-full rounded-full bg-primary" aria-hidden />
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="bg-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <BrandLogo to="/" size="lg" variant="light" />
            <p className="text-sm leading-relaxed text-gray-400">
              AutoHub – Nền tảng thuê và mua bán ô tô uy tín hàng đầu Việt Nam.
              Chúng tôi mang đến trải nghiệm lái xe tuyệt vời với giá cả minh bạch.
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://www.facebook.com/', label: 'Facebook', Icon: FacebookIcon },
                { href: 'https://www.instagram.com/', label: 'Instagram', Icon: InstagramIcon },
                { href: 'https://www.linkedin.com/', label: 'LinkedIn', Icon: LinkedInIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 bg-navy-400/40 border border-white/5 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary hover:-translate-y-0.5 transition-all duration-300 group"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <FooterHeading>Trang chủ</FooterHeading>
            <ul className="space-y-3 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-primary hover:translate-x-1 transition-all duration-300"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/60 flex-shrink-0" aria-hidden />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          

          {/* Contact */}
          <div>
            <FooterHeading>Liên hệ</FooterHeading>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:text-white transition-colors duration-300 leading-relaxed">
                  {SITE_ADDRESS}
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a
                  href="tel:0329248087"
                  className="group-hover:text-primary transition-colors duration-300"
                >
                  032 924 8087
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a
                  href="mailto:khang08012k4@gmail.com"
                  className="group-hover:text-primary transition-colors duration-300 break-all"
                >
                  khang08012k4@gmail.com
                </a>
              </li>
            </ul>
            
          </div>

          {/* Google Maps */}
          <div>
            <FooterHeading>Địa chỉ</FooterHeading>
            
            <div className="rounded-xl overflow-hidden border border-navy-400/60 shadow-lg shadow-black/20 bg-navy-400/20">
              <iframe
                title={`Bản đồ AutoHub — ${SITE_ADDRESS}`}
                src={MAP_EMBED_SRC}
                className="w-full h-40 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="px-4 py-3 bg-black/20 border-t border-white/5">
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Mở chỉ đường trên Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-400/50 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AutoHub. All rights reserved.</p>
          <p className="text-xs text-gray-500">Thuê xe · Mua xe · Hỗ trợ 24/7</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
