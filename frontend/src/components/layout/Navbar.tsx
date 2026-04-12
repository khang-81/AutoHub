import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Car, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { isAuthenticated, isAdmin, email, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setProfileOpen(false);
    };

    const navLinks: { label: string; to: string; isActive: (path: string) => boolean }[] = [
        { label: 'Trang chủ', to: '/', isActive: (p) => p === '/' },
        {
            label: 'Thuê xe',
            to: '/cars',
            isActive: (p) => p === '/cars' || p === '/cars/',
        },
        {
            label: 'Mua xe',
            to: '/cars/mua',
            isActive: (p) => p === '/cars/mua' || p.startsWith('/cars/mua/'),
        },
        { label: 'Giới thiệu', to: '/about', isActive: (p) => p === '/about' || p.startsWith('/about/') },
        { label: 'Liên hệ', to: '/contact', isActive: (p) => p === '/contact' || p.startsWith('/contact/') },
    ];

    const isTransparent = isHomePage && !scrolled;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent
                    ? 'bg-transparent'
                    : 'bg-navy shadow-lg'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary rounded-lg p-2">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-heading font-bold text-xl text-white">
                            Auto<span className="text-primary">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                className={`font-medium transition-colors duration-200 ${link.isActive(location.pathname)
                                        ? 'text-primary'
                                        : 'text-gray-200 hover:text-primary'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 text-gray-200 hover:text-primary transition-colors"
                                >
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium max-w-[120px] truncate">{email}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                        {isAdmin ? (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                onClick={() => setProfileOpen(false)}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Admin Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/dashboard/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    Hồ sơ của tôi
                                                </Link>
                                            </>
                                        )}
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-200 hover:text-primary font-medium transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary !py-2 !px-5 text-sm"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-200 hover:text-primary"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-navy border-t border-navy-400 px-4 pb-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className={`block py-3 font-medium border-b border-navy-400 ${
                                link.isActive(location.pathname) ? 'text-primary' : 'text-gray-200 hover:text-primary'
                            }`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-4 flex flex-col gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={isAdmin ? '/admin' : '/dashboard'}
                                    className="btn-outline !py-2 text-center"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary !py-2 text-center">
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-outline !py-2 text-center" onClick={() => setIsOpen(false)}>
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary !py-2 text-center" onClick={() => setIsOpen(false)}>
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
