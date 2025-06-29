// Navbar.jsx - Updated with neutral colors (gray/blue palette) and My Reviews
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, BookOpen, Settings, LogOut, Menu, X, Home, Shield, UserCheck, Heart, Search, MessageCircle } from "lucide-react";

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

  // Navigation items with shorter labels for better fitting
  const navItems = [
    {
      path: "/dashboard",
      label: "בית",
      fullLabel: "דף הבית",
      icon: Home
    },
    {
      path: "/search",
      label: "חיפוש",
      fullLabel: "חיפוש מתקדם",
      icon: Search
    },
    {
      path: "/my-reviews",
      label: "ביקורות",
      fullLabel: "הביקורות שלי",
      icon: MessageCircle
    },
    {
      path: "/lecturers",
      label: "מרצים",
      fullLabel: "המרצים שלי",
      icon: UserCheck
    },
    {
      path: "/tracked-courses",
      label: "קורסים",
      fullLabel: "הקורסים שלי",
      icon: Heart
    }
  ];

  // Add admin link if user is admin
  if (user?.user?.role === "admin") {
    navItems.push({
      path: "/admin",
      label: "ניהול",
      fullLabel: "ניהול מערכת",
      icon: Shield
    });
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b-2 border-gray-200 shadow-lg sticky top-0 z-50">
      {/* Make container wider */}
      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16" dir="rtl">

          {/* Logo - Updated with neutral colors */}
          <div className="flex-shrink-0">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 group"
            >
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 ml-2">
                <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent mr-3">
                Course4Me
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Updated with neutral colors */}
          <div className="hidden lg:block flex-1 max-w-4xl mx-8">
            <div className="flex items-center justify-center gap-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap text-sm xl:text-base ${isActivePage(item.path)
                        ? 'bg-slate-100 text-slate-800 shadow-md'
                        : item.path === '/admin'
                          ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                          : 'text-gray-600 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    title={item.fullLabel} // Tooltip with full label
                  >
                    <Icon className="w-4 h-4 ml-1.5" />
                    <span className="hidden xl:inline">{item.fullLabel}</span>
                    <span className="xl:hidden">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Medium screens navigation (tablet) */}
          <div className="hidden md:flex lg:hidden flex-1 justify-center mx-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActivePage(item.path)
                        ? 'bg-slate-100 text-slate-800 shadow-md'
                        : item.path === '/admin'
                          ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                          : 'text-gray-600 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    title={item.fullLabel}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu & Logout - Updated with neutral colors */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 space-x-reverse">
            {/* User Profile Button - More compact */}
            <button
              onClick={handleUserNameClick}
              className={`flex items-center space-x-2 lg:space-x-3 rounded-xl px-2 lg:px-3 py-2 transition-all duration-300 cursor-pointer ${isActivePage('/profile')
                  ? 'bg-slate-100 hover:bg-slate-200'
                  : 'bg-gray-50 hover:bg-slate-50'
                }`}
            >
              <div className={`rounded-full p-1.5 ml-2 lg:ml-3 ${user?.user?.role === 'admin' ? 'bg-purple-500' : 'bg-slate-600'}`}>
                {user?.user?.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-white" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <div className="text-right mr-2 lg:mr-3 hidden lg:block">
                <span className={`font-medium text-sm block ${isActivePage('/profile') ? 'text-slate-800' : 'text-gray-700'
                  }`}>
                  {(user?.user?.fullName || user?.fullName || user?.name || 'משתמש').split(' ')[0]}
                </span>
                {user?.user?.role === 'admin' && (
                  <span className="text-purple-600 text-xs font-medium">מנהל</span>
                )}
              </div>
              <Settings className={`w-3.5 h-3.5 ml-1 ${isActivePage('/profile') ? 'text-slate-600' : 'text-gray-500'
                }`} />
            </button>

            {/* Logout Button - More compact */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2 lg:px-3 py-2 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              title="יציאה מהמערכת"
            >
              <LogOut className="w-3.5 h-3.5 ml-1" />
              <span className="hidden lg:inline">יציאה</span>
            </button>
          </div>

          {/* Mobile menu button - Updated color */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Updated with neutral colors */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-2" dir="rtl">

              {/* User Info Mobile - Clickable */}
              <button
                onClick={() => {
                  handleUserNameClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 rounded-xl px-4 py-3 mb-4 transition-all duration-300 ${isActivePage('/profile')
                    ? 'bg-slate-100'
                    : 'bg-slate-50 hover:bg-slate-100'
                  }`}
              >
                <div className={`rounded-full p-2 ${user?.user?.role === 'admin' ? 'bg-purple-500' : 'bg-slate-600'}`}>
                  {user?.user?.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-right mr-3 flex-1">
                  <span className={`font-medium block ${isActivePage('/profile') ? 'text-slate-800' : 'text-slate-700'
                    }`}>
                    שלום, {user?.user?.fullName || user?.fullName || user?.name || 'משתמש'}
                  </span>
                  {user?.user?.role === 'admin' && (
                    <span className="text-purple-600 text-sm font-medium">מנהל מערכת</span>
                  )}
                </div>
                <Settings className={`w-4 h-4 ${isActivePage('/profile') ? 'text-slate-600' : 'text-slate-600'}`} />
              </button>

              {/* Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActivePage(item.path)
                        ? 'bg-slate-100 text-slate-800'
                        : item.path === '/admin'
                          ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                          : 'text-gray-600 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Icon className="w-5 h-5 ml-3" />
                    <span>{item.fullLabel}</span>
                  </Link>
                );
              })}

              {/* Logout Button Mobile */}
              <div className="w-full flex justify-center mt-4">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg"
                >
                  <LogOut className="w-5 h-5 ml-3" />
                  <span>יציאה</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;