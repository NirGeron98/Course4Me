import { useState, useEffect, useCallback, useRef } from "react";
import {
  useCourseDataContext,
  COURSE_MUTATED_EVENT,
} from "../contexts/CourseDataContext";

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
  const lastFetchedIdentifierRef = useRef(null);

  const fetchCourse = useCallback(async () => {
    if (!identifier) return;

    setLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;

      const courseEndpoint =
        identifierType === "courseNumber"
          ? `${baseUrl}/api/courses/by-number/${identifier}`
          : `${baseUrl}/api/courses/${identifier}`;

      const courseRes = await fetch(courseEndpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
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
  }, [identifier, identifierType, updateCourseData, token]);

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

    // Only fetch when identifier/type changed; avoid re-fetch when getCourseData
    // changes (e.g. after we wrote to cache), which would cause infinite loop.
    const identifierKey = `${identifierType}:${identifier ?? ""}`;
    const sameTarget = lastFetchedIdentifierRef.current === identifierKey;
    if (!hasLoadedFromCache && !sameTarget) {
      lastFetchedIdentifierRef.current = identifierKey;
      fetchCourse();
    }
  }, [identifier, identifierType, fetchCourse, getCourseData]);

  // Re-fetch on refresh trigger
  const refreshTrigger = getRefreshTrigger(courseId);
  useEffect(() => {
    if (refreshTrigger && courseId) {
      fetchCourse();
    }
  }, [refreshTrigger, courseId, fetchCourse]);

  // Cross-page invalidation: when any part of the app broadcasts a
  // `courseMutated` event for the course we are currently showing, drop
  // the local state and force a fresh fetch. Closes the sync gap where
  // a CoursePage remained stale after a review submit in another tab
  // or a modal sibling component.
  useEffect(() => {
    const handleCourseMutated = (event) => {
      const mutatedId = event?.detail?.courseId;
      if (!mutatedId || !courseId) return;
      if (String(mutatedId) !== String(courseId)) return;

      // Invalidate local state so the next render shows fresh data.
      setStats(null);
      // Reset the de-dupe ref so `fetchCourse` is allowed to re-run
      // even though the identifier hasn't changed.
      lastFetchedIdentifierRef.current = null;
      fetchCourse();
    };

    window.addEventListener(COURSE_MUTATED_EVENT, handleCourseMutated);
    return () => {
      window.removeEventListener(COURSE_MUTATED_EVENT, handleCourseMutated);
    };
  }, [courseId, fetchCourse]);

  return {
    course,
    stats,
    loading,
    error,
    refetch: fetchCourse,
  };
};
