import { useState, useEffect, useCallback } from 'react';
import { useCourseDataContext } from '../contexts/CourseDataContext';

export const useCourseDataWithSync = (courseId, token) => {
    const [course, setCourse] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { updateCourseData, getCourseData, getRefreshTrigger } = useCourseDataContext();
    const refreshTrigger = getRefreshTrigger(courseId);

    const fetchCourseAndStats = useCallback(async () => {
        if (!courseId || !token) return;
        
        try {
            setLoading(true);
            const baseUrl = process.env.REACT_APP_API_BASE_URL;

            // Fetch course details
            const courseRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!courseRes.ok) {
                throw new Error('שגיאה בטעינת הקורס');
            }

            const courseData = await courseRes.json();

            // Fetch reviews and calculate stats
            const reviewsRes = await fetch(`${baseUrl}/api/reviews/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            let calculatedStats = null;
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                
                // Calculate stats from reviews
                if (reviewsData.length > 0) {
                    const total = reviewsData.length;
                    const avg = (key) => reviewsData.reduce((sum, r) => sum + (r[key] || 0), 0) / total;
                    
                    calculatedStats = {
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
                }
            }

            // Update course data with calculated rating
            const updatedCourseData = {
                ...courseData,
                averageRating: calculatedStats?.overallRating || null,
                ratingsCount: calculatedStats?.total || 0
            };

            setCourse(updatedCourseData);
            setStats(calculatedStats);

            // Update global cache
            updateCourseData(courseId, {
                course: updatedCourseData,
                stats: calculatedStats,
                lastUpdated: Date.now()
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [courseId, token, updateCourseData]);

    // Initial fetch and refresh on trigger
    useEffect(() => {
        fetchCourseAndStats();
    }, [fetchCourseAndStats, refreshTrigger]);

    // Try to get cached data first
    useEffect(() => {
        const cachedData = getCourseData(courseId);
        if (cachedData && cachedData.course) {
            setCourse(cachedData.course);
            setStats(cachedData.stats);
            setLoading(false);
        }
    }, [courseId, getCourseData]);

    return { 
        course, 
        stats, 
        loading, 
        error, 
        refetch: fetchCourseAndStats 
    };
};