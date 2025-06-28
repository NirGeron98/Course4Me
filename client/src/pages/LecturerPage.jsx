import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, AlertCircle, Loader2, Star } from 'lucide-react';
import LecturerReviewFormModal from '../components/lecturer-page/LecturerReviewFormModal';
import LecturerHeader from '../components/lecturer-page/LecturerHeader';
import LecturerReviewsSection from '../components/lecturer-page/LecturerReviewsSection';
import LecturerStatisticsCard from '../components/lecturer-page/LecturerStatisticsCard';
import LecturerQuickActions from '../components/lecturer-page/LecturerQuickActions';

const LecturerPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecturer, setLecturer] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lecturerLoading, setLecturerLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [filterCourse, setFilterCourse] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Check if all components are ready
    useEffect(() => {
        const allDataLoaded = !lecturerLoading && !reviewsLoading && !coursesLoading;
        setLoading(!allDataLoaded);
    }, [lecturerLoading, reviewsLoading, coursesLoading]);

    const refreshLecturerRating = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
                }
            });

            if (response.ok) {
                const updatedLecturer = await response.json();
                setLecturer(updatedLecturer);
            }
        } catch (error) {
            console.error('Error refreshing lecturer rating:', error);
        }
    };

    const handleReviewDeleted = async (reviewId) => {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        await refreshLecturerRating();
    };

    // Fetch lecturer data
    useEffect(() => {
        const fetchLecturer = async () => {
            try {
                setLecturerLoading(true);
                
                if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('מזהה מרצה לא תקין');
                }

                const headers = {
                    'Content-Type': 'application/json',
                };

                if (user?.token) {
                    headers.Authorization = `Bearer ${user.token}`;
                }

                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${id}`, {
                    headers
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'שגיאה בטעינת המרצה');
                }

                const data = await response.json();
                setLecturer(data);
            } catch (err) {
                console.error('Error fetching lecturer:', err);
                setError(err.message);
            } finally {
                setLecturerLoading(false);
            }
        };

        if (id) {
            fetchLecturer();
        }
    }, [id, user?.token]);

    // Fetch reviews data
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);

                if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                    console.error('Invalid lecturer ID format:', id);
                    setError('מזהה מרצה לא תקין');
                    return;
                }

                const reviewsUrl = `${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/lecturer/${id}`;

                const reviewsResponse = await fetch(reviewsUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData);
                } else {
                    const responseText = await reviewsResponse.text();
                    console.error('❌ Reviews API failed:');
                    console.error('Status:', reviewsResponse.status);
                    console.error('Response:', responseText);

                    try {
                        const errorData = JSON.parse(responseText);
                        console.error('Error data:', errorData);
                    } catch (e) {
                        console.error('Could not parse error response as JSON');
                    }

                    setReviews([]);
                }
            } catch (err) {
                console.error('=== Error in fetchReviews ===');
                console.error('Error type:', err.constructor.name);
                console.error('Error message:', err.message);
                console.error('Error stack:', err.stack);
                setReviews([]);
            } finally {
                setReviewsLoading(false);
            }
        };

        if (id) {
            fetchReviews();
        }
    }, [id]);

    // Fetch courses data
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setCoursesLoading(true);

                if (user?.token) {
                    const coursesResponse = await fetch(
                        `${process.env.REACT_APP_API_BASE_URL}/api/courses`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${user.token}`,
                                'Content-Type': 'application/json',
                            }
                        }
                    );

                    if (coursesResponse.ok) {
                        const allCourses = await coursesResponse.json();
                        const lecturerCourses = allCourses.filter(course =>
                            course.lecturers &&
                            course.lecturers.some(lec => lec._id === id)
                        );
                        setCourses(lecturerCourses);
                    } else {
                        console.warn('Could not fetch courses - user may not be authenticated');
                        setCourses([]);
                    }
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error('=== Error in fetchCourses ===');
                console.error('Error type:', err.constructor.name);
                console.error('Error message:', err.message);
                console.error('Error stack:', err.stack);
                setCourses([]);
            } finally {
                setCoursesLoading(false);
            }
        };

        if (id) {
            fetchCourses();
        }
    }, [id, user?.token]);

    const calculateStats = () => {
        if (!reviews.length) {
            return null;
        }

        const filteredReviews = getFilteredReviews();
        const total = filteredReviews.length;

        if (total === 0) {
            return null;
        }

        const avgClarity = filteredReviews.reduce((sum, r) => sum + r.clarity, 0) / total;
        const avgResponsiveness = filteredReviews.reduce((sum, r) => sum + r.responsiveness, 0) / total;
        const avgAvailability = filteredReviews.reduce((sum, r) => sum + r.availability, 0) / total;
        const avgOrganization = filteredReviews.reduce((sum, r) => sum + r.organization, 0) / total;
        const avgKnowledge = filteredReviews.reduce((sum, r) => sum + r.knowledge, 0) / total;

        const stats = {
            total,
            avgClarity: avgClarity.toFixed(1),
            avgResponsiveness: avgResponsiveness.toFixed(1),
            avgAvailability: avgAvailability.toFixed(1),
            avgOrganization: avgOrganization.toFixed(1),
            avgKnowledge: avgKnowledge.toFixed(1),
            overallRating: ((avgClarity + avgResponsiveness + avgAvailability + avgOrganization + avgKnowledge) / 5).toFixed(1)
        };

        return stats;
    };

    const getFilteredReviews = () => {
        let filtered = [...reviews];

        if (filterCourse !== 'all') {
            filtered = filtered.filter(review => review.course?._id === filterCourse);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'highest':
                    const aRating = a.overallRating || ((a.clarity + a.responsiveness + a.availability + a.organization + a.knowledge) / 5);
                    const bRating = b.overallRating || ((b.clarity + b.responsiveness + b.availability + b.organization + b.knowledge) / 5);
                    return bRating - aRating;
                case 'lowest':
                    const aRating2 = a.overallRating || ((a.clarity + a.responsiveness + a.availability + a.organization + a.knowledge) / 5);
                    const bRating2 = b.overallRating || ((b.clarity + b.responsiveness + b.availability + b.organization + b.knowledge) / 5);
                    return aRating2 - bRating2;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const handleReviewSubmitted = async (review) => {
        if (editingReview) {
            setReviews(prev => prev.map(r => r._id === review._id ? review : r));
            setEditingReview(null);
        } else {
            setReviews(prev => [review, ...prev]);
        }

        setShowReviewForm(false);
        await refreshLecturerRating();
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const numRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className={`${size} fill-yellow-200 text-yellow-400`} />);
        }

        const emptyStars = 5 - Math.ceil(numRating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }

        return stars;
    };

    // Show loading screen until all data is ready
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold text-gray-700">טוען מידע על המרצה</h2>
                    </div>
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
            <LecturerHeader lecturer={lecturer} courses={courses} reviews={reviews} renderStars={renderStars} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <LecturerReviewsSection
                            reviews={reviews}
                            courses={courses}
                            filterCourse={filterCourse}
                            setFilterCourse={setFilterCourse}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            filteredReviews={filteredReviews}
                            reviewsLoading={false} // Always false since we wait for all data
                            onWriteReview={() => setShowReviewForm(true)}
                            onEditReview={handleEditReview}
                            user={user}
                            lecturerId={id}
                            onReviewDeleted={handleReviewDeleted}
                        />
                    </div>

                    <div className="space-y-6">
                        {stats && (
                            <LecturerStatisticsCard stats={stats} renderStars={renderStars} />
                        )}

                        <LecturerQuickActions
                            onShowReviewForm={() => setShowReviewForm(true)}
                            lecturerId={id}
                            lecturerName={lecturer?.name}
                            user={user}
                            reviews={reviews}
                            onEditReview={handleEditReview}
                        />
                    </div>
                </div>
            </div>

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