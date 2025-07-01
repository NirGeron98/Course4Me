import React from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle,
    Star,
    User,
    BookOpen,
    Building,
    Hash,
    Calendar,
    Eye,
    EyeOff,
    Heart,
    Zap,
    Clock,
    Award,
    ThumbsUp,
    Users,
    Tag,
    ExternalLink
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getLecturerSlug } from '../../utils/slugUtils';

const ReviewsList = ({ reviews, onEditClick, onDeleteClick }) => {
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper function to detect review type based on review fields
    const detectReviewType = (review) => {
        // Check for lecturer review fields
        if (review.clarity !== undefined || review.responsiveness !== undefined ||
            review.availability !== undefined || review.organization !== undefined ||
            review.knowledge !== undefined) {
            return 'lecturer';
        }
        // Check for course review fields
        if (review.interest !== undefined || review.difficulty !== undefined ||
            review.workload !== undefined || review.teachingQuality !== undefined) {
            return 'course';
        }
        // Fallback to provided reviewType or default to 'course'
        return review.reviewType || 'course';
    };

    // Helper function to create course slug
    const createCourseSlug = (course) => {
        if (!course || !course.title) return '#';
        return `/course/${course.courseNumber}`;
    };

    // Helper function to create lecturer slug
    const createLecturerSlug = (lecturer) => {
        if (!lecturer || !lecturer.name) return '#';
        return `/lecturer/${getLecturerSlug(lecturer)}`;
    };

    if (reviews.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    לא נמצאו ביקורות
                </h3>
                <p className="text-gray-600">
                    נסה לשנות את הסינונים או לכתוב ביקורת ראשונה
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reviews.map((review) => {
                // Detect actual review type based on fields
                const actualReviewType = detectReviewType(review);
                return (
                    <div
                        key={review._id}
                        className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                        {/* Header with Course Info and Actions */}
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="flex-1">
                                {/* Course and Department Info */}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Tag className={`w-4 h-4 ${actualReviewType === 'course' ? 'text-emerald-500' : 'text-purple-500'}`} />
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${actualReviewType === 'course'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {actualReviewType === 'course' ? 'דירוג קורס' : 'דירוג מרצה'}
                                        </span>
                                    </div>

                                    {/* Course Number and Department for course reviews - moved to same line */}
                                    {actualReviewType === 'course' && (
                                        <>
                                            {review.course?.courseNumber && (
                                                <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                                                    <Hash className="w-3 h-3" />
                                                    {review.course.courseNumber}
                                                </span>
                                            )}
                                            {review.course?.department && (
                                                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                                                    <Building className="w-3 h-3" />
                                                    {review.course.department}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Main Title - Course for course reviews, Lecturer for lecturer reviews */}
                                <div className="mb-2">
                                    {actualReviewType === 'course' ? (
                                        <Link
                                            to={createCourseSlug(review.course)}
                                            className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors flex items-center gap-2 group"
                                            title="לחץ לצפייה בדף הקורס"
                                        >
                                            <BookOpen className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 flex-shrink-0" />
                                            <span className="truncate">{review.course?.title || 'קורס לא ידוע'}</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
                                        </Link>
                                    ) : (
                                        <Link
                                            to={createLecturerSlug(review.lecturer)}
                                            className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors flex items-center gap-2 group"
                                            title="לחץ לצפייה בדף המרצה"
                                        >
                                            <User className="w-4 h-4 text-purple-500 group-hover:text-purple-600 flex-shrink-0" />
                                            <span className="truncate">{review.lecturer?.name || 'מרצה לא ידוע'}</span>
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
                                        </Link>
                                    )}
                                </div>

                                {/* Secondary Info - Lecturer for course reviews, Course for lecturer reviews */}
                                <div className="flex flex-col gap-1 text-gray-600 text-sm">
                                    {actualReviewType === 'course' ? (
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 flex-shrink-0" />
                                            <span>מרצה:</span>
                                            <Link
                                                to={createLecturerSlug(review.lecturer)}
                                                className="text-gray-900 hover:text-purple-600 font-medium transition-colors flex items-center gap-1 group truncate"
                                                title="לחץ לצפייה בדף המרצה"
                                            >
                                                <span className="truncate">{review.lecturer?.name || 'מרצה לא ידוע'}</span>
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-3 h-3 flex-shrink-0" />
                                            <span>קורס:</span>
                                            <Link
                                                to={createCourseSlug(review.course)}
                                                className="text-gray-900 hover:text-emerald-600 font-medium transition-colors flex items-center gap-1 group truncate"
                                                title="לחץ לצפייה בדף הקורס"
                                            >
                                                <span className="truncate">
                                                    {review.course?.title || 'קורס לא ידוע'}
                                                    {review.course?.courseNumber && (
                                                        <span className="text-gray-500 ml-1">
                                                            ({review.course.courseNumber})
                                                        </span>
                                                    )}
                                                </span>
                                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0" />
                                            </Link>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 flex-shrink-0" />
                                        <span className="text-xs">{formatDate(review.createdAt)}</span>
                                        {review.isAnonymous && (
                                            <>
                                                <EyeOff className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                <span className="text-blue-600 font-medium text-xs">אנונימי</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - moved to bottom */}
                            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => onEditClick(review)}
                                    className="flex items-center justify-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors text-xs"
                                    title="ערוך ביקורת"
                                >
                                    <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                                    <span>ערוך</span>
                                </button>
                                <button
                                    onClick={() => onDeleteClick(review)}
                                    className="flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-xs"
                                    title="מחק ביקורת"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                    <span>מחק</span>
                                </button>
                            </div>
                        </div>

                        {/* Rating Display - more compact */}
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-800">דירוג:</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {renderStars(parseFloat(
                                            actualReviewType === 'course'
                                                ? (review.recommendation || review.overallRating || ((review.interest + review.difficulty + review.workload + review.teachingQuality) / 4))
                                                : (review.overallRating || ((review.clarity + review.responsiveness + review.availability + review.organization + review.knowledge) / 5))
                                        ), 'w-3 h-3')}
                                    </div>
                                    <span className={`text-sm font-bold ${actualReviewType === 'course' ? 'text-emerald-600' : 'text-purple-600'}`}>
                                        {actualReviewType === 'course'
                                            ? parseFloat(
                                                review.recommendation ??
                                                review.overallRating ??
                                                ((review.interest + review.difficulty + (review.workload ?? 0) + review.teachingQuality) / 4)
                                            ).toFixed(1)
                                            : parseFloat(
                                                review.overallRating ??
                                                ((review.clarity + review.responsiveness + review.availability + review.organization + review.knowledge) / 5)
                                            ).toFixed(1)
                                        }/5.0
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Ratings Grid - more compact */}
                        {actualReviewType === 'course' ? (
                            <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Heart className="w-3 h-3 text-red-500" />
                                        <span className="text-xs font-medium text-gray-700">עניין</span>
                                    </div>
                                    <div className="text-sm font-bold text-red-600">{review.interest || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                        <span className="text-xs font-medium text-gray-700">קושי</span>
                                    </div>
                                    <div className="text-sm font-bold text-yellow-600">{review.difficulty || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Clock className="w-3 h-3 text-orange-500" />
                                        <span className="text-xs font-medium text-gray-700">השקעה</span>
                                    </div>
                                    <div className="text-sm font-bold text-orange-600">{review.workload || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Award className="w-3 h-3 text-purple-500" />
                                        <span className="text-xs font-medium text-gray-700">איכות הוראה</span>
                                    </div>
                                    <div className="text-sm font-bold text-purple-600">{review.teachingQuality || 0}/5</div>
                                </div>
                                {review.recommendation && (
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <ThumbsUp className="w-3 h-3 text-emerald-500" />
                                            <span className="text-xs font-medium text-gray-700">המלצה</span>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-600">{review.recommendation}/5</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-purple-50 rounded-lg">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Eye className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs font-medium text-gray-700">בהירות</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-600">{review.clarity || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="w-3 h-3 text-green-500" />
                                        <span className="text-xs font-medium text-gray-700">התחשבות</span>
                                    </div>
                                    <div className="text-sm font-bold text-green-600">{review.responsiveness || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Clock className="w-3 h-3 text-orange-500" />
                                        <span className="text-xs font-medium text-gray-700">זמינות</span>
                                    </div>
                                    <div className="text-sm font-bold text-orange-600">{review.availability || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Zap className="w-3 h-3 text-red-500" />
                                        <span className="text-xs font-medium text-gray-700">ארגון</span>
                                    </div>
                                    <div className="text-sm font-bold text-red-600">{review.organization || 0}/5</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        <span className="text-xs font-medium text-gray-700">עומק הידע</span>
                                    </div>
                                    <div className="text-sm font-bold text-yellow-600">{review.knowledge || 0}/5</div>
                                </div>
                            </div>
                        )}

                        {/* Comment Section - more compact */}
                        {review.comment && (
                            <div className={`relative bg-gradient-to-br ${actualReviewType === 'course'
                                ? 'from-emerald-50 via-white to-emerald-50 border-emerald-200'
                                : 'from-purple-50 via-white to-purple-50 border-purple-200'
                                } border rounded-lg p-3 shadow-sm mb-2`}>
                                <p className="text-gray-800 text-sm leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ReviewsList;