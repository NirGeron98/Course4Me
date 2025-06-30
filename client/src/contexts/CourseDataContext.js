import React, { createContext, useContext, useState, useCallback } from 'react';

const CourseDataContext = createContext();

export const CourseDataProvider = ({ children }) => {
    const [courseCache, setCourseCache] = useState(new Map());
    const [refreshTriggers, setRefreshTriggers] = useState(new Map());

    const updateCourseData = useCallback((courseId, updatedData) => {
        setCourseCache(prev => {
            const newCache = new Map(prev);
            const existing = newCache.get(courseId) || {};
            newCache.set(courseId, { ...existing, ...updatedData });
            return newCache;
        });
    }, []);

    const triggerCourseRefresh = useCallback((courseId) => {
        setRefreshTriggers(prev => {
            const newTriggers = new Map(prev);
            newTriggers.set(courseId, Date.now());
            return newTriggers;
        });
    }, []);

    const getCourseData = useCallback((courseId) => {
        return courseCache.get(courseId);
    }, [courseCache]);

    const getRefreshTrigger = useCallback((courseId) => {
        return refreshTriggers.get(courseId);
    }, [refreshTriggers]);

    return (
        <CourseDataContext.Provider value={{
            updateCourseData,
            triggerCourseRefresh,
            getCourseData,
            getRefreshTrigger
        }}>
            {children}
        </CourseDataContext.Provider>
    );
};

export const useCourseDataContext = () => {
    const context = useContext(CourseDataContext);
    if (!context) {
        throw new Error('useCourseDataContext must be used within a CourseDataProvider');
    }
    return context;
};