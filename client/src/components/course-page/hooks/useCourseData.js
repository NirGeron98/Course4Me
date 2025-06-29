import { useState, useEffect } from 'react';

export const useCourseData = (courseId, token) => {
    const [course, setCourse] = useState(null);
    const [stats, setStats] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseAndStats = async () => {
            try {
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
                setCourse(courseData);

                // Fetch recommendation stats
                const statsRes = await fetch(`${baseUrl}/api/reviews/stats/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!statsRes.ok) {
                    throw new Error('שגיאה בטעינת סטטיסטיקות הקורס');
                }

                const statsData = await statsRes.json();
                setStats(statsData);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && token) {
            fetchCourseAndStats();
        }
    }, [courseId, token]);

    return { course, stats, loading, error };
};
