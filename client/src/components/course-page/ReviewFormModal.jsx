import React, { useState } from 'react';
import { X, Heart, Brain, Clock, Zap, Award, MessageCircle, Loader2 } from 'lucide-react';

const ReviewFormModal = ({ courseId, courseName, user, onClose, onReviewSubmitted }) => {
    const [formData, setFormData] = useState({
        interest: 5,
        difficulty: 3,
        workload: 3,
        investment: 3,
        teachingQuality: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    course: courseId,
                    ...formData
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'שגיאה בשליחת הביקורת');
            }

            const newReview = await response.json();
            onReviewSubmitted(newReview);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderRatingInput = (label, field, icon, color) => (
        <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                {icon}
                {label}
            </label>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, [field]: value })}
                        className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${
                            formData[field] >= value
                                ? `bg-${color}-500 border-${color}-500 text-white`
                                : `border-gray-300 text-gray-400 hover:border-${color}-300`
                        }`}
                    >
                        {value}
                    </button>
                ))}
                <span className="mr-3 text-gray-600 font-medium">{formData[field]}/5</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">כתיבת ביקורת</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-emerald-200 transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-emerald-100 mt-2">{courseName}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {renderRatingInput(
                        'עניין בקורס',
                        'interest',
                        <Heart className="w-5 h-5 text-red-500" />,
                        'red'
                    )}

                    {renderRatingInput(
                        'רמת קושי',
                        'difficulty',
                        <Brain className="w-5 h-5 text-orange-500" />,
                        'orange'
                    )}

                    {renderRatingInput(
                        'עומס העבודה',
                        'workload',
                        <Clock className="w-5 h-5 text-blue-500" />,
                        'blue'
                    )}

                    {renderRatingInput(
                        'השקעה נדרשת',
                        'investment',
                        <Zap className="w-5 h-5 text-purple-500" />,
                        'purple'
                    )}

                    {renderRatingInput(
                        'איכות ההוראה',
                        'teachingQuality',
                        <Award className="w-5 h-5 text-emerald-500" />,
                        'emerald'
                    )}

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-gray-500" />
                            הערות נוספות (אופציונלי)
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows="4"
                            placeholder="שתף את החוויה שלך מהקורס..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
                            disabled={submitting}
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    שולח...
                                </>
                            ) : (
                                'שלח ביקורת'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewFormModal;