import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Send, Car, MessageSquare } from 'lucide-react';
import { sendContactEmailApi, sendJoinUsEmailApi } from '../../api/contact';
import { useToast } from '../../components/ui/Toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự'),
  message: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
});

const joinSchema = z.object({
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  city: z.string().min(2, 'Nhập thành phố'),
  carCount: z.number().min(1, 'Tối thiểu 1 xe'),
});

type ContactForm = z.infer<typeof contactSchema>;
type JoinForm = z.infer<typeof joinSchema>;

const Contact = () => {
  const [activeTab, setActiveTab] = useState<'contact' | 'join'>('contact');
  const { showToast } = useToast();

  const contactForm = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });
  const joinForm = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    defaultValues: { carCount: 1 },
  });

  const contactMutation = useMutation({
    mutationFn: sendContactEmailApi,
    onSuccess: () => {
      showToast('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ sớm.', 'success');
      contactForm.reset();
    },
    onError: () => showToast('Có lỗi khi gửi tin nhắn', 'error'),
  });

  const joinMutation = useMutation({
    mutationFn: sendJoinUsEmailApi,
    onSuccess: () => {
      showToast('Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm nhất.', 'success');
      joinForm.reset();
    },
    onError: () => showToast('Có lỗi khi gửi đăng ký', 'error'),
  });

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Liên hệ</span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-white mt-2 mb-3">
            Chúng tôi luôn sẵn sàng lắng nghe
          </h1>
          <p className="text-gray-300">Có thắc mắc hoặc muốn hợp tác? Hãy liên hệ với chúng tôi!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-heading font-semibold text-navy mb-5">Thông tin liên hệ</h3>
              <div className="space-y-4">
                {[
                  { icon: Phone, title: 'Điện thoại', info: '1900 xxxx', sub: 'Thứ 2 – CN, 8:00 – 22:00' },
                  { icon: Mail, title: 'Email', info: 'hello@autohub.vn', sub: 'Phản hồi trong 2 giờ' },
                  { icon: MapPin, title: 'Địa chỉ', info: '123 Nguyễn Văn Linh', sub: 'Quận 7, TP.HCM' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-navy text-sm">{item.title}</p>
                      <p className="text-gray-700 text-sm">{item.info}</p>
                      <p className="text-gray-400 text-xs">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-48">
              <div className="w-full h-full bg-navy/5 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm">Bản đồ</p>
                  <p className="text-xs">123 Nguyễn Văn Linh, Q7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white rounded-xl shadow-sm p-1 max-w-sm">
              {[
                { key: 'contact', label: 'Gửi tin nhắn', icon: MessageSquare },
                { key: 'join', label: 'Đăng ký xe', icon: Car },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'contact' | 'join')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-navy'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contact form */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-heading font-semibold text-navy text-lg mb-5">Gửi tin nhắn cho chúng tôi</h2>
                <form onSubmit={contactForm.handleSubmit((d) => contactMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                      <input {...contactForm.register('name')} className="input-field" placeholder="Nguyễn Văn An" />
                      {contactForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input {...contactForm.register('email')} type="email" className="input-field" placeholder="you@example.com" />
                      {contactForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                    <input {...contactForm.register('subject')} className="input-field" placeholder="Tôi muốn hỏi về..." />
                    {contactForm.formState.errors.subject && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                    <textarea {...contactForm.register('message')} rows={5} className="input-field resize-none" placeholder="Nhập nội dung tin nhắn..." />
                    {contactForm.formState.errors.message && <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.message.message}</p>}
                  </div>
                  <button type="submit" disabled={contactMutation.isPending} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                    {contactMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    {contactMutation.isPending ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </button>
                </form>
              </div>
            )}

            {/* Join us form */}
            {activeTab === 'join' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="font-heading font-semibold text-navy text-lg mb-2">Đăng ký cho thuê xe</h2>
                <p className="text-gray-400 text-sm mb-5">Bạn có xe nhàn rỗi? Hãy đăng ký để kiếm thêm thu nhập với AutoHub!</p>
                <form onSubmit={joinForm.handleSubmit((d) => joinMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                      <input {...joinForm.register('name')} className="input-field" placeholder="Nguyễn Văn An" />
                      {joinForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{joinForm.formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input {...joinForm.register('email')} type="email" className="input-field" placeholder="you@example.com" />
                      {joinForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{joinForm.formState.errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input {...joinForm.register('phone')} className="input-field" placeholder="0912 345 678" />
                      {joinForm.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{joinForm.formState.errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố *</label>
                      <input {...joinForm.register('city')} className="input-field" placeholder="TP. Hồ Chí Minh" />
                      {joinForm.formState.errors.city && <p className="text-red-500 text-xs mt-1">{joinForm.formState.errors.city.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng xe *</label>
                    <input {...joinForm.register('carCount', { valueAsNumber: true })} type="number" min={1} className="input-field" placeholder="1" />
                    {joinForm.formState.errors.carCount && <p className="text-red-500 text-xs mt-1">{joinForm.formState.errors.carCount.message}</p>}
                  </div>
                  <button type="submit" disabled={joinMutation.isPending} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                    {joinMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Car className="w-4 h-4" />}
                    {joinMutation.isPending ? 'Đang gửi...' : 'Đăng ký ngay'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
