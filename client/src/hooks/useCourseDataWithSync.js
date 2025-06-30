import { useState, useEffect, useCallback } from "react";
import { useCourseDataContext } from "../contexts/CourseDataContext";

export const useCourseDataWithSync = (
  identifier,
  token,
  identifierType = "id"
) => {
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseId, setCourseId] = useState(null);

  const { updateCourseData, getCourseData, getRefreshTrigger } =
    useCourseDataContext();

  const fetchCourse = useCallback(async () => {
    if (!identifier || !token) return;

    setLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;

      const courseEndpoint =
        identifierType === "courseNumber"
          ? `${baseUrl}/api/courses/by-number/${identifier}`
          : `${baseUrl}/api/courses/${identifier}`;

      const courseRes = await fetch(courseEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!courseRes.ok) throw new Error("Failed to load course");

      const courseData = await courseRes.json();
      setCourse(courseData);
      setStats(null);
      setCourseId(courseData._id);

      updateCourseData(courseData._id, {
        course: courseData,
        stats: null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [identifier, token, identifierType, updateCourseData]);

  // Load from cache first if available (only if identifierType is "id")
  useEffect(() => {
    let hasLoadedFromCache = false;

    if (identifier && identifierType === "id") {
      const cached = getCourseData(identifier);
      if (cached?.course) {
        setCourse(cached.course);
        setStats(cached.stats);
        setCourseId(identifier);
        setLoading(false);
        hasLoadedFromCache = true;
      }
    }

    if (!hasLoadedFromCache) {
      fetchCourse();
    }
  }, [identifier, identifierType, fetchCourse]);

  // Re-fetch on refresh trigger
  const refreshTrigger = getRefreshTrigger(courseId);
  useEffect(() => {
    if (refreshTrigger && courseId) {
      fetchCourse();
    }
  }, [refreshTrigger, courseId, fetchCourse]);

  return {
    course,
    stats,
    loading,
    error,
    refetch: fetchCourse,
  };
};
