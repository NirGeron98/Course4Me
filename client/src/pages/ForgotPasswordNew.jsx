import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Loader2,
  Key 
} from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = 'שכחתי סיסמה - Course4Me';
    
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );

      setMessage(response.data.message);
      setIsSuccess(true);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage(err.response?.data?.message || 'שגיאה בשליחת הבקשה');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">שכחתי סיסמה</h1>
          <p className="text-gray-600">נשלח לך סיסמה זמנית למייל</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 p-8" dir="rtl">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="כתובת האימייל שלך"
                  className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="ml-3 w-5 h-5 animate-spin" />
                    <span className="mr-2">שולח...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span className="mr-2">שלח סיסמה זמנית</span>
                  </div>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">הבקשה נשלחה!</h3>
                <p className="text-gray-600">
                  בדוק את תיבת המייל שלך. אם החשבון קיים במערכת, תקבל סיסמה זמנית.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 text-sm">
                  <strong>שים לב:</strong> הסיסמה הזמנית תפוג תוך 24 שעות. לאחר התחברות, תתבקש לשנות את הסיסמה שלך.
                </p>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-2xl flex items-center space-x-3 ${
              isSuccess 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 ml-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              )}
              <p className="text-right font-medium">{message}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              חזרה להתחברות
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
