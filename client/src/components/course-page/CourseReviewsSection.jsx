import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, Plus, Loader2, User, Filter, SortAsc, Shield } from 'lucide-react';
import ReviewFormModal from './CourseReviewFormModal';
import ExistingReviewModal from '../common/ExistingReviewModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

const CourseReviewsSection = ({ courseId, courseTitle, user, onShowReviewForm }) => {
    const [reviews, setReviews] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [filterLecturer, setFilterLecturer] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showExistingReviewModal, setShowExistingReviewModal] = useState(false);
    const [userExistingReview, setUserExistingReview] = useState(null);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const isAdmin = user?.user?.role === 'admin';

    // Function to get display name based on anonymity setting
    const getDisplayName = (review) => {
        console.log('Review in getDisplayName:', {
            isAnonymous: review.isAnonymous,
            userFullName: review.user?.fullName,
            fullReview: review
        });
        
        if (review.isAnonymous === true) {
            return 'משתמש אנונימי';
        }
        return review.user?.fullName || 'משתמש אנונימי';
    };

    const fetchData = async () => {
        try {
            const courseResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            let lecturersList = [];

            if (courseResponse.ok) {
                const courseData = await courseResponse.json();
                lecturersList = courseData.lecturers || [];
                setLecturers(lecturersList);
            }

            const reviewsResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json();

                const lecturerMap = {};
                lecturersList.forEach((lecturer) => {
                    lecturerMap[lecturer._id] = lecturer;
                });

                const enrichedReviews = reviewsData.map((review) => ({
                    ...review,
                    lecturer: typeof review.lecturer === 'string'
                        ? lecturerMap[review.lecturer] || { name: 'מרצה לא ידוע' }
                        : review.lecturer
                }));

                setReviews(enrichedReviews);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [courseId, user.token]);

    const checkForExistingReview = () => {
        if (!user?.user) return null;
        
        return reviews.find(review => 
            review.user && review.user._id === user.user._id
        );
    };

    const handleWriteReviewClick = () => {
        if (!user) {
            alert('יש להתחבר כדי לכתוב ביקורת');
            return;
        }

        const existingReview = checkForExistingReview();
        
        if (existingReview) {
            setUserExistingReview(existingReview);
            setShowExistingReviewModal(true);
        } else {
            setShowReviewForm(true);
        }
    };

    const handleEditExistingReview = () => {
        setShowExistingReviewModal(false);
        setEditingReview(userExistingReview);
        setShowReviewForm(true);
    };

    const handleCancelExistingReview = () => {
        setShowExistingReviewModal(false);
        setUserExistingReview(null);
    };

    const getFilteredReviews = () => {
        let filtered = [...reviews];

        if (filterLecturer !== 'all') {
            filtered = filtered.filter(review => review.lecturer && review.lecturer._id === filterLecturer);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'highest':
                    return (b.recommendation || 0) - (a.recommendation || 0);
                case 'lowest':
                    return (a.recommendation || 0) - (b.recommendation || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!reviewToDelete) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) throw new Error("שגיאה במחיקת הביקורת");

            setReviews(prev => prev.filter(r => r._id !== reviewToDelete._id));
            setShowDeleteModal(false);
            setReviewToDelete(null);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setReviewToDelete(null);
    };

    const handleReviewSubmitted = (newReview) => {
        fetchData();
        setEditingReview(null);
        setShowReviewForm(false);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const canEditReview = (review) => {
        return review.user && user?.user && review.user._id === user.user._id;
    };

    const canDeleteReview = (review) => {
        return isAdmin || canEditReview(review);
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className={`${size} fill-yellow-200 text-yellow-400`} />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }

        return stars;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">טוען ביקורות...</p>
                </div>
            </div>
        );
    }

    const filteredReviews = getFilteredReviews();

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-emerald-500" />
                        ביקורות סטודנטים ({reviews.length})
                        {isAdmin && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                אדמין
                            </span>
                        )}
                    </h2>

                    <button
                        onClick={handleWriteReviewClick}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">כתוב ביקורת</span>
                    </button>
                </div>

                {reviews.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={filterLecturer}
                                onChange={(e) => setFilterLecturer(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="all">כל המרצים</option>
                                {lecturers.map((lecturer) => (
                                    <option key={lecturer._id} value={lecturer._id}>
                                        {lecturer?.name || 'מרצה לא ידוע'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <SortAsc className="w-4 h-4 text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="newest">הכי חדש</option>
                                <option value="oldest">הכי ישן</option>
                                <option value="highest">המלצה גבוהה</option>
                                <option value="lowest">המלצה נמוכה</option>
                            </select>
                        </div>
                    </div>
                )}

                {filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {filterLecturer !== 'all' ? 'אין ביקורות למרצה זה' : 'אין ביקורות עדיין'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filterLecturer !== 'all'
                                ? 'נסה לבחור מרצה אחר או לכתוב ביקורת ראשונה'
                                : 'היה הראשון לכתוב ביקורת על הקורס'
                            }
                        </p>
                        <button
                            onClick={handleWriteReviewClick}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
                        >
                            כתוב ביקורת ראשונה
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReviews.map((review) => (
                            <div key={review._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-gray-800 flex items-center gap-2">
                                                {getDisplayName(review)}
                                                {review.isAnonymous && (
                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                        אנונימי
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {review.lecturer?.name || 'מרצה לא ידוע'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                {renderStars(parseFloat(review.recommendation || 0))}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {review.recommendation || 0}/5.0
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('he-IL')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {canEditReview(review) && (
                                            <button
                                                onClick={() => handleEditReview(review)}
                                                className="text-emerald-500 hover:text-emerald-600"
                                                title="ערוך ביקורת"
                                            >
                                                <FontAwesomeIcon icon={faPen} className="h-5 w-5" />
                                            </button>
                                        )}

                                        {canDeleteReview(review) && (
                                            <button
                                                onClick={() => handleDeleteClick(review)}
                                                className="text-red-500 hover:text-red-600"
                                                title={isAdmin && !canEditReview(review) ? "מחק ביקורת (אדמין)" : "מחק ביקורת"}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-700">עניין</div>
                                        <div className="text-sm text-red-600 font-bold">{review.interest || 0}/5</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-700">קושי</div>
                                        <div className="text-sm text-yellow-600 font-bold">{review.difficulty || 0}/5</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-700">השקעה</div>
                                        <div className="text-sm text-orange-600 font-bold">{review.workload || 0}/5</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-700">איכות הוראה</div>
                                        <div className="text-sm text-purple-600 font-bold">{review.teachingQuality || 0}/5</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-700">המלצה</div>
                                        <div className="text-sm text-emerald-600 font-bold">{review.recommendation || 0}/5</div>
                                    </div>
                                </div>

                                {review.comment && (
                                    <div className="relative mt-3 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
                                        <span className="absolute top-2 right-4 text-emerald-300 text-3xl leading-none select-none font-serif">"</span>
                                        <p className="text-gray-800 text-base leading-relaxed font-medium italic">
                                            {review.comment}
                                        </p>
                                        <span className="absolute bottom-2 left-4 text-emerald-300 text-3xl leading-none select-none font-serif">"</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {showReviewForm && (
                    <ReviewFormModal
                        courseId={courseId}
                        courseTitle={courseTitle}
                        user={user}
                        existingReview={editingReview}
                        onClose={() => {
                            setShowReviewForm(false);
                            setEditingReview(null);
                        }}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                )}
            </div>

            {showExistingReviewModal && userExistingReview && (
                <ExistingReviewModal
                    onEdit={handleEditExistingReview}
                    onCancel={handleCancelExistingReview}
                    existingReview={userExistingReview}
                />
            )}

            {showDeleteModal && reviewToDelete && (
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    title="מחיקת ביקורת"
                    message={
                        isAdmin && !canEditReview(reviewToDelete)
                            ? `האם אתה בטוח שברצונך למחוק את הביקורת של ${getDisplayName(reviewToDelete)}? פעולה זו אינה ניתנת לביטול.`
                            : "האם אתה בטוח שברצונך למחוק את הביקורת? פעולה זו אינה ניתנת לביטול."
                    }
                />
            )}
        </>
    );
};

export default CourseReviewsSection;