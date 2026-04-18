import { Link } from 'react-router-dom';

/** Logo AUTO HUB — PNG (ưu tiên bản không viền khiên / nền phù hợp theme). */
const LOGO_SRC = '/brand/autohub-logo.png';

/**
 * Kích thước lớn, chuyên nghiệp — không khung bọc UI; chỉ đổ bóng nhẹ trên nền tối.
 */
const sizeClasses = {
  sm: 'h-9 w-auto max-w-[120px] sm:max-w-[140px]',
  md: 'h-12 w-auto max-w-[180px] sm:max-w-[200px]',
  lg: 'h-[3.25rem] sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[280px] md:max-w-[300px]',
  xl: 'h-16 sm:h-[4.25rem] md:h-20 lg:h-[5rem] w-auto max-w-[300px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px]',
  /** Thanh điều hướng chính — nổi bật, dễ nhận diện */
  nav: 'h-[3.75rem] sm:h-16 md:h-[4.5rem] lg:h-20 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[460px]',
} as const;

const wordmarkText = {
  sm: 'text-base leading-tight',
  md: 'text-lg leading-tight',
  lg: 'text-xl leading-tight',
  xl: 'text-2xl sm:text-3xl md:text-4xl leading-tight',
  nav: 'text-2xl sm:text-3xl md:text-4xl leading-tight',
} as const;

export type BrandLogoSize = keyof typeof sizeClasses;

type BrandLogoProps = {
  to?: string;
  size?: BrandLogoSize;
  showWordmark?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
  asSpan?: boolean;
};

/**
 * Logo AUTO HUB — không khung bọc; ảnh hiển thị trực tiếp, object-contain để không méo.
 */
export function BrandLogo({
  to = '/',
  size = 'md',
  showWordmark = false,
  variant = 'light',
  className = '',
  asSpan = false,
}: BrandLogoProps) {
  const h = sizeClasses[size];
  const wordLight = variant === 'light';

  const imgTone =
    variant === 'light'
      ? 'drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)] [filter:brightness(1.03)_contrast(1.02)]'
      : 'drop-shadow-sm';

  const logoImg = (
    <img
      src={LOGO_SRC}
      alt="AUTO HUB"
      className={`${h} ${imgTone} object-contain object-left select-none`}
      decoding="async"
      loading="eager"
    />
  );

  const wordmark = showWordmark && (
    <span
      className={`font-heading font-bold tracking-tight ${wordmarkText[size]} ${wordLight ? 'text-white' : 'text-navy'}`}
    >
      Auto<span className="text-primary">Hub</span>
    </span>
  );

  const inner = (
    <span className={`inline-flex items-center gap-3 sm:gap-4 ${className}`.trim()}>
      <span className="inline-flex leading-none">{logoImg}</span>
      {wordmark}
    </span>
  );

  if (asSpan) {
    return inner;
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center shrink-0 min-w-0 max-w-[min(100%,92vw)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded-lg"
    >
      {inner}
    </Link>
  );
}

export default BrandLogo;
