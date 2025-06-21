import React, { useEffect } from "react";
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

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userFullName = localStorage.getItem("userFullName");
    const userRole = localStorage.getItem("userRole");

    if (token && userFullName) {
      setUser({
        fullName: userFullName,
        token: token,
        role: userRole || "student",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userFullName = localStorage.getItem("userFullName");
      const userRole = localStorage.getItem("userRole");

      if (token && userFullName && !user) {
        setUser({
          fullName: userFullName,
          token: token,
          role: userRole || "student",
        });
      }
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userRole");
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    const location = useLocation();

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

    if (!user) {
      const redirectPath = encodeURIComponent(
        location.pathname + location.search
      );
      return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
    }

    return children;
  };

  const AdminRoute = ({ children }) => {
    const location = useLocation();

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

    if (!user) {
      const redirectPath = encodeURIComponent(
        location.pathname + location.search
      );
      return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
    }

    if (user.role !== "admin") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">אין הרשאה</h1>
            <p className="text-gray-600 mb-6">דף זה מיועד למנהלי המערכת בלבד</p>
            <a
              href="/"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              חזור לדף הבית
            </a>
          </div>
        </div>
      );
    }

    return children;
  };

  const AuthRoute = ({ children }) => {
    const location = useLocation();

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

    if (user) {
      // Check if there's a redirect parameter
      const urlParams = new URLSearchParams(location.search);
      const redirectPath = urlParams.get("redirect");

      if (redirectPath) {
        // User is already logged in and there's a redirect - go to the intended page
        return <Navigate to={decodeURIComponent(redirectPath)} replace />;
      } else {
        // User is logged in, no redirect - go to dashboard
        return <Navigate to="/" replace />;
      }
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
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login setUser={setUser} />
            </AuthRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <AuthRoute>
              <Signup setUser={setUser} />
            </AuthRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          }
        />

        <Route
          path="/tracked-courses"
          element={
            <ProtectedRoute>
              <TrackedCourses user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel user={user} />
            </AdminRoute>
          }
        />

        <Route
          path="/course/:id"
          element={
            <ProtectedRoute>
              <CoursePage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-emerald-600 mb-4">
                  404
                </h1>
                <p className="text-xl text-gray-600 mb-8">הדף שחיפשת לא נמצא</p>
                <a
                  href="/"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  חזור לדף הבית
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
