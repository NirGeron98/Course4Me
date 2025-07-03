import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import ReviewFilters from '../components/my-reviews/ReviewFilters';
import ReviewsList from '../components/my-reviews/ReviewsList';
import ReviewEditModal from '../components/my-reviews/ReviewEditModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import ElegantLoadingSpinner from '../components/common/ElegantLoadingSpinner';

const MyReviewsPage = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [filtegrayReviews, setFiltegrayReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchTerm: '',
        lecturer: '',
        course: '',
        courseNumber: '',
        department: '',
        startDate: '',
        endDate: '',
        minRating: '',
        maxRating: '',
        isAnonymous: 'all',
        reviewType: 'all' // New filter for review type
    });
    const [sortBy, setSortBy] = useState('newest');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Get unique values for filter dropdowns
    const [uniqueLecturers, setUniqueLecturers] = useState([]);
    const [uniqueCourses, setUniqueCourses] = useState([]);
    const [uniqueDepartments, setUniqueDepartments] = useState([]);

    // Cache configuration
    const CACHE_KEY = `my_reviews_${user?.user?._id}`;
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    // Cache helper functions
    const isCacheValid = () => {
        const cacheData = localStorage.getItem(CACHE_KEY);
        if (!cacheData) return false;
        
        const { timestamp } = JSON.parse(cacheData);
        return Date.now() - timestamp < CACHE_DURATION;
    };

    const saveToCache = (data) => {
        try {
            const cacheData = {
                reviews: data,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            // Storage full or disabled, ignore
        }
    };

    const getFromCache = () => {
        try {
            const cacheData = localStorage.getItem(CACHE_KEY);
            if (!cacheData) return null;
            
            const { reviews } = JSON.parse(cacheData);
            return reviews;
        } catch (error) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    };

    const clearCache = () => {
        localStorage.removeItem(CACHE_KEY);
    };

      // Set page title
  useEffect(() => {
    document.title = 'הביקורות שלי - Course4Me';
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

    const fetchMyReviews = useCallback(async (forceRefresh = false) => {
        try {
            // Check cache first unless force refresh
            if (!forceRefresh && isCacheValid()) {
                const cachedReviews = getFromCache();
                if (cachedReviews && cachedReviews.length >= 0) {
                    setReviews(cachedReviews);
                    
                    // Extract unique values for filters
                    const lecturers = [...new Set(cachedReviews.map(r => r.lecturer?.name).filter(Boolean))];
                    const courses = [...new Set(cachedReviews.map(r => r.course?.title).filter(Boolean))];
                    const departments = [...new Set(cachedReviews.map(r => r.course?.department).filter(Boolean))];

                    setUniqueLecturers(lecturers);
                    setUniqueCourses(courses);
                    setUniqueDepartments(departments);
                    
                    setLoading(false);
                    return;
                }
            }

            setLoading(true);

            // Fetch both course reviews and lecturer reviews
            const [courseReviewsResponse, lecturerReviewsResponse] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                })
            ]);

            let allMyReviews = [];

            if (courseReviewsResponse.ok) {
                const courseReviews = await courseReviewsResponse.json();
                const myCourseReviews = courseReviews.filter(review =>
                    review.user && review.user._id === user.user._id
                ).map(review => ({ ...review, reviewType: 'course' }));
                allMyReviews = [...allMyReviews, ...myCourseReviews];
            }

            if (lecturerReviewsResponse.ok) {
                const lecturerReviews = await lecturerReviewsResponse.json();
                const myLecturerReviews = lecturerReviews.filter(review =>
                    review.user && review.user._id === user.user._id
                ).map(review => ({ ...review, reviewType: 'lecturer' }));
                allMyReviews = [...allMyReviews, ...myLecturerReviews];
            }

            setReviews(allMyReviews);
            
            // Save to cache
            saveToCache(allMyReviews);

            // Extract unique values for filters
            const lecturers = [...new Set(allMyReviews.map(r => r.lecturer?.name).filter(Boolean))];
            const courses = [...new Set(allMyReviews.map(r => r.course?.title).filter(Boolean))];
            const departments = [...new Set(allMyReviews.map(r => r.course?.department).filter(Boolean))];

            setUniqueLecturers(lecturers);
            setUniqueCourses(courses);
            setUniqueDepartments(departments);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [user, CACHE_KEY]);

    const applyFilters = useCallback(() => {
        let filtegray = [...reviews];

        // Apply search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtegray = filtegray.filter(review =>
                review.course?.title?.toLowerCase().includes(searchLower) ||
                review.course?.courseNumber?.toLowerCase().includes(searchLower) ||
                review.lecturer?.name?.toLowerCase().includes(searchLower) ||
                review.course?.department?.toLowerCase().includes(searchLower) ||
                review.comment?.toLowerCase().includes(searchLower)
            );
        }

        // Apply specific filters
        if (filters.lecturer) {
            filtegray = filtegray.filter(review => review.lecturer?.name === filters.lecturer);
        }

        if (filters.course) {
            filtegray = filtegray.filter(review => review.course?.title === filters.course);
        }

        if (filters.courseNumber) {
            filtegray = filtegray.filter(review =>
                review.course?.courseNumber?.includes(filters.courseNumber)
            );
        }

        if (filters.department) {
            filtegray = filtegray.filter(review => review.course?.department === filters.department);
        }

        // Date filters
        if (filters.startDate) {
            filtegray = filtegray.filter(review =>
                new Date(review.createdAt) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filtegray = filtegray.filter(review =>
                new Date(review.createdAt) <= new Date(filters.endDate)
            );
        }

        // Rating filters - handle both course and lecturer reviews
        if (filters.minRating) {
            filtegray = filtegray.filter(review => {
                let rating;
                if (review.reviewType === 'course') {
                    rating = review.recommendation || review.overallRating ||
                        ((review.interest + review.difficulty + review.workload + review.teachingQuality) / 4);
                } else {
                    rating = review.overallRating ||
                        ((review.clarity + review.responsiveness + review.availability + review.organization + review.knowledge) / 5);
                }
                return rating >= parseInt(filters.minRating);
            });
        }

        if (filters.maxRating) {
            filtegray = filtegray.filter(review => {
                let rating;
                if (review.reviewType === 'course') {
                    rating = review.recommendation || review.overallRating ||
                        ((review.interest + review.difficulty + review.workload + review.teachingQuality) / 4);
                } else {
                    rating = review.overallRating ||
                        ((review.clarity + review.responsiveness + review.availability + review.organization + review.knowledge) / 5);
                }
                return rating <= parseInt(filters.maxRating);
            });
        }

        // Review type filter
        if (filters.reviewType !== 'all') {
            filtegray = filtegray.filter(review => review.reviewType === filters.reviewType);
        }

        // Anonymous filter
        if (filters.isAnonymous !== 'all') {
            const isAnonymous = filters.isAnonymous === 'true';
            filtegray = filtegray.filter(review => Boolean(review.isAnonymous) === isAnonymous);
        }

        // Apply sorting
        filtegray.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'newest':
                    comparison = new Date(b.createdAt) - new Date(a.createdAt);
                    break;
                case 'oldest':
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'course':
                    comparison = (a.course?.title || '').localeCompare(b.course?.title || '');
                    break;
                case 'lecturer':
                    comparison = (a.lecturer?.name || '').localeCompare(b.lecturer?.name || '');
                    break;
                case 'rating':
                    let aRating, bRating;
                    if (a.reviewType === 'course') {
                        aRating = a.recommendation || a.overallRating ||
                            ((a.interest + a.difficulty + a.workload + a.teachingQuality) / 4);
                    } else {
                        aRating = a.overallRating ||
                            ((a.clarity + a.responsiveness + a.availability + a.organization + a.knowledge) / 5);
                    }

                    if (b.reviewType === 'course') {
                        bRating = b.recommendation || b.overallRating ||
                            ((b.interest + b.difficulty + b.workload + b.teachingQuality) / 4);
                    } else {
                        bRating = b.overallRating ||
                            ((b.clarity + b.responsiveness + b.availability + b.organization + b.knowledge) / 5);
                    }

                    comparison = bRating - aRating;
                    break;
                case 'department':
                    comparison = (a.course?.department || '').localeCompare(b.course?.department || '');
                    break;
                default:
                    break;
            }

            return sortOrder === 'desc' ? comparison : -comparison;
        });

        setFiltegrayReviews(filtegray);
    }, [reviews, filters, sortBy, sortOrder]);

    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: '',
            lecturer: '',
            course: '',
            courseNumber: '',
            department: '',
            startDate: '',
            endDate: '',
            minRating: '',
            maxRating: '',
            isAnonymous: 'all',
            reviewType: 'all'
        });
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setShowEditModal(true);
    };

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!reviewToDelete) return;

        try {
            const endpoint = reviewToDelete.reviewType === 'course'
                ? `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${reviewToDelete._id}`
                : `${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/${reviewToDelete._id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) throw new Error("שגיאה במחיקת הביקורת");

            // Remove from local state
            const updatedReviews = reviews.filter(r => r._id !== reviewToDelete._id);
            setReviews(updatedReviews);
            
            // Update cache
            saveToCache(updatedReviews);

            // Notify other tabs/components about review deletion
            const reviewEvent = new CustomEvent('reviewDeleted', {
                detail: { reviewId: reviewToDelete._id, timestamp: Date.now() }
            });
            window.dispatchEvent(reviewEvent);

            // Update localStorage for cross-tab synchronization
            localStorage.setItem('reviewDeleted', JSON.stringify({
                reviewId: reviewToDelete._id,
                timestamp: Date.now()
            }));
            
            // Clear dashboard stats cache for updating the review count
            const dashboardCache = window.localStorage.getItem('dashboard_stats');
            if (dashboardCache) {
                window.localStorage.removeItem('dashboard_stats');
                window.localStorage.removeItem('dashboard_stats_timestamp');
            }
            
            // Refresh dashboard data if the global function is available
            if (window.refreshDashboardData) {
                window.refreshDashboardData();
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

    const handleReviewUpdated = (updatedReview) => {
        const updatedReviews = reviews.map(r =>
            r._id === updatedReview._id ? updatedReview : r
        );
        setReviews(updatedReviews);
        
        // Update cache
        saveToCache(updatedReviews);

        // Notify other tabs/components about review update
        const reviewEvent = new CustomEvent('reviewUpdated', {
            detail: { reviewId: updatedReview._id, timestamp: Date.now() }
        });
        window.dispatchEvent(reviewEvent);

        // Update localStorage for cross-tab synchronization
        localStorage.setItem('reviewUpdated', JSON.stringify({
            reviewId: updatedReview._id,
            timestamp: Date.now()
        }));
        
        // Clear dashboard stats cache
        const dashboardCache = window.localStorage.getItem('dashboard_stats');
        if (dashboardCache) {
            window.localStorage.removeItem('dashboard_stats');
            window.localStorage.removeItem('dashboard_stats_timestamp');
        }
        
        // Refresh dashboard data if the global function is available
        if (window.refreshDashboardData) {
            window.refreshDashboardData();
        }
        
        setShowEditModal(false);
        setEditingReview(null);
    };

    // Listen for review changes from other components
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'reviewAdded' || e.key === 'reviewUpdated' || e.key === 'reviewDeleted') {
                // Force refresh when a review is added/updated/deleted
                fetchMyReviews(true);
                // Clean up the flag
                localStorage.removeItem(e.key);
            }
        };

        // Listen for custom events for review changes within the same tab
        const handleReviewChange = () => {
            fetchMyReviews(true);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('reviewAdded', handleReviewChange);
        window.addEventListener('reviewUpdated', handleReviewChange);
        window.addEventListener('reviewDeleted', handleReviewChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('reviewAdded', handleReviewChange);
            window.removeEventListener('reviewUpdated', handleReviewChange);
            window.removeEventListener('reviewDeleted', handleReviewChange);
        };
    }, [fetchMyReviews]);

    // Check if we need to refresh on component mount (e.g., after navigation)
    useEffect(() => {
        const shouldRefresh = localStorage.getItem('reviewAdded') || 
                            localStorage.getItem('reviewUpdated') ||
                            localStorage.getItem('reviewDeleted') ||
                            sessionStorage.getItem('refreshMyReviews');
        
        if (shouldRefresh) {
            fetchMyReviews(true);
            localStorage.removeItem('reviewAdded');
            localStorage.removeItem('reviewUpdated');
            localStorage.removeItem('reviewDeleted');
            sessionStorage.removeItem('refreshMyReviews');
        }
    }, [fetchMyReviews]);

    if (loading) {
        return <ElegantLoadingSpinner message="טוען ביקורות..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 sm:mb-12 text-center">
                    <div className="inline-flex flex-col items-center">
                        {/* Icon with gradient background */}
                        <div className="mb-4 p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-lg">
                            <MessageCircle className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                            הביקורות שלי
                        </h1>

                        {/* Subtitle with decorative elements */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300"></div>
                            <p className="text-base sm:text-lg font-medium">
                                נמצאו <span className="text-gray-600 font-bold">{filtegrayReviews.length}</span> ביקורות מתוך <span className="text-gray-600 font-bold">{reviews.length}</span> סה"כ
                            </p>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300"></div>
                        </div>

                        {/* Decorative underline */}
                        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                    </div>
                </div>

                {/* Filters */}
                <ReviewFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    uniqueLecturers={uniqueLecturers}
                    uniqueCourses={uniqueCourses}
                    uniqueDepartments={uniqueDepartments}
                />

                {/* Reviews List */}
                <ReviewsList
                    reviews={filtegrayReviews}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                />

                {/* Edit Modal */}
                {showEditModal && editingReview && (
                    <ReviewEditModal
                        review={editingReview}
                        user={user}
                        onClose={() => {
                            setShowEditModal(false);
                            setEditingReview(null);
                        }}
                        onReviewUpdated={handleReviewUpdated}
                    />
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && reviewToDelete && (
                    <DeleteConfirmationModal
                        isOpen={showDeleteModal}
                        onConfirm={handleConfirmDelete}
                        onCancel={handleCancelDelete}
                        title="מחיקת ביקורת"
                        message="האם אתה בטוח שברצונך למחוק את הביקורת? פעולה זו אינה ניתנת לביטול."
                    />
                )}
            </div>
        </div>
    );
};

export default MyReviewsPage;