import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';

// Toast
import { ToastProvider } from './components/ui/Toast';

// Chatbot
import AIChatbot from './components/chatbot/AIChatbot';

// Public pages
import Home from './pages/public/Home';
import CarListing from './pages/public/CarListing';
import CarDetail from './pages/public/CarDetail';
import Contact from './pages/public/Contact';
import About from './pages/public/About';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import Profile from './pages/user/Profile';
import RentalHistory from './pages/user/RentalHistory';
import MyInvoices from './pages/user/MyInvoices';
import ChangePassword from './pages/user/ChangePassword';
import PaymentPage from './pages/user/PaymentPage';
import PaymentSalePage from './pages/user/PaymentSalePage';
import MySaleOrders from './pages/user/MySaleOrders';
import KycVerification from './pages/user/KycVerification';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCars from './pages/admin/ManageCars';
import ManageBrands from './pages/admin/ManageBrands';
import ManageRentals from './pages/admin/ManageRentals';
import ManageInvoices from './pages/admin/ManageInvoices';
import ManageUsers from './pages/admin/ManageUsers';
import ManageReports from './pages/admin/ManageReports';
import ManageKyc from './pages/admin/ManageKyc';
import ManageSaleOrders from './pages/admin/ManageSaleOrders';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

function RoutesWithChatbot() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Auth routes (user) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin login - standalone, no layout */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="rentals" element={<RentalHistory />} />
          <Route path="payment/:rentalId" element={<PaymentPage />} />
          <Route path="sale-payment/:saleOrderId" element={<PaymentSalePage />} />
          <Route path="sale-orders" element={<MySaleOrders />} />
          <Route path="invoices" element={<MyInvoices />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="kyc" element={<KycVerification />} />
        </Route>

        {/* Admin routes - protected by AdminProtectedRoute */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="cars" element={<ManageCars />} />
          <Route path="brands" element={<ManageBrands />} />
          <Route path="rentals" element={<ManageRentals />} />
          <Route path="invoices" element={<ManageInvoices />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="kyc" element={<ManageKyc />} />
          <Route path="sale-orders" element={<ManageSaleOrders />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global AI Chatbot - ẩn trên admin */}
      {!isAdminRoute && <AIChatbot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <RoutesWithChatbot />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
