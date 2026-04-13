import { useMemo } from "react";
import { apiFetch, useApi } from "./useApi";
import { useCourseDataContext } from "../contexts/CourseDataContext";

// Hook for the global courses list. Fetches `/api/courses` once on mount,
// warms the per-course cache in CourseDataContext so detail pages avoid a
// second round-trip, and exposes an in-memory filtered view.
export const useCourses = ({ filters = {} } = {}) => {
  const { updateCourseData } = useCourseDataContext();

  const { data, loading, error, refetch } = useApi(
    async ({ signal }) => {
      const courses = await apiFetch("/api/courses", { signal, auth: false });
      if (Array.isArray(courses)) {
        courses.forEach((course) => {
          if (course?._id) updateCourseData(course._id, { course });
        });
      }
      return Array.isArray(courses) ? courses : [];
    },
    [updateCourseData]
  );

  const filtered = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const { search, department, minRating } = filters || {};
    if (!search && !department && !minRating) return list;

    const query = search ? search.toLowerCase() : null;
    return list.filter((course) => {
      if (query) {
        const haystack = [
          course.title,
          course.courseNumber,
          course.department,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (department && course.department !== department) return false;
      if (minRating && (course.averageRating || 0) < minRating) return false;
      return true;
    });
  }, [data, filters]);

  return {
    courses: Array.isArray(data) ? data : [],
    filtered,
    loading,
    error,
    refetch,
  };
};
