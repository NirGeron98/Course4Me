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

    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_API_BASE_URL;

      let courseEndpoint;
      if (identifierType === "courseNumber") {
        courseEndpoint = `${baseUrl}/api/courses/by-number/${identifier}`;
      } else {
        courseEndpoint = `${baseUrl}/api/courses/${identifier}`;
      }

      const courseRes = await fetch(courseEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!courseRes.ok) {
        throw new Error("Failed to load course");
      }

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

  useEffect(() => {
    if (identifier && identifierType === "id") {
      const cachedData = getCourseData(identifier);
      if (cachedData && cachedData.course) {
        setCourse(cachedData.course);
        setStats(cachedData.stats);
        setCourseId(identifier);
        setLoading(false);
        return;
      }
    }

    fetchCourse();
  }, [identifier, identifierType, fetchCourse, getCourseData]);

  const refreshTrigger = getRefreshTrigger(courseId);

  useEffect(() => {
    if (refreshTrigger && courseId) {
      fetchCourse();
    }
  }, [refreshTrigger, courseId, fetchCourse]);

  useEffect(() => {
    if (courseId && refreshTrigger) {
      const cachedData = getCourseData(courseId);
      if (
        cachedData &&
        cachedData.course &&
        cachedData.lastUpdated > Date.now() - 1000
      ) {
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
    refetch: fetchCourse,
  };
};
