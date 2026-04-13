import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

const CourseDataContext = createContext();

// Name of the DOM event used to broadcast a course mutation across pages.
// Any component can `window.addEventListener(COURSE_MUTATED_EVENT, handler)`
// to invalidate its local state when a review is created/updated/deleted.
export const COURSE_MUTATED_EVENT = "courseMutated";

// Safe localStorage read — guarded for SSR / disabled-storage environments.
const readUserIdFromStorage = () => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("userId");
  } catch {
    return null;
  }
};

export const CourseDataProvider = ({ children }) => {
  const [courseCache, setCourseCache] = useState(() => {
    try {
      const saved = localStorage.getItem("courseCache");
      return saved ? new Map(JSON.parse(saved)) : new Map();
    } catch {
      return new Map();
    }
  });
  const [refreshTriggers, setRefreshTriggers] = useState(new Map());

  // Track the currently-authenticated user. When this transitions to `null`
  // we treat it as a logout and wipe every in-memory cache so the next
  // signed-in user never inherits stale course data from the previous one.
  const [currentUserId, setCurrentUserId] = useState(() => readUserIdFromStorage());

  // Keep `currentUserId` in sync with localStorage. Same-tab logouts
  // don't fire a `storage` event, so we also listen for a custom
  // `userLoggedOut` event (optionally dispatched by the auth flow) and
  // re-check on window focus as a safety net.
  useEffect(() => {
    const syncUserId = () => {
      const next = readUserIdFromStorage();
      setCurrentUserId((prev) => (prev === next ? prev : next));
    };

    const handleStorage = (event) => {
      // Cross-tab: react to removal/update of the auth keys.
      if (!event.key || event.key === "userId" || event.key === "token") {
        syncUserId();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("userLoggedOut", syncUserId);
    window.addEventListener("focus", syncUserId);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userLoggedOut", syncUserId);
      window.removeEventListener("focus", syncUserId);
    };
  }, []);

  // When the user context becomes null (logout), reset every in-memory
  // structure and drop the persisted course cache. This is the single
  // source of truth for "forget everything about courses".
  useEffect(() => {
    if (currentUserId !== null) return;

    setCourseCache((prev) => (prev.size === 0 ? prev : new Map()));
    setRefreshTriggers((prev) => (prev.size === 0 ? prev : new Map()));

    try {
      localStorage.removeItem("courseCache");
    } catch (error) {
      console.warn("Failed to clear persisted courseCache on logout:", error);
    }
  }, [currentUserId]);

  const updateCourseData = useCallback((courseId, updatedData) => {
    setCourseCache((prev) => {
      const newCache = new Map(prev);
      const existing = newCache.get(courseId) || {};
      newCache.set(courseId, { ...existing, ...updatedData });

      // Persist to localStorage so the cache survives a hard reload.
      try {
        localStorage.setItem(
          "courseCache",
          JSON.stringify(Array.from(newCache.entries()))
        );
      } catch (error) {
        console.warn("Failed to save course cache to localStorage:", error);
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

  // Invalidates the local entry for a given course and broadcasts a
  // `courseMutated` CustomEvent so that other pages currently mounted
  // (Dashboard, TrackedCourses, search results, ...) can refetch or
  // drop their stale copy of the course. Safe to call from any mutation
  // success path (review create/update/delete, follow/unfollow, etc.).
  const broadcastCourseMutation = useCallback(
    (courseId) => {
      if (!courseId) return;

      // Drop the cached entry for this course so the next read is fresh.
      setCourseCache((prev) => {
        if (!prev.has(courseId)) return prev;
        const newCache = new Map(prev);
        newCache.delete(courseId);
        try {
          localStorage.setItem(
            "courseCache",
            JSON.stringify(Array.from(newCache.entries()))
          );
        } catch (error) {
          console.warn("Failed to persist course cache after invalidation:", error);
        }
        return newCache;
      });

      // Bump the refresh trigger for any consumer keyed on a specific course.
      triggerCourseRefresh(courseId);

      // Notify cross-page subscribers via a DOM CustomEvent.
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(
            new CustomEvent(COURSE_MUTATED_EVENT, { detail: { courseId } })
          );
        } catch (error) {
          console.warn("Failed to dispatch courseMutated event:", error);
        }
      }
    },
    [triggerCourseRefresh]
  );

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

  // Memoize context value to avoid unnecessary re-renders of all consumers.
  const value = useMemo(
    () => ({
      updateCourseData,
      triggerCourseRefresh,
      broadcastCourseMutation,
      getCourseData,
      getRefreshTrigger,
      fetchCourseStats,
    }),
    [
      updateCourseData,
      triggerCourseRefresh,
      broadcastCourseMutation,
      getCourseData,
      getRefreshTrigger,
      fetchCourseStats,
    ]
  );

  return (
    <CourseDataContext.Provider value={value}>
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
