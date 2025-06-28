import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle, KeyRound, ArrowRight } from "lucide-react";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password

    // Set page title
    useEffect(() => {
        document.title = 'שכחתי סיסמה - Course4Me';
        
        // Cleanup function to reset title when component unmounts
        return () => {
            document.title = 'Course4Me';
        };
    }, []);

    const [formData, setFormData] = useState({
        email: "",
        verificationCode: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Reset errors when user types
        setError("");
        if (name === "newPassword" || name === "confirmNewPassword") {
            setPasswordError("");
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // eslint-disable-next-line no-unused-vars
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`, {
                email: formData.email
            });
            setMessage("קוד אימות נשלח לאימייל שלך");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "אימייל לא נמצא במערכת");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // eslint-disable-next-line no-unused-vars
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/verify-reset-code`, {
                email: formData.email,
                code: formData.verificationCode
            });
            setMessage("קוד אומת בהצלחה! הכנס סיסמה חדשה");
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "קוד אימות שגוי");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.newPassword !== formData.confirmNewPassword) {
            setPasswordError("הסיסמאות אינן תואמות");
            return;
        }

        // Validate password strength
        if (formData.newPassword.length < 6) {
            setPasswordError("הסיסמה חייבת להכיל לפחות 6 תווים");
            return;
        }

        setIsLoading(true);
        setError("");
        setPasswordError("");

        try {
            // eslint-disable-next-line no-unused-vars
            const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password`, {
                email: formData.email,
                code: formData.verificationCode,
                newPassword: formData.newPassword
            });
            setMessage("הסיסמה שונתה בהצלחה! אתה יכול להתחבר עכשיו");
        } catch (err) {
            setError(err.response?.data?.message || "שגיאה בשינוי הסיסמה");
        } finally {
            setIsLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return "שכחתי סיסמה";
            case 2: return "אימות קוד";
            case 3: return "סיסמה חדשה";
            default: return "שכחתי סיסמה";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "הכנס את כתובת האימייל שלך ונשלח לך קוד אימות";
            case 2: return "הכנס את קוד האימות שנשלח לאימייל שלך";
            case 3: return "הכנס סיסמה חדשה לחשבון שלך";
            default: return "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{getStepTitle()}</h1>
                    <p className="text-gray-600">{getStepDescription()}</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((stepNum) => (
                            <div key={stepNum} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${step >= stepNum
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {stepNum}
                                </div>
                                {stepNum < 3 && (
                                    <div className={`w-8 h-1 mx-2 ${step > stepNum ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 p-8" dir="rtl">

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="mr-2">שולח...</span>
                                    </div>
                                ) : (
                                    "שלח קוד אימות"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verification Code */}
                    {step === 2 && (
                        <form onSubmit={handleCodeSubmit} className="space-y-6">
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="verificationCode"
                                    placeholder="קוד אימות (6 ספרות)"
                                    value={formData.verificationCode}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/70 border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/90 transition-all duration-300"
                                    maxLength="6"
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
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="mr-2">מאמת...</span>
                                    </div>
                                ) : (
                                    "אמת קוד"
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => handleEmailSubmit({ preventDefault: () => { } })}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm hover:underline transition-colors"
                                >
                                    שלח קוד שוב
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            {/* New Password Input */}
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="סיסמה חדשה (לפחות 6 תווים)"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`w-full bg-gray-50/70 border-2 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white/90 transition-all duration-300 ${passwordError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-emerald-400'
                                        }`}
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

                            {/* Confirm New Password Input */}
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmNewPassword"
                                    placeholder="אימות סיסמה חדשה"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    className={`w-full bg-gray-50/70 border-2 rounded-2xl py-4 pr-12 pl-12 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white/90 transition-all duration-300 ${passwordError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-emerald-400'
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

                            {/* Password Error */}
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
                                        <span className="mr-2">משנה סיסמה...</span>
                                    </div>
                                ) : (
                                    "שנה סיסמה"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Success/Error Messages */}
                    {message && (
                        <div className="mt-6 p-4 rounded-2xl flex items-center space-x-3 bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-5 h-5 text-emerald-500 ml-3" />
                            <p className="text-right font-medium">{message}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 rounded-2xl flex items-center space-x-3 bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
                            <p className="text-right font-medium">{error}</p>
                        </div>
                    )}

                    {/* Navigation Links */}
                    <div className="mt-8 text-center space-y-3">
                        {step < 3 && !message.includes('בהצלחה') && (
                            <p className="text-gray-600">
                                נזכרת בסיסמה?{" "}
                                <Link
                                    to="/login"
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors"
                                >
                                    התחבר כאן
                                </Link>
                            </p>
                        )}

                        {message.includes('שונתה בהצלחה') && (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center w-full py-3 px-4 bg-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-200 transition-colors font-semibold"
                            >
                                <ArrowRight className="w-5 h-5 ml-2" />
                                המשך להתחברות
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        לא קיבלת אימייל? בדוק את תיקיית הספאם
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;