import { useEffect } from "react";
import { apiFetch, useApi } from "./useApi";
import {
  COURSE_MUTATED_EVENT,
  useCourseDataContext,
} from "../contexts/CourseDataContext";

// Single-course data hook: loads the course document and its reviews in parallel,
// writes both into the shared CourseDataContext cache, and automatically refetches
// when another page broadcasts a mutation for the same course id.
export const useCourse = (courseId) => {
  const { updateCourseData, getCourseData } = useCourseDataContext();

  const { data, loading, error, refetch } = useApi(
    async ({ signal }) => {
      if (!courseId) return null;
      const [course, reviews] = await Promise.all([
        apiFetch(`/api/courses/${courseId}`, { signal, auth: false }),
        apiFetch(`/api/reviews/course/${courseId}`, { signal }).catch(() => []),
      ]);
      const payload = { course, reviews: Array.isArray(reviews) ? reviews : [] };
      updateCourseData(courseId, payload);
      return payload;
    },
    [courseId, updateCourseData]
  );

  // Subscribe to the cross-page mutation broadcast from Phase 1.
  useEffect(() => {
    if (!courseId) return undefined;
    const handler = (event) => {
      if (event?.detail?.courseId === courseId) refetch();
    };
    window.addEventListener(COURSE_MUTATED_EVENT, handler);
    return () => window.removeEventListener(COURSE_MUTATED_EVENT, handler);
  }, [courseId, refetch]);

  const cached = courseId ? getCourseData(courseId) : null;

  return {
    course: data?.course || cached?.course || null,
    reviews: data?.reviews || cached?.reviews || [],
    loading,
    error,
    refetch,
  };
};
