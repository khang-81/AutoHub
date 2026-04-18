import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Send, CalendarClock, MessageSquare } from 'lucide-react';
import { sendContactEmailApi } from '../../api/contact';
import type { ContactMailRequest } from '../../types';
import { useToast } from '../../components/ui/Toast';

/** Tách họ / tên cho body gửi mail (backend có `name` + `surname`) */
function splitNameForMail(fullName: string): { name: string; surname: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { name: '', surname: '' };
  const idx = trimmed.indexOf(' ');
  if (idx === -1) return { name: trimmed, surname: '-' };
  const first = trimmed.slice(0, idx).trim();
  const rest = trimmed.slice(idx + 1).trim();
  return { name: first || trimmed, surname: rest || '-' };
}

function toContactPayload(
  email: string,
  subject: string,
  message: string,
  fullName: string
): ContactMailRequest {
  const { name, surname } = splitNameForMail(fullName);
  return { name, surname, email, subject, message };
}

const contactSchema = z.object({
  name: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự'),
  message: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
});

const viewingSchema = z.object({
  name: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  preferredDate: z.string().min(1, 'Chọn ngày mong muốn'),
  preferredTime: z.string().min(1, 'Chọn khung giờ'),
  carNote: z.string().optional(),
  notes: z.string().min(10, 'Mô tả ngắn tối thiểu 10 ký tự (nhu cầu xem xe, số người đi cùng…)'),
});

type ContactForm = z.infer<typeof contactSchema>;
type ViewingForm = z.infer<typeof viewingSchema>;

const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  'Phúc Am, Ngọc Hồi, Hà Nội'
)}&hl=vi&z=16&output=embed`;

const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: 'Điện thoại',
    main: '032 924 8087',
    sub: 'Thứ 2 – CN, 8:00 – 18:00',
    href: 'tel:0329248087',
  },
  {
    icon: Mail,
    title: 'Email',
    main: 'khang08012k4@gmail.com',
    sub: 'Phản hồi trong vài giờ làm việc',
    href: 'mailto:khang08012k4@gmail.com',
  },
  {
    icon: MapPin,
    title: 'Địa chỉ',
    main: 'Phúc Am, Ngọc Hồi, Hà Nội',
    sub: 'Showroom & nhận xe',
    href: undefined as string | undefined,
  },
] as const;

const Contact = () => {
  const { showToast } = useToast();
  const [formMode, setFormMode] = useState<'message' | 'viewing'>('message');

  const contactForm = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });
  const viewingForm = useForm<ViewingForm>({ resolver: zodResolver(viewingSchema) });

  const contactMutation = useMutation({
    mutationFn: sendContactEmailApi,
    onSuccess: () => {
      showToast('Tin nhắn đã được gửi! Chúng tôi sẽ liên hệ sớm.', 'success');
      contactForm.reset();
    },
    onError: () => showToast('Có lỗi khi gửi tin nhắn', 'error'),
  });

  const viewingMutation = useMutation({
    mutationFn: sendContactEmailApi,
    onSuccess: () => {
      showToast('Yêu cầu đặt lịch đã được gửi! Chúng tôi sẽ xác nhận qua điện thoại hoặc email.', 'success');
      viewingForm.reset();
    },
    onError: () => showToast('Có lỗi khi gửi yêu cầu', 'error'),
  });

  return (
    <div className="min-h-screen pad-top-nav">
      <div className="bg-navy py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Liên hệ</span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-white mt-2 mb-3">
            AutoHub — Hỗ trợ & đặt lịch xem xe
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Gửi câu hỏi hoặc đặt lịch đến xem xe tại showroom. Thông tin liên hệ đồng bộ với chân trang website.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-7">
              <h3 className="font-heading font-semibold text-navy text-lg mb-1">Thông tin liên hệ</h3>
              <p className="text-gray-500 text-sm mb-6">Cùng thông tin hiển thị ở phần chân trang.</p>
              <ul className="space-y-5">
                {CONTACT_ITEMS.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-navy text-sm">{item.title}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-gray-800 text-sm break-words hover:text-primary transition-colors"
                        >
                          {item.main}
                        </a>
                      ) : (
                        <p className="text-gray-800 text-sm">{item.main}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="font-medium text-navy text-sm">Bản đồ</p>
                <p className="text-gray-500 text-xs">Phúc Am, Ngọc Hồi, Hà Nội</p>
              </div>
              <div className="relative w-full aspect-[4/3] min-h-[220px] bg-navy/5">
                <iframe
                  title="Bản đồ AutoHub — Phúc Am, Ngọc Hồi, Hà Nội"
                  src={MAP_EMBED_SRC}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    'Phúc Am, Ngọc Hồi, Hà Nội'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Mở chỉ đường trên Google Maps
                </a>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <p className="font-heading font-semibold text-navy text-lg mb-4">Chọn hình thức liên hệ</p>
              <div
                className="flex rounded-xl bg-gray-100/90 p-1 gap-1 mb-6"
                role="tablist"
                aria-label="Hình thức liên hệ"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={formMode === 'message'}
                  onClick={() => setFormMode('message')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${
                    formMode === 'message'
                      ? 'bg-white text-navy shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">Gửi tin nhắn</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={formMode === 'viewing'}
                  onClick={() => setFormMode('viewing')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${
                    formMode === 'viewing'
                      ? 'bg-white text-navy shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:text-navy'
                  }`}
                >
                  <CalendarClock className="w-4 h-4 shrink-0" />
                  <span className="truncate">Đặt lịch xem xe</span>
                </button>
              </div>

              {formMode === 'message' ? (
                <>
                  <p className="text-gray-500 text-sm mb-5">
                    Thắc mắc về dịch vụ, hợp tác hoặc hỗ trợ — chúng tôi sẽ phản hồi qua email đã đăng ký.
                  </p>
                  <form
                onSubmit={contactForm.handleSubmit((d) =>
                  contactMutation.mutate(
                    toContactPayload(d.email, d.subject, d.message, d.name)
                  )
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input {...contactForm.register('name')} className="input-field" placeholder="Nguyễn Văn An" />
                    {contactForm.formState.errors.name && (
                      <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      {...contactForm.register('email')}
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                    />
                    {contactForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                  <input {...contactForm.register('subject')} className="input-field" placeholder="Nội dung ngắn gọn" />
                  {contactForm.formState.errors.subject && (
                    <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                  <textarea
                    {...contactForm.register('message')}
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Mô tả chi tiết câu hỏi hoặc yêu cầu…"
                  />
                  {contactForm.formState.errors.message && (
                    <p className="text-red-500 text-xs mt-1">{contactForm.formState.errors.message.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {contactMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {contactMutation.isPending ? 'Đang gửi…' : 'Gửi tin nhắn'}
                </button>
              </form>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-sm mb-5">
                    Đăng ký lịch đến showroom tại Phúc Am, Ngọc Hồi. Chúng tôi sẽ xác nhận qua điện thoại hoặc email.
                  </p>
              <form
                onSubmit={viewingForm.handleSubmit((d) => {
                  const carLine = d.carNote?.trim()
                    ? `\nXe quan tâm / ghi chú xe: ${d.carNote.trim()}`
                    : '';
                  const body = [
                    'YÊU CẦU ĐẶT LỊCH XEM XE',
                    `Điện thoại: ${d.phone}`,
                    `Ngày mong muốn: ${d.preferredDate}`,
                    `Khung giờ: ${d.preferredTime}`,
                    carLine,
                    '',
                    'Chi tiết / ghi chú:',
                    d.notes.trim(),
                  ]
                    .filter(Boolean)
                    .join('\n');

                  viewingMutation.mutate(
                    toContactPayload(
                      d.email,
                      '[AutoHub] Đặt lịch xem xe tại showroom',
                      body,
                      d.name
                    )
                  );
                })}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input {...viewingForm.register('name')} className="input-field" placeholder="Nguyễn Văn An" />
                    {viewingForm.formState.errors.name && (
                      <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      {...viewingForm.register('email')}
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                    />
                    {viewingForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input {...viewingForm.register('phone')} className="input-field" placeholder="032 924 8087" />
                  {viewingForm.formState.errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mong muốn *</label>
                    <input {...viewingForm.register('preferredDate')} type="date" className="input-field" />
                    {viewingForm.formState.errors.preferredDate && (
                      <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.preferredDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ *</label>
                    <select {...viewingForm.register('preferredTime')} className="input-field">
                      <option value="">Chọn khung giờ</option>
                      <option value="8:00 – 10:00">8:00 – 10:00</option>
                      <option value="10:00 – 12:00">10:00 – 12:00</option>
                      <option value="13:00 – 15:00">13:00 – 15:00</option>
                      <option value="15:00 – 17:00">15:00 – 17:00</option>
                    </select>
                    {viewingForm.formState.errors.preferredTime && (
                      <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.preferredTime.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xe quan tâm (tuỳ chọn)</label>
                  <input
                    {...viewingForm.register('carNote')}
                    className="input-field"
                    placeholder="Hãng, dòng xe hoặc biển số nếu đã xem trên website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú *</label>
                  <textarea
                    {...viewingForm.register('notes')}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Nhu cầu xem xe, số người đi cùng, yêu cầu lái thử…"
                  />
                  {viewingForm.formState.errors.notes && (
                    <p className="text-red-500 text-xs mt-1">{viewingForm.formState.errors.notes.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={viewingMutation.isPending}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {viewingMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CalendarClock className="w-4 h-4" />
                  )}
                  {viewingMutation.isPending ? 'Đang gửi…' : 'Gửi yêu cầu đặt lịch'}
                </button>
              </form>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
