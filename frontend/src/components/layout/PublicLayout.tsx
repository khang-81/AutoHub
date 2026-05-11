import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/** Context cho trang con: luôn hiển thị navbar/footer trên public routes. */
export type PublicLayoutContext = { hidePublicChrome: boolean };

const PublicLayout = () => {
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
