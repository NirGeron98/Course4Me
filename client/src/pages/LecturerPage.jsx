import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, AlertCircle, Loader2, Star } from 'lucide-react';
import LecturerReviewFormModal from '../components/lecturer-page/LecturerReviewFormModal';
import LecturerHeader from '../components/lecturer-page/LecturerHeader';
import LecturerReviewsSection from '../components/lecturer-page/LecturerReviewsSection';
import LecturerStatisticsCard from '../components/lecturer-page/LecturerStatisticsCard';
import LecturerQuickStatsCard from '../components/lecturer-page/LecturerQuickStatsCard';

const LecturerPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecturer, setLecturer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [filterCourse, setFilterCourse] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Fetch lecturer data
    useEffect(() => {
        const fetchLecturer = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/lecturers/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('שגיאה בטעינת המרצה');
                }

                const data = await response.json();
                setLecturer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id && user?.token) {
            fetchLecturer();
        }
    }, [id, user?.token]);

    // Fetch reviews and courses
    useEffect(() => {
        const fetchReviewsAndCourses = async () => {
            try {
                // Fetch reviews
                const reviewsResponse = await fetch(`http://localhost:5000/api/lecturer-reviews/lecturer/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData);
                }

                // Fetch courses taught by this lecturer
                const coursesResponse = await fetch('http://localhost:5000/api/courses', {
                    headers: {
                        'Authorization': `Bearer ${user?.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (coursesResponse.ok) {
                    const allCourses = await coursesResponse.json();
                    const lecturerCourses = allCourses.filter(course =>
                        course.lecturers && course.lecturers.some(lec => lec._id === id)
                    );
                    setCourses(lecturerCourses);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        if (id && user?.token) {
            fetchReviewsAndCourses();
        }
    }, [id, user?.token]);

    // Calculate statistics
    const calculateStats = () => {
        if (!reviews.length) return null;

        const filteredReviews = getFilteredReviews();
        const total = filteredReviews.length;

        if (total === 0) return null;

        const avgClarity = filteredReviews.reduce((sum, r) => sum + r.clarity, 0) / total;
        const avgResponsiveness = filteredReviews.reduce((sum, r) => sum + r.responsiveness, 0) / total;
        const avgAvailability = filteredReviews.reduce((sum, r) => sum + r.availability, 0) / total;
        const avgOrganization = filteredReviews.reduce((sum, r) => sum + r.organization, 0) / total;
        const avgKnowledge = filteredReviews.reduce((sum, r) => sum + r.knowledge, 0) / total;

        return {
            total,
            avgClarity: avgClarity.toFixed(1),
            avgResponsiveness: avgResponsiveness.toFixed(1),
            avgAvailability: avgAvailability.toFixed(1),
            avgOrganization: avgOrganization.toFixed(1),
            avgKnowledge: avgKnowledge.toFixed(1),
            overallRating: ((avgClarity + avgResponsiveness + avgAvailability + avgOrganization + avgKnowledge) / 5).toFixed(1)
        };
    };

    // Filter and sort reviews
    const getFilteredReviews = () => {
        let filtered = [...reviews];

        // Filter by course
        if (filterCourse !== 'all') {
            filtered = filtered.filter(review => review.course._id === filterCourse);
        }

        // Sort reviews
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'highest':
                    return b.overallRating - a.overallRating;
                case 'lowest':
                    return a.overallRating - b.overallRating;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const handleReviewSubmitted = (review) => {
        if (editingReview) {
            // Update existing review
            setReviews(prev => prev.map(r => r._id === review._id ? review : r));
            setEditingReview(null);
        } else {
            // Add new review
            setReviews(prev => [review, ...prev]);
        }
        setShowReviewForm(false);
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
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
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">טוען מידע על המרצה...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">שגיאה בטעינת המרצה</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                        חזור אחורה
                    </button>
                </div>
            </div>
        );
    }

    if (!lecturer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">מרצה לא נמצא</h1>
                    <p className="text-gray-600 mb-6">המרצה שחיפשת לא קיים במערכת</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                        חזור לדף הבית
                    </button>
                </div>
            </div>
        );
    }

    const stats = calculateStats();
    const filteredReviews = getFilteredReviews();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100" dir="rtl">
            {/* Lecturer Header */}
            <LecturerHeader lecturer={lecturer} courses={courses} stats={stats} renderStars={renderStars} />


            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Reviews */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reviews Section */}
                        <LecturerReviewsSection
                            reviews={reviews}
                            courses={courses}
                            filterCourse={filterCourse}
                            setFilterCourse={setFilterCourse}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            filteredReviews={filteredReviews}
                            reviewsLoading={reviewsLoading}
                            onWriteReview={() => setShowReviewForm(true)}
                            onEditReview={handleEditReview}
                            user={user}
                        />

                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6">
                        {/* Rating Breakdown */}
                        {stats && (
                            <LecturerStatisticsCard stats={stats} renderStars={renderStars} />
                        )}


                        {/* Quick Stats */}
                        <LecturerQuickStatsCard
                            stats={stats}
                            reviewsCount={reviews.length}
                            coursesCount={courses.length}
                        />
                    </div>
                </div>
            </div>

            {/* Review Form Modal */}
            {showReviewForm && (
                <LecturerReviewFormModal
                    lecturerId={id}
                    lecturerName={lecturer.name}
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
    );
};

export default LecturerPage;