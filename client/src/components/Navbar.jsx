import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, BookOpen, Settings, LogOut, Menu, X, Home, Shield } from "lucide-react";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navbar on auth pages
  const authPages = ['/login', '/signup', '/forgot-password'];
  const shouldShowNavbar = user && !authPages.includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userRole");
    onLogout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  if (!shouldShowNavbar) {
    return null;
  }

  // Navigation items based on user role
  const navItems = [
    {
      path: "/",
      label: "דף הבית",
      icon: Home
    },
    {
      path: "/tracked-courses",
      label: "מעקב קורסים",
      icon: BookOpen
    }
  ];

  // Add admin link if user is admin
  if (user && user.role === "admin") {
    navItems.push({
      path: "/admin",
      label: "ניהול מערכת",
      icon: Shield
    });
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b-2 border-emerald-100 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16" dir="rtl">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-4 group"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mr-4">
                Course4Me
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-6 space-x-reverse">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                      isActivePage(item.path)
                        ? 'bg-emerald-100 text-emerald-700 shadow-md'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    } ${item.path === '/admin' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 hover:from-purple-200 hover:to-purple-300' : ''}`}
                  >
                    <Icon className="w-4 h-4 ml-2" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu & Logout */}
          <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
            {/* User Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-3 bg-gray-50 hover:bg-emerald-50 rounded-xl px-3 py-2 transition-all duration-300">
                <div className={`rounded-full p-1.5 ml-4 ${user?.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                  {user?.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="text-right mr-3">
                  <span className="text-gray-700 font-medium text-sm block">
                    {user?.fullName || user?.name || 'משתמש'}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-purple-600 text-xs font-medium">מנהל מערכת</span>
                  )}
                </div>
                <Settings className="w-3.5 h-3.5 text-gray-500 ml-1" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-emerald-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors text-sm"
                >
                  <Settings className="w-4 h-4 ml-2" />
                  <span>ניהול פרופיל</span>
                </Link>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <LogOut className="w-3.5 h-3.5 ml-1" />
              <span>יציאה</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="bg-emerald-100 text-emerald-600 p-2 rounded-xl hover:bg-emerald-200 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-2" dir="rtl">
              
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 bg-emerald-50 rounded-xl px-4 py-3 mb-4">
                <div className={`rounded-full p-2 ${user?.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                  {user?.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-right mr-3">
                  <span className="text-emerald-700 font-medium block">
                    שלום, {user?.fullName || user?.name || 'משתמש'}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-purple-600 text-sm font-medium">מנהל מערכת</span>
                  )}
                </div>
              </div>

              {/* Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActivePage(item.path)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    } ${item.path === '/admin' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700' : ''}`}
                  >
                    <Icon className="w-5 h-5 ml-3" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Profile Link Mobile */}
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActivePage('/profile')
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Settings className="w-5 h-5 ml-3" />
                <span>ניהול פרופיל</span>
              </Link>

              {/* Logout Button Mobile */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg mt-4"
              >
                <LogOut className="w-5 h-5 ml-3" />
                <span>יציאה</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;