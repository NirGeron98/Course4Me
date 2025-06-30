import { useCourseDataWithSync } from '../hooks/useCourseDataWithSync';
import { useReviewsWithSync } from '../hooks/useReviewsWithSync';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import CourseDescription from '../components/course-page/CourseDescription';
import CourseHeader from '../components/course-page/CourseHeader';
import QuickActions from '../components/course-page/CourseQuickActions';
import CourseReviewFormModal from '../components/course-page/CourseReviewFormModal';
import CourseReviewsSection from '../components/course-page/CourseReviewsSection';
import CourseStatisticsCard from '../components/course-page/CourseStatisticsCard';

const CoursePage = ({ user }) => {
    const { courseNumber } = useParams();
    const navigate = useNavigate();
    const { course, stats, loading, error } = useCourseDataWithSync(courseNumber, user?.token, 'courseNumber');
    const {
        showReviewForm,
        setShowReviewForm,
        stats: reviewStats,
        reviews,
        refetchReviews
    } = useReviewsWithSync(course?._id, user?.token);

    const [editingReview, setEditingReview] = useState(null);

    const handleShowReviewForm = (existingReview = null) => {
        if (existingReview) {
            setEditingReview(existingReview);
        } else {
            setEditingReview(null);
        }
        setShowReviewForm(true);
    };

    const handleCloseReviewForm = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const handleReviewSubmitted = async (reviewData) => {
        await refetchReviews();
        handleCloseReviewForm();
    };

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
            <CourseHeader course={course} stats={stats} reviews={reviews} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <CourseDescription course={course} />
                        <CourseReviewsSection
                            courseId={course._id}
                            courseTitle={course.title}
                            user={user}
                            onShowReviewForm={handleShowReviewForm}
                        />
                    </div>

                    <div className="space-y-6">
                        {reviewStats && <CourseStatisticsCard stats={reviewStats} />}
                        <QuickActions
                            onShowReviewForm={handleShowReviewForm}
                            courseId={course._id}
                            courseName={course.title}
                            user={user}
                        />
                    </div>
                </div>
            </div>

            {showReviewForm && (
                <CourseReviewFormModal
                    courseId={course._id}
                    courseTitle={course.title}
                    user={user}
                    existingReview={editingReview}
                    onClose={handleCloseReviewForm}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </div>
    );
};

export default CoursePage;