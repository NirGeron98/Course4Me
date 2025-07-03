import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Loader2,
  Shield,
  LogOut 
} from 'lucide-react';

const ResetPassword = ({ user, onLogout, updateUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Check if user is using temporary password
  const isUsingTempPassword = user?.requiresPasswordReset || localStorage.getItem("requiresPasswordReset") === "true";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("requiresPasswordReset");
    onLogout();
    navigate("/login");
  };

  useEffect(() => {
    document.title = 'שינוי סיסמה - Course4Me';
    
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('הסיסמה חייבת להכיל לפחות 6 תווים');
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push('הסיסמה חייבת להכיל לפחות אות אחת');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('הסיסמה חייבת להכיל לפחות ספרה אחת');
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset messages when user types
    setMessage('');
    
    // Validate new password in real-time
    if (name === 'newPassword') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate passwords
    const newPasswordErrors = validatePassword(formData.newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('הסיסמאות החדשות אינן זהות');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      setMessage(response.data.message);
      setIsSuccess(true);
      
      // Clear the password reset requirement
      localStorage.removeItem("requiresPasswordReset");
      
      // Update user state to remove password reset requirement
      const updatedUser = { ...user };
      delete updatedUser.requiresPasswordReset;
      updateUser(updatedUser);
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Show redirect animation and redirect to dashboard
      setIsRedirecting(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      setMessage(err.response?.data?.message || 'שגיאה בשינוי הסיסמה');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isUsingTempPassword ? 'הגדרת סיסמה חדשה' : 'שינוי סיסמה'}
          </h1>
          <p className="text-gray-600">
            {isUsingTempPassword 
              ? 'אנא הגדר סיסמה חדשה וחזקה למשך השימוש במערכת'
              : 'הגדר סיסמה חדשה וחזקה'
            }
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 p-8" dir="rtl">
          {isUsingTempPassword && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 ml-2" />
                <div>
                  <h3 className="text-blue-800 font-semibold mb-1">הגדרת סיסמה חדשה</h3>
                  <p className="text-blue-700 text-sm">
                    התחברת עם סיסמה זמנית. כדי להמשיך להשתמש במערכת, הגדר סיסמה חדשה וחזקה.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder={isUsingTempPassword ? "סיסמה זמנית" : "סיסמה נוכחית"}
                  className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="סיסמה חדשה"
                  className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password validation errors */}
              {passwordErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <ul className="text-red-700 text-sm space-y-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index} className="flex items-center">
                        <AlertCircle className="w-4 h-4 ml-2 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="אישור סיסמה חדשה"
                  className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
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

              <button
                type="submit"
                disabled={isLoading || passwordErrors.length > 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="ml-3 w-5 h-5 animate-spin" />
                    <span className="mr-2">משנה סיסמה...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="ml-3 w-5 h-5" />
                    <span className="mr-2">שמור סיסמה חדשה</span>
                  </div>
                )}
              </button>
              
              {/* Back to Login Button - only for temporary password users */}
              {isUsingTempPassword && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-2xl border-2 border-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <LogOut className="ml-3 w-4 h-4" />
                  <span className="mr-2">חזרה להתחברות</span>
                </button>
              )}
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">הסיסמה שונתה בהצלחה!</h3>
                <p className="text-gray-600">
                  עכשיו אתה יכול להמשיך להשתמש במערכת עם הסיסמה החדשה שלך.
                </p>
              </div>

              {isRedirecting ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="ml-3 w-5 h-5 animate-spin text-emerald-600" />
                    <p className="text-emerald-700 text-sm mr-2">מעביר אותך לדף הראשי...</p>
                  </div>
                  <div className="mt-3 bg-emerald-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-[3000ms] ease-in-out"
                      style={{ width: isRedirecting ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-emerald-700 text-sm">
                    הכנה למעבר לדף הראשי...
                  </p>
                </div>
              )}
            </div>
          )}

          {message && !isSuccess && (
            <div className="mt-6 p-4 rounded-2xl flex items-center space-x-3 bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              <p className="text-right font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
