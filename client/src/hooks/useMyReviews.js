import { useCallback, useEffect } from "react";
import { apiFetch, useApi } from "./useApi";
import {
  COURSE_MUTATED_EVENT,
  useCourseDataContext,
} from "../contexts/CourseDataContext";

// Tag reviews so the UI can distinguish course reviews from lecturer reviews
// after merging both lists into a single collection.
const tagReviews = (list, reviewType) =>
  (Array.isArray(list) ? list : []).map((review) => ({ ...review, reviewType }));

// Loads the current user's reviews across both review resources (course + lecturer).
// Integrates with Phase 1's broadcastCourseMutation so deleting a course review
// drops stale data on every other mounted page.
export const useMyReviews = (userId) => {
  const { broadcastCourseMutation } = useCourseDataContext();

  const { data, loading, error, refetch, setData } = useApi(
    async ({ signal }) => {
      if (!userId) return [];
      const [courseReviews, lecturerReviews] = await Promise.all([
        apiFetch("/api/reviews", { signal }).catch(() => []),
        apiFetch("/api/lecturer-reviews", { signal }).catch(() => []),
      ]);
      const mine = [
        ...tagReviews(
          (courseReviews || []).filter(
            (review) => review.user && review.user._id === userId
          ),
          "course"
        ),
        ...tagReviews(
          (lecturerReviews || []).filter(
            (review) => review.user && review.user._id === userId
          ),
          "lecturer"
        ),
      ];
      return mine;
    },
    [userId]
  );

  // Cross-page invalidation: if another tab/page broadcasts a mutation, refetch.
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener(COURSE_MUTATED_EVENT, handler);
    return () => window.removeEventListener(COURSE_MUTATED_EVENT, handler);
  }, [refetch]);

  const deleteReview = useCallback(
    async (review) => {
      if (!review?._id) return;
      const endpoint =
        review.reviewType === "course"
          ? `/api/reviews/${review._id}`
          : `/api/lecturer-reviews/${review._id}`;
      await apiFetch(endpoint, { method: "DELETE" });
      setData((prev) =>
        Array.isArray(prev) ? prev.filter((r) => r._id !== review._id) : []
      );
      if (review.reviewType === "course" && review.course?._id) {
        broadcastCourseMutation(review.course._id);
      }
    },
    [setData, broadcastCourseMutation]
  );

  const replaceReview = useCallback(
    (updated) => {
      if (!updated?._id) return;
      const reviewType =
        updated.reviewType || (updated.course ? "course" : "lecturer");
      const withType = { ...updated, reviewType };
      setData((prev) =>
        Array.isArray(prev)
          ? prev.map((r) => (r._id === updated._id ? withType : r))
          : [withType]
      );
      if (reviewType === "course" && updated.course?._id) {
        broadcastCourseMutation(updated.course._id);
      }
    },
    [setData, broadcastCourseMutation]
  );

  return {
    reviews: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
    deleteReview,
    replaceReview,
  };
};
