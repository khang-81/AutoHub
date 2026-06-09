import { MapPin, Phone, ExternalLink } from 'lucide-react';

export const ZALO_CONSULT_URL = 'https://zalo.me/0329248087';
export const DEALER_PHONE_DISPLAY = '0329 248 087';
export const DEALER_PHONE_RAW = '0329248087';

interface SaleDealerCardProps {
  /** Tên xe — gợi ý nội dung khi chat Zalo */
  carLabel?: string;
  className?: string;
}

const SaleDealerCard = ({ carLabel, className = '' }: SaleDealerCardProps) => {
  const zaloHref = carLabel
    ? `${ZALO_CONSULT_URL}?message=${encodeURIComponent(`Tôi muốn tư vấn mua xe: ${carLabel}`)}`
    : ZALO_CONSULT_URL;

  return (
    <div className={`sale-dealer-card ${className}`}>
      <div className="sale-dealer-card__header">
        <div className="sale-dealer-card__avatar" aria-hidden>
          <span className="text-sm font-bold text-white">AH</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold text-navy leading-tight">AutoHub Showroom</h3>
          <p className="mt-0.5 text-xs text-gray-500">Người bán · Đại lý chính hãng</p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 text-sm leading-snug text-gray-600">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        123 Phố Huế, Hai Bà Trưng, Hà Nội
      </p>

      <a
        href="https://autohub.id.vn"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-sm text-orange-700 hover:underline"
      >
        autohub.id.vn
        <ExternalLink className="h-3 w-3" />
      </a>

      <div className="sale-dealer-card__contact">
        <a href={`tel:${DEALER_PHONE_RAW}`} className="sale-dealer-card__phone">
          <Phone className="h-5 w-5 shrink-0" />
          <span>{DEALER_PHONE_DISPLAY}</span>
        </a>
        <a
          href={zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sale-dealer-card__zalo"
          aria-label="Tư vấn qua Zalo"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden>
            <circle cx="24" cy="24" r="24" fill="#fff" />
            <path
              fill="#0068FF"
              d="M24 4C12.95 4 4 11.85 4 21.22c0 5.32 2.66 10.07 6.82 13.22-.3 1.05-1.08 3.8-1.24 4.38-.2.75.27.74.57.54.24-.16 3.82-2.58 5.36-3.62.95.14 1.93.21 2.93.21 11.05 0 20-7.85 20-17.22S35.05 4 24 4z"
            />
          </svg>
          <span>Zalo</span>
        </a>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
        Liên hệ góc trái màn hình hoặc số trên để được chuyên viên tư vấn trực tiếp về giá lăn bánh và ưu đãi.
      </p>
    </div>
  );
};

export default SaleDealerCard;
