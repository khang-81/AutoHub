import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthStore } from '../../store/authStore';

/** Context cho trang con: đã ẩn navbar/footer public (user đã đăng nhập). */
export type PublicLayoutContext = { hidePublicChrome: boolean };

const PublicLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const hidePublicChrome = isAuthenticated;

  if (hidePublicChrome) {
    return (
      <div className="min-h-screen flex flex-col public-layout--auth bg-gray-50">
        <main className="flex-1 w-full min-w-0">
          <Outlet context={{ hidePublicChrome: true } as PublicLayoutContext} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet context={{ hidePublicChrome: false } as PublicLayoutContext} />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
