// App.js - Updated with Advanced Search Route and My Reviews
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import TrackedCourses from "./pages/TrackedCourses";
import TrackedLecturers from "./pages/TrackedLecturers";
import CoursePage from "./pages/CoursePage";
import LecturerPage from "./pages/LecturerPage";
import AdminPanel from "./pages/AdminPanel";
import ProfileManagement from "./pages/ProfileManagement";
import AdvancedSearch from "./pages/AdvancedSearch";
import MyReviewsPage from "./components/my-reviews/MyReviewsPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userFullName = localStorage.getItem("userFullName");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (token && userFullName && userRole && userId) {
      setUser({
        token,
        user: {
          fullName: userFullName,
          role: userRole,
          _id: userId
        }
      });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} user={user} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              user ? <Navigate to="/dashboard" /> : <ForgotPassword />
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/search" 
            element={
              user ? <AdvancedSearch user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/my-reviews" 
            element={
              user ? <MyReviewsPage user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/tracked-courses" 
            element={
              user ? <TrackedCourses /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/lecturers" 
            element={
              user ? <TrackedLecturers /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/course/:id" 
            element={
              user ? <CoursePage user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/lecturer/:id" 
            element={
              user ? <LecturerPage user={user} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              user ? <ProfileManagement /> : <Navigate to="/login" />
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              user?.user?.role === "admin" ? 
                <AdminPanel user={user} /> : 
                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
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
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">הדף שחיפשת לא נמצא</p>
                  <button 
                    onClick={() => window.location.href = user ? '/dashboard' : '/login'}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    {user ? 'חזור לדף הבית' : 'חזור להתחברות'}
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;