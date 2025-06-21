import { useState, useEffect } from 'react';

export const useReviews = (courseId, token) => {
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [filterRating, setFilterRating] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/reviews/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('שגיאה בטעינת הביקורות');
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

        if (courseId && token) {
            fetchReviews();
        }
    }, [courseId, token]);

    // Calculate statistics
    const calculateStats = () => {
        if (!reviews.length) return null;

        const total = reviews.length;
        const avgInterest = reviews.reduce((sum, r) => sum + r.interest, 0) / total;
        const avgDifficulty = reviews.reduce((sum, r) => sum + r.difficulty, 0) / total;
        const avgWorkload = reviews.reduce((sum, r) => sum + r.workload, 0) / total;
        const avgInvestment = reviews.reduce((sum, r) => sum + r.investment, 0) / total;
        const avgTeachingQuality = reviews.reduce((sum, r) => sum + r.teachingQuality, 0) / total;

        return {
            total,
            avgInterest: avgInterest.toFixed(1),
            avgDifficulty: avgDifficulty.toFixed(1),
            avgWorkload: avgWorkload.toFixed(1),
            avgInvestment: avgInvestment.toFixed(1),
            avgTeachingQuality: avgTeachingQuality.toFixed(1),
            overallRating: ((avgInterest + avgTeachingQuality + avgInvestment) / 3).toFixed(1)
        };
    };

    // Filter and sort reviews
    const getFilteredReviews = () => {
        let filtered = [...reviews];

        // Filter by rating
        if (filterRating !== 'all') {
            const minRating = parseInt(filterRating);
            filtered = filtered.filter(review => {
                const avgRating = (review.interest + review.teachingQuality + review.investment) / 3;
                return Math.floor(avgRating) + 1 === minRating;
            });
        }

        // Sort reviews
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'highest':
                    const avgA = (a.interest + a.teachingQuality + a.investment) / 3;
                    const avgB = (b.interest + b.teachingQuality + b.investment) / 3;
                    return avgB - avgA;
                case 'lowest':
                    const avgA2 = (a.interest + a.teachingQuality + a.investment) / 3;
                    const avgB2 = (b.interest + b.teachingQuality + b.investment) / 3;
                    return avgA2 - avgB2;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const addReview = (newReview) => {
        setReviews([newReview, ...reviews]);
        setShowReviewForm(false);
    };

    const stats = calculateStats();
    const filteredReviews = getFilteredReviews();

    return {
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
    };
};