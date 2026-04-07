import { Link } from 'react-router-dom';
import { Car, Users, Award, Headphones, Target, Eye, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section
        className="py-24 text-white"
        style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A3A6B 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Về chúng tôi</span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl mt-3 mb-5">
            AutoHub – Hành trình của <span className="text-primary">niềm tin</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Từ năm 2020, AutoHub đã trở thành nền tảng thuê xe ô tô hàng đầu Việt Nam,
            mang đến cho hàng ngàn khách hàng những chuyến đi an toàn, thoải mái và đáng nhớ.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Car, value: '500+', label: 'Xe cho thuê' },
              { icon: Users, value: '10,000+', label: 'Khách hàng' },
              { icon: Award, value: '50+', label: 'Thành phố' },
              { icon: Headphones, value: '24/7', label: 'Hỗ trợ' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="font-heading font-bold text-3xl text-navy">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Sứ mệnh',
                desc: 'Đơn giản hóa việc thuê xe ô tô, giúp mỗi người Việt có thể dễ dàng di chuyển đến mọi nơi với mức chi phí hợp lý.',
              },
              {
                icon: Eye,
                title: 'Tầm nhìn',
                desc: 'Trở thành nền tảng công nghệ cho thuê xe ô tô lớn nhất Đông Nam Á vào năm 2030, kết nối hàng triệu người dùng.',
              },
              {
                icon: Heart,
                title: 'Giá trị cốt lõi',
                desc: 'Uy tín – Minh bạch – Chất lượng. Chúng tôi đặt trải nghiệm khách hàng lên hàng đầu trong mọi quyết định.',
              },
            ].map((item) => (
              <div key={item.title} className="card p-8 text-center">
                <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-xl text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80"
                alt="Our team"
                className="rounded-3xl shadow-xl w-full h-80 object-cover"
              />
            </div>
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Câu chuyện của chúng tôi</span>
              <h2 className="section-title mt-2 mb-5">Bắt đầu từ một ý tưởng nhỏ</h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>
                  AutoHub ra đời từ trải nghiệm thực tế của những người sáng lập khi gặp khó khăn
                  trong việc tìm kiếm dịch vụ thuê xe uy tín, giá minh bạch.
                </p>
                <p>
                  Với đội ngũ hơn 50 nhân sự tận tâm và mạng lưới xe rộng khắp 50 tỉnh thành,
                  chúng tôi tự hào phục vụ hơn 10,000 khách hàng mỗi năm.
                </p>
                <p>
                  Mỗi chuyến đi với AutoHub không chỉ là việc thuê một chiếc xe – đó là cam kết
                  về an toàn, sự thoải mái và trải nghiệm đáng nhớ.
                </p>
              </div>
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2 mt-6">
                Liên hệ chúng tôi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
