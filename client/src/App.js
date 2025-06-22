import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import TrackedCourses from "./pages/TrackedCourses";
import AdminPanel from "./pages/AdminPanel";
import CoursePage from "./pages/CoursePage";
import LecturerPage from "./pages/LecturerPage";
import LecturersPage from "./pages/TrackedLecturers";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} />
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

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" />
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
            path="/lecturers"
            element={
              user ? <LecturersPage user={user} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/tracked-courses"
            element={
              user ? <TrackedCourses user={user} /> : <Navigate to="/login" />
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              user?.user?.role === "admin" ? (
                <AdminPanel user={user} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
