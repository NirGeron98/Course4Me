import { useCallback, useEffect } from "react";
import { apiFetch, useApi } from "./useApi";

// Event names used by the existing cross-page sync layer (Dashboard, modals, etc.).
// The hook both emits and listens on these so every consumer stays in sync.
const TRACKED_ADDED_EVENT = "trackedCourseAdded";
const TRACKED_REMOVED_EVENT = "trackedCourseRemoved";

// Tracked courses hook: list + track/untrack mutations. Listens to the shared
// `trackedCourseAdded` / `trackedCourseRemoved` events so a mutation triggered
// anywhere in the app propagates to every mounted consumer.
export const useTrackedCourses = () => {
  const { data, loading, error, refetch, setData } = useApi(
    ({ signal }) => apiFetch("/api/tracked-courses", { signal }),
    []
  );

  // Refetch whenever another component fires a tracked-course change event.
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener(TRACKED_ADDED_EVENT, handler);
    window.addEventListener(TRACKED_REMOVED_EVENT, handler);
    return () => {
      window.removeEventListener(TRACKED_ADDED_EVENT, handler);
      window.removeEventListener(TRACKED_REMOVED_EVENT, handler);
    };
  }, [refetch]);

  const track = useCallback(
    async (courseId) => {
      const created = await apiFetch("/api/tracked-courses", {
        method: "POST",
        body: { course: courseId },
      });
      setData((prev) =>
        Array.isArray(prev) ? [...prev, created] : [created]
      );
      window.dispatchEvent(
        new CustomEvent(TRACKED_ADDED_EVENT, { detail: { courseId } })
      );
      return created;
    },
    [setData]
  );

  const untrack = useCallback(
    async (trackedId) => {
      await apiFetch(`/api/tracked-courses/${trackedId}`, { method: "DELETE" });
      setData((prev) =>
        Array.isArray(prev) ? prev.filter((t) => t._id !== trackedId) : []
      );
      window.dispatchEvent(
        new CustomEvent(TRACKED_REMOVED_EVENT, { detail: { trackedId } })
      );
    },
    [setData]
  );

  return {
    trackedCourses: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
    track,
    untrack,
  };
};
