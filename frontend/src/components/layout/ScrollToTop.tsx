import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Cuộn lên đầu trang mỗi khi đổi route (tránh mở chi tiết xe ở cuối trang). */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
