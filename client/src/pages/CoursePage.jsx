import { useCourseData } from '../components/course-page/hooks/useCourseData';
import { useReviews } from '../components/course-page/hooks/useReviews';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import CourseDescription from '../components/course-page/CourseDescription';
import CourseHeader from '../components/course-page/CourseHeader';
import QuickActions from '../components/course-page/QuickActions';
import ReviewFormModal from '../components/course-page/ReviewFormModal';
import ReviewsSection from '../components/course-page/ReviewsSection';
import StatisticsCard from '../components/course-page/StatisticsCard';


const CoursePage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { course, loading, error } = useCourseData(id, user?.token);
    const {
        reviews,
        reviewsLoading,
        showReviewForm,
        setShowReviewForm,
        filterRating,
        setFilterRating,
        sortBy,
        setSortBy,
        filteredReviews,
        stats,
        addReview
    } = useReviews(id, user?.token);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">טוען מידע על הקורס...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">שגיאה בטעינת הקורס</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                        חזור אחורה
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">קורס לא נמצא</h1>
                    <p className="text-gray-600 mb-6">הקורס שחיפשת לא קיים במערכת</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                        חזור לדף הבית
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100" dir="rtl">
            {/* Course Header */}
            <CourseHeader course={course} stats={stats} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Course Description & Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        <CourseDescription course={course} />

                        <ReviewsSection
                            reviews={reviews}
                            reviewsLoading={reviewsLoading}
                            filteredReviews={filteredReviews}
                            filterRating={filterRating}
                            setFilterRating={setFilterRating}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            onShowReviewForm={() => setShowReviewForm(true)}
                        />
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {stats && <StatisticsCard stats={stats} />}
                        <QuickActions
                            onShowReviewForm={() => setShowReviewForm(true)}
                            courseId={id}
                            courseName={course.title}
                            user={user}
                        />
                    </div>
                </div>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <ReviewFormModal
                    courseId={id}
                    courseName={course.title}
                    user={user}
                    onClose={() => setShowReviewForm(false)}
                    onReviewSubmitted={addReview}
                />
            )}
        </div>
    );
};

export default CoursePage;