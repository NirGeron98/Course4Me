import React, { useState } from "react";
import { X, Send, BookOpen, Users, HelpCircle, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const ContactRequestModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        type: "general_request",
        subject: "",
        message: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

  const requestTypes = [
    { value: "course_request", label: "הוספת/שיוך קורס", icon: BookOpen },
    { value: "lecturer_request", label: "הוספת/שיוך מרצה", icon: Users },
    { value: "general_request", label: "פניה כללית", icon: HelpCircle }
  ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("נדרשת התחברות");
            }

            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setSuccess("הפניה נשלחה בהצלחה! נחזור אליך בהקדם האפשרי.");

            // Clear form
            setFormData({
                type: "general_request",
                subject: "",
                message: ""
            });

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess("");
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error("Error sending contact request:", error);
            setError(error.response?.data?.error || "שגיאה בשליחת הפניה");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-4">
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all w-full max-w-2xl border border-gray-100 max-h-[95vh] overflow-y-auto">
                    <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50 px-6 pt-8 pb-6" dir="rtl">

                        {/* Header */}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent mb-2">
                                יצירת קשר
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                שתף אותנו במה שחשוב לך ונעזור לך
                            </p>
                            <div className="mt-3 w-16 h-0.5 bg-gradient-to-r from-orange-500 to-rose-600 mx-auto rounded-full"></div>
                        </div>                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                        {success && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                <div className="flex items-center">
                                    <div className="bg-green-100 rounded-full p-1 ml-3">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-green-800 text-sm font-medium">{success}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                                <div className="flex items-center">
                                    <div className="bg-red-100 rounded-full p-1 ml-3">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                    </div>
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Request Type Selection */}
                            <div>
                                <label className="block text-base font-bold text-gray-800 mb-3 text-right">
                                    איך נוכל לעזור לך?
                                </label>
                                <div className="grid grid-cols-1 gap-1 text-right justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                                    {requestTypes.map(({ value, label, icon: Icon }) => (
                                        <label key={value} className="relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="type"
                                                value={value}
                                                checked={formData.type === value}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                            />
                                            <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${formData.type === value
                                                    ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-pink-50 shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className={`text-sm font-semibold ${formData.type === value ? 'text-orange-900' : 'text-gray-700'
                                                        }`}>
                                                        {label}
                                                    </span>
                                                    <div className={`p-2 rounded-lg ml-3 transition-all duration-300 ${formData.type === value
                                                            ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white'
                                                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                                        }`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Subject Input */}
                            <div>
                                <label htmlFor="subject" className="block text-base font-bold text-gray-800 mb-2 text-right">
                                    נושא הפניה
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={200}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-sm text-right"
                                    placeholder="נושא הפנייה"
                                />
                            </div>

                            {/* Message Textarea */}
                            <div>
                                <label htmlFor="message" className="block text-base font-bold text-gray-800 mb-2 text-right">
                                    פרט את הבקשה שלך
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    maxLength={2000}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white resize-none text-sm leading-relaxed text-right"
                                    placeholder="פירוט הבקשה"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 min-w-[120px]"
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !formData.subject || !formData.message}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl hover:from-orange-600 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center min-w-[120px]"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            <span>שולח...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            <span>שלח פניה</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactRequestModal;
