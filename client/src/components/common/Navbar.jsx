import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, BookOpen, Settings, LogOut, Menu, X, Home, Shield, UserCheck, Heart } from "lucide-react";

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

  // Navigate to profile when clicking on user name
  const handleUserNameClick = () => {
    navigate("/profile");
  };

  if (!shouldShowNavbar) {
    return null;
  }

  // Navigation items based on user role
  const navItems = [
    {
      path: "/dashboard",
      label: "דף הבית",
      icon: Home
    },
    {
      path: "/lecturers",
      label: "המרצים שלי",
      icon: UserCheck
    },
    {
      path: "/tracked-courses",
      label: "הקורסים שלי",
      icon: Heart
    }
  ];

  // Add admin link if user is admin - Fixed to check user.user.role
  if (user?.user?.role === "admin") {
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
              to="/dashboard" 
              className="flex items-center space-x-4 group"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 ml-2">
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
                        : item.path === '/admin' 
                          ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
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
            {/* User Profile Button - Clickable */}
            <button 
              onClick={handleUserNameClick}
              className={`flex items-center space-x-3 rounded-xl px-3 py-2 transition-all duration-300 cursor-pointer ${
                isActivePage('/profile') 
                  ? 'bg-emerald-100 hover:bg-emerald-200' 
                  : 'bg-gray-50 hover:bg-emerald-50'
              }`}
            >
              <div className={`rounded-full p-1.5 ml-4 ${user?.user?.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                {user?.user?.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-white" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <div className="text-right mr-3">
                <span className={`font-medium text-sm block ${
                  isActivePage('/profile') ? 'text-emerald-700' : 'text-gray-700'
                }`}>
                  {user?.user?.fullName || user?.fullName || user?.name || 'משתמש'}
                </span>
                {user?.user?.role === 'admin' && (
                  <span className="text-purple-600 text-xs font-medium">מנהל מערכת</span>
                )}
              </div>
              <Settings className={`w-3.5 h-3.5 ml-1 ${
                isActivePage('/profile') ? 'text-emerald-600' : 'text-gray-500'
              }`} />
            </button>

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
              
              {/* User Info Mobile - Clickable */}
              <button
                onClick={() => {
                  handleUserNameClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 rounded-xl px-4 py-3 mb-4 transition-all duration-300 ${
                  isActivePage('/profile')
                    ? 'bg-emerald-100'
                    : 'bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <div className={`rounded-full p-2 ${user?.user?.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                  {user?.user?.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-right mr-3 flex-1">
                  <span className={`font-medium block ${
                    isActivePage('/profile') ? 'text-emerald-700' : 'text-emerald-700'
                  }`}>
                    שלום, {user?.user?.fullName || user?.fullName || user?.name || 'משתמש'}
                  </span>
                  {user?.user?.role === 'admin' && (
                    <span className="text-purple-600 text-sm font-medium">מנהל מערכת</span>
                  )}
                </div>
                <Settings className="w-4 h-4 text-emerald-600" />
              </button>

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
                        : item.path === '/admin'
                          ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 ml-3" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

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