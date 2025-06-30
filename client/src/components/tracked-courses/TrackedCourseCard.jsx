import React, { useState, useEffect } from 'react';
import { BookOpen, Eye, Star, Building, X, User, ThumbsUp } from 'lucide-react';
import { useCourseDataContext } from '../../contexts/CourseDataContext';

const TrackedCourseCard = ({ course, onRemove, onViewDetails }) => {
    const [displayCourse, setDisplayCourse] = useState(course);
    const [recommendationRating, setRecommendationRating] = useState(null);
    const [reviewsCount, setReviewsCount] = useState(0);
    const { getCourseData, getRefreshTrigger } = useCourseDataContext();
    const refreshTrigger = getRefreshTrigger(course._id);

    // Update display course when cached data changes
    useEffect(() => {
        const cachedData = getCourseData(course._id);
        if (cachedData && cachedData.course) {
            setDisplayCourse(prev => ({
                ...prev,
                ...cachedData.course,
                averageRating: cachedData.averageRating,
                ratingsCount: cachedData.ratingsCount
            }));

            // Calculate recommendation-based rating from stats if available
            if (cachedData.stats && cachedData.stats.avgRecommendation) {
                setRecommendationRating(parseFloat(cachedData.stats.avgRecommendation));
                setReviewsCount(cachedData.stats.total || 0);
            } else {
                // Fallback to course averageRating (which should be recommendation-based from backend)
                setRecommendationRating(cachedData.course.averageRating ? parseFloat(cachedData.course.averageRating) : null);
                setReviewsCount(cachedData.course.ratingsCount || 0);
            }
        }
    }, [course._id, getCourseData, refreshTrigger]);

    // Fetch recommendation rating if not available in cache
    useEffect(() => {
        const fetchRecommendationRating = async () => {
            try {
                // This should fetch the stats that include avgRecommendation
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/course/${course._id}`);
                if (response.ok) {
                    const reviews = await response.json();
                    if (reviews.length > 0) {
                        // Calculate average recommendation from reviews
                        const avgRecommendation = reviews.reduce((sum, review) => {
                            return sum + (review.recommendation || 0);
                        }, 0) / reviews.length;
                        
                        setRecommendationRating(parseFloat(avgRecommendation.toFixed(1)));
                        setReviewsCount(reviews.length);
                    }
                }
            } catch (error) {
                console.error('Error fetching recommendation rating:', error);
                // Fallback to display course rating
                if (displayCourse.averageRating) {
                    setRecommendationRating(parseFloat(displayCourse.averageRating));
                    setReviewsCount(displayCourse.ratingsCount || 0);
                }
            }
        };

        // Only fetch if we don't have recommendation rating from cache
        if (recommendationRating === null && displayCourse._id) {
            fetchRecommendationRating();
        }
    }, [course._id, displayCourse.averageRating, displayCourse.ratingsCount, recommendationRating]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
        }

        return stars;
    };

    const getLecturerName = (lecturers) => {
        if (!Array.isArray(lecturers) || lecturers.length === 0) return "מרצה לא מזוהה";
        const first = lecturers[0];
        if (typeof first === "object" && first.name) return first.name;
        return "מרצה לא מזוהה";
    };

    const handleViewDetails = () => {
        // Navigate using courseNumber instead of _id
        window.location.href = `/course/${displayCourse.courseNumber}`;
    };

    return (
        <div
            onClick={handleViewDetails}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-emerald-100"
        >
            {/* Course Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full p-3 shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                        {displayCourse.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">
                            {displayCourse.courseNumber}
                        </span>
                        <span>{displayCourse.credits} נק"ז</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="truncate">{getLecturerName(displayCourse.lecturers)}</span>
                    </div>
                    {displayCourse.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Building className="w-4 h-4" />
                            <span className="truncate">{displayCourse.department}</span>
                        </div>
                    )}
                </div>

                {/* Remove Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(displayCourse._id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="הסר מעקב"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Recommendation Rating */}
            {recommendationRating && reviewsCount > 0 ? (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4 mb-4 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-gray-700">דירוג המלצה</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                            {recommendationRating.toFixed(1)}/5.0
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                            {renderStars(recommendationRating)}
                        </div>
                        <span className="text-xs text-gray-600">
                            {reviewsCount} ביקורות
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 bg-emerald-50 rounded px-2 py-1 mt-2">
                        מבוסס על קריטריון ההמלצה של הסטודנטים
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center border border-gray-200">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">עדיין אין ביקורות</span>
                    </div>
                    <span className="text-xs text-gray-400">היה הראשון לדרג את הקורס</span>
                </div>
            )}

            {/* Course Description */}
            {displayCourse.description && (
                <div className="mb-4">
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {displayCourse.description.length > 100
                            ? displayCourse.description.substring(0, 100) + "..."
                            : displayCourse.description}
                    </p>
                </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-between">
                <button className="text-emerald-500 hover:text-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors">
                    <Eye className="w-4 h-4" />
                    צפה בפרטים
                </button>

                {/* Additional Info */}
                <div className="text-xs text-gray-500">
                    {displayCourse.academicInstitution || 'מכללת אפקה'}
                </div>
            </div>
        </div>
    );
};

export default TrackedCourseCard;