import React, { createContext, useContext, useState, useCallback } from "react";

const CourseDataContext = createContext();

export const CourseDataProvider = ({ children }) => {
  // Initialize cache from localStorage
  const [courseCache, setCourseCache] = useState(() => {
    try {
      const saved = localStorage.getItem('courseCache');
      return saved ? new Map(JSON.parse(saved)) : new Map();
    } catch {
      return new Map();
    }
  });
  const [refreshTriggers, setRefreshTriggers] = useState(new Map());

  const updateCourseData = useCallback((courseId, updatedData) => {
    setCourseCache((prev) => {
      const newCache = new Map(prev);
      const existing = newCache.get(courseId) || {};
      newCache.set(courseId, { ...existing, ...updatedData });
      
      // Save to localStorage
      try {
        localStorage.setItem('courseCache', JSON.stringify(Array.from(newCache.entries())));
      } catch (error) {
        console.warn('Failed to save course cache to localStorage:', error);
      }
      
      return newCache;
    });
  }, []);

  const triggerCourseRefresh = useCallback((courseId) => {
    setRefreshTriggers((prev) => {
      const newTriggers = new Map(prev);
      newTriggers.set(courseId, Date.now());
      return newTriggers;
    });
  }, []);

  const getCourseData = useCallback(
    (courseId) => {
      return courseCache.get(courseId);
    },
    [courseCache]
  );

  const getRefreshTrigger = useCallback(
    (courseId) => {
      return refreshTriggers.get(courseId);
    },
    [refreshTriggers]
  );

  const fetchCourseStats = useCallback(
    async (courseId, token) => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/reviews/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const reviews = await res.json();
          const total = reviews.length;
          const avgRecommendation =
            total > 0
              ? reviews.reduce((sum, r) => sum + (r.recommendation || 0), 0) /
                total
              : null;

          updateCourseData(courseId, {
            stats: {
              total,
              avgRecommendation:
                avgRecommendation !== null
                  ? Number(avgRecommendation.toFixed(1))
                  : null,
            },
          });
          triggerCourseRefresh(courseId);
        }
      } catch (err) {
        console.error("Failed to fetch course stats:", err);
      }
    },
    [updateCourseData, triggerCourseRefresh]
  );

  return (
    <CourseDataContext.Provider
      value={{
        updateCourseData,
        triggerCourseRefresh,
        getCourseData,
        getRefreshTrigger,
        fetchCourseStats,
      }}
    >
      {children}
    </CourseDataContext.Provider>
  );
};

export const useCourseDataContext = () => {
  const context = useContext(CourseDataContext);
  if (!context) {
    throw new Error(
      "useCourseDataContext must be used within a CourseDataProvider"
    );
  }
  return context;
};
