import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import Alert from "../components/common/Alert";

const Login = ({ onLogin, user }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState("");

  // האזנה לאירועי התקדמות טעינת הנתונים
  useEffect(() => {
    const handleLoadingProgress = (event) => {
      if (event.detail && typeof event.detail.progress === 'number') {
        setLoadingProgress(event.detail.progress);
        setLoadingDetails(event.detail.message || "");
        setMessage(`טוען נתונים: ${event.detail.message || ""}`);
      }
    };

    window.addEventListener('userDataLoadingProgress', handleLoadingProgress);
    
    return () => {
      window.removeEventListener('userDataLoadingProgress', handleLoadingProgress);
    };
  }, []);

  // האזנה לאירועי טעינת נתונים
  useEffect(() => {
    const handleDataLoading = (event) => {
      setIsDataLoading(true);
      setMessage("טוען את הנתונים שלך...");
    };

    const handleDataLoaded = (event) => {
      setIsDataLoading(false);
      const status = event.detail?.status;
      
      if (status === 'completed') {
        // נטענו כל הנתונים בהצלחה - מעבר לדף הבית
        const urlParams = new URLSearchParams(location.search);
        const redirectPath = urlParams.get("redirect");

        if (redirectPath) {
          navigate(decodeURIComponent(redirectPath));
        } else {
          navigate("/dashboard");
        }
      } else if (status === 'error') {
        // אירעה שגיאה בטעינת הנתונים - ממשיכים בכל מקרה לדף הבית
        console.warn('אירעה שגיאה בטעינת נתונים מקדימה, ממשיכים לדף הבית');
        navigate("/dashboard");
      }
    };

    window.addEventListener('userDataPreloading', handleDataLoading);
    window.addEventListener('userDataPreloaded', handleDataLoaded);

    return () => {
      window.removeEventListener('userDataPreloading', handleDataLoading);
      window.removeEventListener('userDataPreloaded', handleDataLoaded);
    };
  }, [navigate, location.search]);

  useEffect(() => {
    document.title = 'התחברות - Course4Me';

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const redirectPath = urlParams.get("redirect");

    if (user !== null) {
      if (user && redirectPath) {
        navigate(decodeURIComponent(redirectPath));
      } else if (user) {
        navigate("/dashboard");
      }
    }
  }, [user, location, navigate]);



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, formData, {
        withCredentials: true,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userFullName", res.data.user.fullName);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userId", res.data.user._id);
      
      // Store if password reset is required
      if (res.data.requiresPasswordReset) {
        localStorage.setItem("requiresPasswordReset", "true");
      }

      // Check if user needs to reset password first - אם כן, לא צריך לטעון נתונים
      if (res.data.requiresPasswordReset) {
        navigate("/reset-password");
        return;
      }
      
      // הוספת הודעה על טעינת נתונים מקדימה
      setMessage("מתחבר וטוען נתונים... (אנא המתן)");
      setIsDataLoading(true);
      
      // הפעלת הכניסה למערכת - זה יתחיל את תהליך טעינת הנתונים המקדימה
      // עכשיו ה-onLogin הוא async ויחכה לסיום טעינת הנתונים
      await onLogin(res.data);
      
      // הניווט לדף הבית יתבצע בתוך האזנה לאירוע סיום טעינת הנתונים (useEffect)

    } catch (err) {
      setMessage(err.response?.data?.message || "התחברות נכשלה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">התחברות</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 p-8" dir="rtl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="כתובת אימייל"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="סיסמה"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-center mb-4">
              <Link
                to="/forgot-password"
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors text-sm"
              >
                שכחתי סיסמה
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || isDataLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {isLoading || isDataLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="ml-4">
                    <span className="mr-2">{isDataLoading ? "טוען נתונים..." : "מתחבר..."}</span>
                  </div>
                </div>
              ) : (
                "התחבר"
              )}
            </button>
          </form>

          {message && (message.includes('טוען') || message.includes('נתונים')) && (
            <div className="mt-6 p-4 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex flex-col space-y-3" role="status">
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-3" aria-hidden="true" />
                <p className="text-right font-medium flex-grow">{message}</p>
              </div>
              {isDataLoading && (
                <div className="w-full">
                  <div className="text-xs text-blue-700 mb-1">{loadingDetails || "טוען נתונים..."}</div>
                  <div className="w-full bg-blue-100 rounded-full h-2.5 mb-1">
                    <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                  </div>
                  <div className="text-xs text-right text-blue-600">{loadingProgress}%</div>
                </div>
              )}
            </div>
          )}
          {message && !message.includes('טוען') && !message.includes('נתונים') && (
            <div className="mt-6">
              <Alert type={message.includes('בהצלחה') ? 'success' : 'error'} message={message} onDismiss={() => setMessage('')} />
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              עוד לא נרשמת?{" "}
              <Link
                to="/signup"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
              >
                הירשם עכשיו
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
