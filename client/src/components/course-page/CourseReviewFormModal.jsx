import React, { useState, useEffect } from 'react';
import { X, Heart, Zap, Clock, TrendingUp, Award, MessageCircle, Loader2, User, Eye, EyeOff } from 'lucide-react';
import ExistingReviewModal from '../common/ExistingReviewModal';

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
    const [allReviews, setAllReviews] = useState([]);
    const [showExistingReviewModal, setShowExistingReviewModal] = useState(false);
    const [userExistingReview, setUserExistingReview] = useState(null);
    const [formData, setFormData] = useState({
        lecturer: '',
        interest: 3,
        difficulty: 3,
        workload: 3,
        investment: 3,
        teachingQuality: 3,
        comment: '',
        isAnonymous: false // New field for anonymous review
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Check for existing review when lecturer is selected
    const checkForExistingReview = (selectedLecturerId) => {
        if (!user?.user || !selectedLecturerId) return null;
        
        return allReviews.find(review => 
            review.user && review.user._id === user.user._id &&
            ((typeof review.lecturer === 'object' && review.lecturer._id === selectedLecturerId) ||
             (typeof review.lecturer === 'string' && review.lecturer === selectedLecturerId))
        );
    };

    useEffect(() => {
        if (existingReview) {
            console.log('Loading existing review:', {
                review: existingReview,
                isAnonymous: existingReview.isAnonymous,
                isAnonymousType: typeof existingReview.isAnonymous
            });
            
            const newFormData = {
                lecturer: existingReview.lecturer && typeof existingReview.lecturer === 'object'
                    ? existingReview.lecturer._id
                    : existingReview.lecturer || '',
                interest: existingReview.interest,
                difficulty: existingReview.difficulty,
                workload: existingReview.workload,
                investment: existingReview.investment,
                teachingQuality: existingReview.teachingQuality,
                comment: existingReview.comment || '',
                isAnonymous: Boolean(existingReview.isAnonymous)
            };
            
            console.log('Setting form data:', newFormData);
            setFormData(newFormData);
        }
    }, [existingReview]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch course lecturers
                const courseResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${courseId}`, {
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

                // Fetch existing reviews for this course to check for duplicates
                const reviewsResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setAllReviews(reviewsData);
                }
            } catch (err) {
                setError('שגיאה בטעינת המידע');
                console.error('Error fetching data:', err);
            } finally {
                setLoadingLecturers(false);
            }
        };

        fetchData();
    }, [courseId, user.token]);

    const handleLecturerChange = (selectedLecturerId) => {
        // If we're editing an existing review, don't check for duplicates
        if (existingReview) {
            setFormData({ ...formData, lecturer: selectedLecturerId });
            return;
        }

        const existingUserReview = checkForExistingReview(selectedLecturerId);
        
        if (existingUserReview) {
            setUserExistingReview(existingUserReview);
            setShowExistingReviewModal(true);
        } else {
            setFormData({ ...formData, lecturer: selectedLecturerId });
        }
    };

    const handleEditExistingReview = () => {
        setShowExistingReviewModal(false);
        // Close this modal and signal to parent to edit the existing review
        onClose();
        // Call onReviewSubmitted with edit flag
        if (onReviewSubmitted) {
            onReviewSubmitted(userExistingReview, 'edit');
        }
    };

    const handleCancelExistingReview = () => {
        setShowExistingReviewModal(false);
        setUserExistingReview(null);
        // Reset lecturer selection
        setFormData({ ...formData, lecturer: '' });
    };

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
                ? `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${existingReview._id}`
                : `${process.env.REACT_APP_API_BASE_URL}/api/reviews`;

            const method = existingReview ? 'PUT' : 'POST';

            const normalizedFormData = {
                ...formData,
                lecturer: typeof formData.lecturer === 'object' ? formData.lecturer._id : formData.lecturer
            };

            const requestData = existingReview
                ? normalizedFormData
                : { ...normalizedFormData, course: courseId };

            console.log('Sending to server:', requestData);

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
            console.log('Received from server:', newReview);
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

    // Styled Toggle component for anonymous review
    const AnonymousToggle = () => (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        {formData.isAnonymous ? (
                            <EyeOff className="w-5 h-5 text-blue-600" />
                        ) : (
                            <Eye className="w-5 h-5 text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">ביקורת אנונימית</h3>
                        <p className="text-sm text-gray-600">
                            {formData.isAnonymous 
                                ? 'הביקורת תופיע כ"משתמש אנונימי"' 
                                : 'השם שלך יופיע בביקורת'
                            }
                        </p>
                    </div>
                </div>
                
                <button
                    type="button"
                    onClick={() => {
                        const newValue = !formData.isAnonymous;
                        console.log('Toggle clicked:', { current: formData.isAnonymous, new: newValue });
                        setFormData({ ...formData, isAnonymous: newValue });
                    }}
                    className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        formData.isAnonymous ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={formData.isAnonymous}
                >
                    <span className="sr-only">
                        {formData.isAnonymous ? 'הפוך לגלוי' : 'הפוך לאנונימי'}
                    </span>
                    <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.isAnonymous ? '-translate-x-6' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                {existingReview ? 'עריכת ביקורת קורס' : 'כתיבת ביקורת קורס'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-emerald-200 transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-emerald-100 mt-2">{courseTitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-500" />
                                בחר מרצה *
                            </label>
                            {loadingLecturers ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    <span className="mr-2 text-gray-600">טוען מרצים...</span>
                                </div>
                            ) : lecturers.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    לא נמצאו מרצים עבור קורס זה
                                </div>
                            ) : (
                                <select
                                    value={formData.lecturer}
                                    onChange={(e) => handleLecturerChange(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

                        {/* Anonymous Toggle */}
                        <AnonymousToggle />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {renderRatingInput('עד כמה הקורס מעניין?', 'interest', <Heart className="w-5 h-5 text-red-500" />, 'red')}
                            {renderRatingInput('עד כמה הקורס קשה?', 'difficulty', <Zap className="w-5 h-5 text-yellow-500" />, 'yellow')}
                            {renderRatingInput('כמה זמן השקעת בקורס מעבר לשיעורים?', 'workload', <Clock className="w-5 h-5 text-orange-500" />, 'orange')}
                            {renderRatingInput('עד כמה הקורס דרש ממך מאמץ אישי כדי להצליח?', 'investment', <TrendingUp className="w-5 h-5 text-emerald-500" />, 'emerald')}
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
                                rows="2"
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
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

            {/* Existing Review Modal */}
            {showExistingReviewModal && userExistingReview && (
                <ExistingReviewModal
                    onEdit={handleEditExistingReview}
                    onCancel={handleCancelExistingReview}
                    existingReview={userExistingReview}
                    reviewType="course"
                />
            )}
        </>
    );
};

export default CourseReviewFormModal;