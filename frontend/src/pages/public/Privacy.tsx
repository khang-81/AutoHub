import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Database, Mail } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: '1. Dữ liệu thu thập',
    items: [
      'Thông tin đăng ký: email, mật khẩu (đã mã hóa), họ tên, số giấy tờ.',
      'Thông tin KYC: ảnh CCCD/GPLX và dữ liệu xác minh danh tính.',
      'Dữ liệu giao dịch: lịch sử thuê/mua xe, thanh toán, mã khuyến mãi đã sử dụng.',
      'Dữ liệu kỹ thuật: IP, trình duyệt, cookie phiên đăng nhập (JWT).',
    ],
  },
  {
    icon: Eye,
    title: '2. Mục đích sử dụng',
    items: [
      'Cung cấp và vận hành dịch vụ thuê/mua xe trên nền tảng AutoHub.',
      'Xác minh danh tính khách hàng trước khi giao dịch.',
      'Hỗ trợ khách hàng, xử lý khiếu nại và gửi thông báo liên quan đơn hàng.',
      'Cải thiện trải nghiệm người dùng và bảo mật hệ thống.',
    ],
  },
  {
    icon: Lock,
    title: '3. Bảo mật & lưu trữ',
    items: [
      'Mật khẩu được băm; token đăng nhập có thời hạn và có thể bị vô hiệu khi đổi mật khẩu.',
      'Tài liệu KYC được lưu trên máy chủ riêng, chỉ admin được phép truy cập.',
      'AutoHub không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích marketing.',
    ],
  },
  {
    icon: Mail,
    title: '4. Quyền của bạn',
    items: [
      'Yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân qua email hỗ trợ.',
      'Rút lại sự đồng ý xử lý dữ liệu (có thể ảnh hưởng khả năng sử dụng dịch vụ).',
      'Khiếu nại về việc xử lý dữ liệu cá nhân theo quy định pháp luật Việt Nam.',
    ],
  },
];

const Privacy = () => {
  return (
    <div className="pad-top-nav" style={{ ['--pad-nav-tail' as string]: '#ffffff' }}>
      <section
        className="py-20 text-white"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3A6B 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Pháp lý</span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mt-3 mb-5">
            Chính sách <span className="text-primary">bảo mật</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            AutoHub cam kết bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ thuê và mua xe.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-start gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
            <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Chính sách này mô tả cách AutoHub thu thập, sử dụng và bảo vệ dữ liệu cá nhân. Bằng việc sử dụng
              website, bạn đồng ý với các điều khoản dưới đây. Xem thêm{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Điều khoản dịch vụ
              </Link>
              .
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-heading font-semibold text-xl text-navy">{section.title}</h2>
              </div>
              <ul className="space-y-2 pl-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-4">
              Liên hệ về quyền riêng tư:{' '}
              <a href="mailto:khang08012k4@gmail.com" className="text-primary hover:underline">
                khang08012k4@gmail.com
              </a>
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
