import React, { useState, useEffect } from 'react';
import { X, Heart, Zap, Clock, TrendingUp, Award, MessageCircle, Loader2, User } from 'lucide-react';

const CourseReviewFormModal = ({
    courseId,
    courseTitle,
    user,
    onClose,
    onReviewSubmitted,
    existingReview = null
}) => {
    const [lecturers, setLecturers] = useState([]);
    const [loadingLecturers, setLoadingLecturers] = useState(true);
    const [formData, setFormData] = useState({
        lecturer: '',
        interest: 5,
        difficulty: 3,
        workload: 3,
        investment: 5,
        teachingQuality: 5,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingReview) {
            setFormData({
                lecturer: existingReview.lecturer && typeof existingReview.lecturer === 'object'
                    ? existingReview.lecturer._id
                    : existingReview.lecturer || '',
                interest: existingReview.interest,
                difficulty: existingReview.difficulty,
                workload: existingReview.workload,
                investment: existingReview.investment,
                teachingQuality: existingReview.teachingQuality,
                comment: existingReview.comment || ''
            });
        }
    }, [existingReview]);

    useEffect(() => {
        const fetchLecturers = async () => {
            try {
                const courseResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (courseResponse.ok) {
                    const courseData = await courseResponse.json();
                    setLecturers(courseData.lecturers || []);
                } else {
                    throw new Error('Failed to fetch course lecturers');
                }
            } catch (err) {
                setError('שגיאה בטעינת רשימת המרצים');
                console.error('Error fetching lecturers:', err);
            } finally {
                setLoadingLecturers(false);
            }
        };

        fetchLecturers();
    }, [courseId, user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!formData.lecturer) {
            setError('יש לבחור מרצה');
            setSubmitting(false);
            return;
        }

        try {
            const url = existingReview
                ? `http://localhost:5000/api/reviews/${existingReview._id}`
                : 'http://localhost:5000/api/reviews';

            const method = existingReview ? 'PUT' : 'POST';

            const normalizedFormData = {
                ...formData,
                lecturer: typeof formData.lecturer === 'object' ? formData.lecturer._id : formData.lecturer
            };

            const requestData = existingReview
                ? normalizedFormData
                : { ...normalizedFormData, course: courseId };

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
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

    const renderRatingInput = (label, field, icon, color, isReversed = false) => (
        <div>
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
                        className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${formData[field] >= value
                            ? `bg-${color}-500 border-${color}-500 text-white`
                            : `border-gray-300 text-${color}-500 hover:border-${color}-300`
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {existingReview ? 'עריכת ביקורת קורס' : 'כתיבת ביקורת קורס'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-blue-200 transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-blue-100 mt-2">{courseTitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            בחר מרצה *
                        </label>
                        {loadingLecturers ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="mr-2 text-gray-600">טוען מרצים...</span>
                            </div>
                        ) : lecturers.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                לא נמצאו מרצים עבור קורס זה
                            </div>
                        ) : (
                            <select
                                value={formData.lecturer}
                                onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">בחר מרצה...</option>
                                {lecturers.map((lecturer) => (
                                    <option key={lecturer._id} value={lecturer._id}>
                                        {lecturer.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        {renderRatingInput('עד כמה הקורס מעניין?', 'interest', <Heart className="w-5 h-5 text-red-500" />, 'red')}
                        {renderRatingInput('עד כמה הקורס קשה?', 'difficulty', <Zap className="w-5 h-5 text-yellow-500" />, 'yellow')}
                        {renderRatingInput('כמה זמן השקעת בקורס?', 'workload', <Clock className="w-5 h-5 text-orange-500" />, 'orange')}
                        {renderRatingInput('עד כמה השקעת בקורס?', 'investment', <TrendingUp className="w-5 h-5 text-green-500" />, 'green')}
                        {renderRatingInput('איכות ההוראה', 'teachingQuality', <Award className="w-5 h-5 text-purple-500" />, 'purple')}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-gray-500" />
                            הערות נוספות (אופציונלי)
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="4"
                            placeholder="שתף את החוויה שלך מהקורס..."
                        />
                    </div>

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
                            disabled={submitting || (!formData.lecturer && !existingReview)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {existingReview ? 'מעדכן...' : 'שולח...'}
                                </>
                            ) : (
                                existingReview ? 'עדכן ביקורת' : 'שלח ביקורת'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseReviewFormModal;