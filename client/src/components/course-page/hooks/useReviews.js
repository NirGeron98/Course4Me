import { useState, useEffect, useMemo } from 'react';

export const useReviews = (courseId, token) => {
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [filterRating, setFilterRating] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const fetchReviews = async () => {
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
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId && token) {
            fetchReviews();
        }
    }, [courseId, token]);

    const addReview = (newReview) => {
        setReviews(prev => {
            const existingIndex = prev.findIndex(r => r._id === newReview._id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newReview;
                return updated;
            }
            return [newReview, ...prev];
        });
    };

    const removeReview = (reviewId) => {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
    };

    const stats = useMemo(() => {
        if (!reviews.length) return null;

        const total = reviews.length;
        const avg = (key) => reviews.reduce((sum, r) => sum + (r[key] || 0), 0) / total;

        return {
            total,
            avgInterest: parseFloat(avg('interest').toFixed(1)),
            avgDifficulty: parseFloat(avg('difficulty').toFixed(1)),
            avgWorkload: parseFloat(avg('workload').toFixed(1)), // FIXED: Capital W
            avgTeachingQuality: parseFloat(avg('teachingQuality').toFixed(1)),
            avgRecommendation: parseFloat(avg('recommendation').toFixed(1)), // Added missing field
            overallRating: parseFloat((
                (avg('interest') + avg('teachingQuality') + avg('workload')) / 3
            ).toFixed(1))
        };
    }, [reviews]);

    const getFilteredReviews = () => {
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
    };

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