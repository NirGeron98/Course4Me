import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
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
import ProfileManagement from "./pages/ProfileManagement";

const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();
  return user ? (
    children
  ) : (
    <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />
  );
};

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
          <Route
            path="/"
            element={
              user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} user={user} />}
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
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute user={user}>
                <CoursePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/:id"
            element={
              <ProtectedRoute user={user}>
                <LecturerPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturers"
            element={
              <ProtectedRoute user={user}>
                <LecturersPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracked-courses"
            element={
              <ProtectedRoute user={user}>
                <TrackedCourses user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <ProfileManagement user={user} />
              </ProtectedRoute>
            }
          />
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
