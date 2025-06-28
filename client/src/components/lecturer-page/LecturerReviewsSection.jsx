import React, { useState } from 'react';
import { MessageCircle, Star, Plus, Loader2, User, Filter, SortAsc, Shield } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import ExistingReviewModal from '../common/ExistingReviewModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal'; 

const LecturerReviewsSection = ({
    reviews,
    courses,
    filterCourse,
    setFilterCourse,
    sortBy,
    setSortBy,
    filteredReviews,
    reviewsLoading,
    onWriteReview,
    onEditReview,
    user,
    lecturerId,
    onReviewDeleted 
}) => {
    const [showExistingReviewModal, setShowExistingReviewModal] = useState(false);
    const [userExistingReview, setUserExistingReview] = useState(null);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const isAdmin = user?.user?.role === 'admin';

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
            onWriteReview();
        }
    };

    const handleEditExistingReview = () => {
        setShowExistingReviewModal(false);
        onEditReview(userExistingReview);
    };

    const handleCancelExistingReview = () => {
        setShowExistingReviewModal(false);
        setUserExistingReview(null);
    };

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!reviewToDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/lecturer-reviews/${reviewToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) throw new Error("שגיאה במחיקת הביקורת");

            if (onReviewDeleted) {
                onReviewDeleted(reviewToDelete._id);
            } else {
                window.location.reload(); // fallback
            }
            
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

    if (reviewsLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">טוען ביקורות...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-purple-500" />
                        ביקורות סטודנטים ({reviews.length})
                        {isAdmin && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                אדמין
                            </span>
                        )}
                    </h2>

                    {user && (
                        <button
                            onClick={handleWriteReviewClick} 
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            כתוב ביקורת
                        </button>
                    )}
                </div>

                {/* Filters and Sort */}
                {reviews.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="all">כל הקורסים</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title} ({course.courseNumber})
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
                                <option value="highest">ציון גבוה</option>
                                <option value="lowest">ציון נמוך</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {filterCourse !== 'all' ? 'אין ביקורות לקורס זה' : 'אין ביקורות עדיין'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filterCourse !== 'all'
                                ? 'נסה לבחור קורס אחר או לכתוב ביקורת ראשונה'
                                : 'היה הראשון לכתוב ביקורת על המרצה'
                            }
                        </p>
                        {user && (
                            <button
                                onClick={handleWriteReviewClick} 
                                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors"
                            >
                                כתוב ביקורת ראשונה
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredReviews.map((review) => {
                            const overallRating = review.overallRating || 
                                ((review.clarity + review.responsiveness + review.availability + review.organization + review.knowledge) / 5).toFixed(1);
                            
                            return (
                                <div key={review._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-gray-800">
                                                    {review.user?.fullName || 'משתמש אנונימי'}
                                                </span>
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {review.course?.title || 'קורס לא ידוע'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {renderStars(parseFloat(overallRating || 0))}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {overallRating}/5.0
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(review.createdAt).toLocaleDateString('he-IL')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {canEditReview(review) && (
                                                <button
                                                    onClick={() => onEditReview(review)}
                                                    className="text-purple-500 hover:text-purple-600"
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

                                    {/* Rating Details */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700">בהירות הוראה</div>
                                            <div className="text-sm text-blue-600 font-bold">{review.clarity || 0}/5</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700">התחשבות</div>
                                            <div className="text-sm text-green-600 font-bold">{review.responsiveness || 0}/5</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700">זמינות</div>
                                            <div className="text-sm text-orange-600 font-bold">{review.availability || 0}/5</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700">ארגון השיעור</div>
                                            <div className="text-sm text-red-600 font-bold">{review.organization || 0}/5</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700">עומק הידע</div>
                                            <div className="text-sm text-yellow-600 font-bold">{review.knowledge || 0}/5</div>
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <div className="relative mt-3 bg-gradient-to-br from-purple-50 via-white to-purple-50 border border-purple-200 rounded-xl p-5 shadow-sm">
                                            <span className="absolute top-2 right-4 text-purple-300 text-3xl leading-none select-none font-serif">"</span>
                                            <p className="text-gray-800 text-base leading-relaxed font-medium italic">
                                                {review.comment}
                                            </p>
                                            <span className="absolute bottom-2 left-4 text-purple-300 text-3xl leading-none select-none font-serif">"</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Existing Review Modal */}
            {showExistingReviewModal && userExistingReview && (
                <ExistingReviewModal
                    existingReview={userExistingReview}
                    onEdit={handleEditExistingReview}
                    onCancel={handleCancelExistingReview}
                    reviewType="lecturer"
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && reviewToDelete && (
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    title="מחיקת ביקורת מרצה"
                    message={
                        isAdmin && !canEditReview(reviewToDelete)
                            ? `האם אתה בטוח שברצונך למחוק את הביקורת של ${reviewToDelete.user?.fullName || 'משתמש אנונימי'} על הקורס ${reviewToDelete.course?.title || 'לא ידוע'}? פעולה זו אינה ניתנת לביטול.`
                            : "האם אתה בטוח שברצונך למחוק את הביקורת? פעולה זו אינה ניתנת לביטול."
                    }
                />
            )}
        </>
    );
};

export default LecturerReviewsSection;