import { useState, useEffect, useCallback } from 'react';
import { useCourseDataContext } from '../contexts/CourseDataContext';

export const useCourseDataWithSync = (identifier, token, identifierType = 'id') => {
    const [course, setCourse] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseId, setCourseId] = useState(null); // Track course ID separately
    
    const { updateCourseData, getCourseData, getRefreshTrigger } = useCourseDataContext();

    const fetchCourseAndStats = useCallback(async () => {
        if (!identifier || !token) return;
        
        try {
            setLoading(true);
            const baseUrl = process.env.REACT_APP_API_BASE_URL;

            // Choose endpoint based on identifier type
            let courseEndpoint;
            if (identifierType === 'courseNumber') {
                courseEndpoint = `${baseUrl}/api/courses/by-number/${identifier}`;
            } else {
                courseEndpoint = `${baseUrl}/api/courses/${identifier}`;
            }

            const courseRes = await fetch(courseEndpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!courseRes.ok) {
                throw new Error('שגיאה בטעינת הקורס');
            }

            const courseData = await courseRes.json();

            // Use the actual course ID for reviews
            const reviewsRes = await fetch(`${baseUrl}/api/reviews/course/${courseData._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            let calculatedStats = null;
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                
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

            const updatedCourseData = {
                ...courseData,
                averageRating: calculatedStats?.overallRating || null,
                ratingsCount: calculatedStats?.total || 0
            };

            setCourse(updatedCourseData);
            setStats(calculatedStats);
            setCourseId(courseData._id); // Set course ID separately

            // Update global cache using course ID
            updateCourseData(courseData._id, {
                course: updatedCourseData,
                stats: calculatedStats,
                lastUpdated: Date.now()
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [identifier, token, identifierType, updateCourseData]);

    // Try to get cached data first (only when component mounts)
    useEffect(() => {
        if (identifier && identifierType === 'id') {
            // If we have an ID, try cache first
            const cachedData = getCourseData(identifier);
            if (cachedData && cachedData.course) {
                setCourse(cachedData.course);
                setStats(cachedData.stats);
                setCourseId(identifier);
                setLoading(false);
                return; // Don't fetch if we have cached data
            }
        }
        
        // If no cached data or using courseNumber, fetch fresh
        fetchCourseAndStats();
    }, [identifier, identifierType]); // Removed getCourseData to prevent re-runs

    // Get refresh trigger for the course ID (only after we have it)
    const refreshTrigger = getRefreshTrigger(courseId);

    // Only refetch when refresh is triggered
    useEffect(() => {
        if (refreshTrigger && courseId) {
            fetchCourseAndStats();
        }
    }, [refreshTrigger, courseId, fetchCourseAndStats]);

    // Update from cache when refresh trigger changes
    useEffect(() => {
        if (courseId && refreshTrigger) {
            const cachedData = getCourseData(courseId);
            if (cachedData && cachedData.course && cachedData.lastUpdated > Date.now() - 1000) {
                // Only use very recent cache updates (within 1 second)
                setCourse(cachedData.course);
                setStats(cachedData.stats);
            }
        }
    }, [refreshTrigger, courseId, getCourseData]);

    return { 
        course, 
        stats, 
        loading, 
        error, 
        refetch: fetchCourseAndStats 
    };
};