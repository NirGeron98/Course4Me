import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, LogIn } from "lucide-react";

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      // Store user data including role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userFullName", res.data.user.fullName);
      localStorage.setItem("userRole", res.data.user.role); // Store role
      
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "התחברות נכשלה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">התחברות</h1>
          <p className="text-gray-600">ברוך הבא חזרה! נתגעגענו</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 p-8" dir="rtl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
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

            {/* Password Input */}
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

            {/* Forgot Password Link */}
            <div className="text-left">
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
              >
                שכחתי סיסמה
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="mr-2">מתחבר...</span>
                </div>
              ) : (
                "התחבר"
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center space-x-3 ${message.includes('בהצלחה')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {message.includes('בהצלחה') ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 ml-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              )}
              <p className="text-right font-medium">{message}</p>
            </div>
          )}

          {/* Signup Link */}
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