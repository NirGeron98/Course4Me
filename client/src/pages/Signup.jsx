import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = 'הרשמה - Course4Me';
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("הסיסמאות אינן תואמות");
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setIsLoading(true);
    setPasswordError("");
    setMessage(""); // Clear previous messages

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`, dataToSend);
      
      // Store user data in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userFullName", res.data.user.fullName);
      localStorage.setItem("userRole", res.data.user.role);
      
      // Call onLogin with the complete response data
      onLogin(res.data);
      
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setMessage(err.response?.data?.message || "ההרשמה נכשלה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">הרשמה</h1>
          <p className="text-gray-600">הצטרף אלינו ותתחיל את המסע שלך</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 p-8" dir="rtl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="fullName"
                placeholder="שם מלא"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                required
              />
            </div>

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
                placeholder="סיסמה (לפחות 6 תווים)"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-gray-50/70 border-2 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white/90 transition-all duration-300 ${
                  passwordError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
                }`}
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

            <div className="relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="אימות סיסמה"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full bg-gray-50/70 border-2 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white/90 transition-all duration-300 ${
                  passwordError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-emerald-400"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-2xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
                <p className="text-right font-medium">{passwordError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="mr-2">טוען...</span>
                </div>
              ) : (
                "הירשם"
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-2xl flex items-center space-x-3 ${
                message.includes("בהצלחה")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.includes("בהצלחה") ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 ml-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              )}
              <p className="text-right font-medium">{message}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              כבר רשום?{" "}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
              >
                התחבר כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;