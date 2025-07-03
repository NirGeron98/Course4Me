import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TrackedCourses from "./pages/TrackedCourses";
import TrackedLecturers from "./pages/TrackedLecturers";
import CoursePage from "./pages/CoursePage";
import LecturerPage from "./pages/LecturerPage";
import AdminPanel from "./pages/AdminPanel";
import ProfileManagement from "./pages/ProfileManagement";
import AdvancedSearch from "./pages/AdvancedSearch";
import MyReviewsPage from "./pages/MyReviewsPage";
import { CourseDataProvider } from "./contexts/CourseDataContext";
import { initializeCacheCleanup } from "./utils/cacheUtils";
import preloadUserData from "./utils/preloadUserData";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize cache cleanup on app start
    initializeCacheCleanup();
    
    const token = localStorage.getItem("token");
    const userFullName = localStorage.getItem("userFullName");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const requiresPasswordReset = localStorage.getItem("requiresPasswordReset");

    if (token && userFullName && userRole && userId) {
      setUser({
        token,
        user: {
          fullName: userFullName,
          role: userRole,
          _id: userId,
        },
        requiresPasswordReset: requiresPasswordReset === "true"
      });
    }
    setLoading(false);
  }, []);

  const handleLogin = async (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userFullName", userData.user.fullName);
    localStorage.setItem("userRole", userData.user.role);
    localStorage.setItem("userId", userData.user._id);
    localStorage.setItem("requiresPasswordReset", userData.requiresPasswordReset || false);
    
    setUser(userData);
    
    if (userData.token && userData.user._id) {
      try {
        const loadingEvent = new CustomEvent('userDataPreloading', { 
          detail: { status: 'loading' } 
        });
        window.dispatchEvent(loadingEvent);
        
        const loadedData = await preloadUserData(userData.token, userData.user._id);
        
        const completedEvent = new CustomEvent('userDataPreloaded', { 
          detail: { status: 'completed', data: loadedData } 
        });
        window.dispatchEvent(completedEvent);
        
      } catch (error) {
        console.error("שגיאה בטעינת נתונים:", error);
        
        const errorEvent = new CustomEvent('userDataPreloaded', { 
          detail: { status: 'error', error } 
        });
        window.dispatchEvent(errorEvent);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  // Component to protect routes when password reset is required
  const ProtectedRoute = ({ children }) => {
    const requiresPasswordReset = user?.requiresPasswordReset || localStorage.getItem("requiresPasswordReset") === "true";
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (requiresPasswordReset) {
      return <Navigate to="/reset-password" />;
    }
    
    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <CourseDataProvider>
      <Router>
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login onLogin={handleLogin} user={user} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Signup onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/forgot-password"
              element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />}
            />
            <Route
              path="/reset-password"
              element={
                user ? (
                  <ResetPassword user={user} onLogout={handleLogout} updateUser={updateUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/search"
              element={<ProtectedRoute><AdvancedSearch user={user} /></ProtectedRoute>}
            />
            <Route
              path="/my-reviews"
              element={<ProtectedRoute><MyReviewsPage user={user} /></ProtectedRoute>}
            />
            <Route
              path="/tracked-courses"
              element={<ProtectedRoute><TrackedCourses /></ProtectedRoute>}
            />
            <Route
              path="/lecturers"
              element={<ProtectedRoute><TrackedLecturers /></ProtectedRoute>}
            />
            <Route
              path="/course/:courseNumber"
              element={<ProtectedRoute><CoursePage user={user} /></ProtectedRoute>}
            />
            <Route
              path="/lecturer/:slug"
              element={<ProtectedRoute><LecturerPage user={user} /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><ProfileManagement /></ProtectedRoute>}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  {user?.user?.role === "admin" ? (
                    <AdminPanel user={user} />
                  ) : (
                    <Navigate to="/dashboard" />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Default Routes */}
            <Route
              path="/"
              element={
                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              }
            />

            {/* Catch all route - 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                      404
                    </h1>
                    <p className="text-gray-600 mb-6">הדף שחיפשת לא נמצא</p>
                    <button
                      onClick={() =>
                        (window.location.href = user ? "/dashboard" : "/login")
                      }
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      {user ? "חזור לדף הבית" : "חזור להתחברות"}
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </CourseDataProvider>
  );
}

export default App;