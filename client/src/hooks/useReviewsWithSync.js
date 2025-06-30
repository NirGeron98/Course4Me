import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCourseDataContext } from '../contexts/CourseDataContext';

export const useReviewsWithSync = (courseId, token) => {
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [filterRating, setFilterRating] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const { triggerCourseRefresh, updateCourseData } = useCourseDataContext();

    const fetchReviews = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            setReviews(data);

            // Recalculate and update course stats
            if (data.length > 0) {
                const total = data.length;
                const avg = (key) => data.reduce((sum, r) => sum + (r[key] || 0), 0) / total;
                
                const calculatedStats = {
                    total,
                    avgInterest: parseFloat(avg('interest').toFixed(1)),
                    avgDifficulty: parseFloat(avg('difficulty').toFixed(1)),
                    avgWorkload: parseFloat(avg('workload').toFixed(1)),
                    avgTeachingQuality: parseFloat(avg('teachingQuality').toFixed(1)),
                    avgRecommendation: parseFloat(avg('recommendation').toFixed(1)),
                    overallRating: parseFloat((
                        (avg('interest') + avg('teachingQuality') + avg('workload')) / 3
                    ).toFixed(1))
                };

                // Update course data with new stats
                updateCourseData(courseId, {
                    stats: calculatedStats,
                    averageRating: calculatedStats.overallRating,
                    ratingsCount: calculatedStats.total,
                    lastUpdated: Date.now()
                });
            } else {
                // No reviews - clear stats
                updateCourseData(courseId, {
                    stats: null,
                    averageRating: null,
                    ratingsCount: 0,
                    lastUpdated: Date.now()
                });
            }

            // Trigger refresh for all components using this course
            triggerCourseRefresh(courseId);

        } catch (err) {
            console.error('Error fetching reviews:', err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, [courseId, token, updateCourseData, triggerCourseRefresh]);

    useEffect(() => {
        if (courseId && token) {
            fetchReviews();
        }
    }, [courseId, token, fetchReviews]);

    const addReview = useCallback((newReview) => {
        setReviews(prev => {
            const existingIndex = prev.findIndex(r => r._id === newReview._id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newReview;
                return updated;
            }
            return [newReview, ...prev];
        });
        // Trigger refresh after adding review
        setTimeout(() => fetchReviews(), 100);
    }, [fetchReviews]);

    const removeReview = useCallback((reviewId) => {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        // Trigger refresh after removing review
        setTimeout(() => fetchReviews(), 100);
    }, [fetchReviews]);

    const stats = useMemo(() => {
        if (!reviews.length) return null;

        const total = reviews.length;
        const avg = (key) => reviews.reduce((sum, r) => sum + (r[key] || 0), 0) / total;

        return {
            total,
            avgInterest: parseFloat(avg('interest').toFixed(1)),
            avgDifficulty: parseFloat(avg('difficulty').toFixed(1)),
            avgWorkload: parseFloat(avg('workload').toFixed(1)),
            avgTeachingQuality: parseFloat(avg('teachingQuality').toFixed(1)),
            avgRecommendation: parseFloat(avg('recommendation').toFixed(1)),
            overallRating: parseFloat((
                (avg('interest') + avg('teachingQuality') + avg('workload')) / 3
            ).toFixed(1))
        };
    }, [reviews]);

    const getFilteredReviews = useCallback(() => {
        let filtered = [...reviews];

        if (filterRating !== 'all') {
            const minRating = parseInt(filterRating);
            filtered = filtered.filter(review => {
                const avgRating = (review.interest + review.teachingQuality + review.workload) / 3;
                return Math.floor(avgRating) + 1 === minRating;
            });
        }

        filtered.sort((a, b) => {
            const avgA = (a.interest + a.teachingQuality + a.workload) / 3;
            const avgB = (b.interest + b.teachingQuality + b.workload) / 3;

            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'highest':
                    return avgB - avgA;
                case 'lowest':
                    return avgA - avgB;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [reviews, filterRating, sortBy]);

    const filteredReviews = getFilteredReviews();

    return {
        reviews,
        filteredReviews,
        stats,
        reviewsLoading,
        showReviewForm,
        setShowReviewForm,
        filterRating,
        setFilterRating,
        sortBy,
        setSortBy,
        addReview,
        removeReview,
        refetchReviews: fetchReviews
    };
};