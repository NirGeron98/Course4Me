import { useState, useEffect } from 'react';

export const useCourseData = (courseId, token) => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('שגיאה בטעינת הקורס');
                }

                const data = await response.json();
                setCourse(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && token) {
            fetchCourse();
        }
    }, [courseId, token]);

    return { course, loading, error };
};