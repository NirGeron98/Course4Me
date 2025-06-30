import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import ReviewFilters from '../components/my-reviews/ReviewFilters';
import ReviewsList from '../components/my-reviews/ReviewsList';
import ReviewEditModal from '../components/my-reviews/ReviewEditModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';

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

    const fetchMyReviews = useCallback(async () => {
        try {
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
    }, [user]);

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

    const handleReviewUpdated = (updatedReview) => {
        setReviews(prev => prev.map(r =>
            r._id === updatedReview._id ? updatedReview : r
        ));
        setShowEditModal(false);
        setEditingReview(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-8 sm:py-12">
                        <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 text-base sm:text-lg">טוען ביקורות...</p>
                    </div>
                </div>
            </div>
        );
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