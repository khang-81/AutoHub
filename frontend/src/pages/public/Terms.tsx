import { Link } from 'react-router-dom';
import { FileText, Shield, Car, CreditCard, AlertCircle } from 'lucide-react';

const sections = [
  {
    icon: Car,
    title: '1. Dịch vụ thuê và mua xe',
    items: [
      'AutoHub cung cấp nền tảng đặt thuê xe tự lái và mua bán xe niêm yết trực tuyến.',
      'Thông tin xe, giá thuê, giá bán hiển thị trên website mang tính tham khảo và có thể thay đổi theo thời điểm.',
      'Khách hàng cần hoàn tất xác minh danh tính (KYC) trước khi đặt thuê hoặc mua xe theo quy định của AutoHub.',
    ],
  },
  {
    icon: CreditCard,
    title: '2. Thanh toán và đặt cọc',
    items: [
      'Thanh toán được thực hiện qua chuyển khoản ngân hàng theo thông tin hiển thị trên hệ thống.',
      'Khách hàng chịu trách nhiệm nhập đúng nội dung chuyển khoản để đơn hàng được xác nhận kịp thời.',
      'Mã khuyến mãi (nếu có) chỉ áp dụng khi còn hiệu lực và đáp ứng điều kiện sử dụng.',
    ],
  },
  {
    icon: Shield,
    title: '3. Trách nhiệm khách hàng',
    items: [
      'Cung cấp thông tin cá nhân và giấy tờ chính xác, hợp lệ.',
      'Tuân thủ luật giao thông và quy định sử dụng xe trong thời gian thuê.',
      'Báo cáo kịp thời mọi sự cố, hư hỏng hoặc tai nạn liên quan đến xe đã thuê.',
    ],
  },
  {
    icon: AlertCircle,
    title: '4. Hủy đơn và hoàn tiền',
    items: [
      'Chính sách hủy đơn thuê/mua xe được áp dụng theo trạng thái đơn hàng tại thời điểm yêu cầu hủy.',
      'AutoHub có quyền từ chối hoặc hủy đơn nếu phát hiện thông tin gian lận hoặc vi phạm điều khoản.',
      'Mọi yêu cầu hoàn tiền (nếu được chấp nhận) sẽ xử lý trong thời gian hợp lý sau khi xác minh.',
    ],
  },
];

const Terms = () => {
  return (
    <div className="pad-top-nav" style={{ ['--pad-nav-tail' as string]: '#ffffff' }}>
      <section
        className="py-20 text-white"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3A6B 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Pháp lý</span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mt-3 mb-5">
            Điều khoản <span className="text-primary">dịch vụ</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng dịch vụ thuê hoặc mua xe trên AutoHub.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-start gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
            <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Bằng việc đăng ký tài khoản, đặt thuê hoặc mua xe trên AutoHub, bạn đồng ý tuân thủ các điều khoản
              này. AutoHub có thể cập nhật điều khoản theo thời gian; phiên bản mới có hiệu lực khi được đăng tải
              trên website.
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
              Có thắc mắc về điều khoản? Liên hệ{' '}
              <a href="mailto:khang08012k4@gmail.com" className="text-primary hover:underline">
                khang08012k4@gmail.com
              </a>{' '}
              hoặc hotline{' '}
              <a href="tel:0329248087" className="text-primary hover:underline">
                032 924 8087
              </a>
              .
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

export default Terms;
