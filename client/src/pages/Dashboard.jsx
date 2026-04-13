import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseDetailsModal from "../components/tracked-courses/CourseDetailsModal";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import TrackedCoursesList from "../components/dashboard/TrackedCoursesList";
import CourseCarousel from "../components/dashboard/CourseCarousel";
import LecturerCarousel from "../components/dashboard/LecturerCarousel";
import ElegantLoadingSpinner, {
  ElegantSecondaryLoading,
} from "../components/common/ElegantLoadingSpinner";
import StatsCards from "../components/dashboard/StatsCards";
import { apiFetch, useApi } from "../hooks/useApi";
import { useCourses } from "../hooks/useCourses";
import { useTrackedCourses } from "../hooks/useTrackedCourses";
import { useContactRequests } from "../hooks/useContactRequests";
import { useMyReviews } from "../hooks/useMyReviews";
import { COURSE_MUTATED_EVENT } from "../contexts/CourseDataContext";

// Dashboard page. All data fetching is delegated to hooks under /hooks, so this
// file only orchestrates UI state (carousels, modal, title) and composition.
const Dashboard = () => {
  const navigate = useNavigate();

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const userFullName =
    typeof window !== "undefined"
      ? localStorage.getItem("userFullName") || "User"
      : "User";

  // Feature hooks — one call per logical resource.
  const {
    courses: allCourses,
    loading: coursesLoading,
    refetch: refetchCourses,
  } = useCourses();

  const {
    trackedCourses,
    loading: trackedCoursesLoading,
    refetch: refetchTrackedCourses,
  } = useTrackedCourses();

  const {
    requests: contactRequests,
    loading: contactRequestsLoading,
    refetch: refetchContactRequests,
  } = useContactRequests();

  const {
    reviews: myReviews,
    loading: reviewsLoading,
    refetch: refetchReviews,
  } = useMyReviews(userId);

  // Inline one-off resources (lecturers + tracked lecturers) via the base useApi hook.
  // Kept inline instead of a dedicated feature hook because they're only read here.
  const {
    data: lecturersData,
    loading: lecturersLoading,
    refetch: refetchLecturers,
  } = useApi(
    ({ signal }) => apiFetch("/api/lecturers", { signal }),
    []
  );
  const lecturers = useMemo(
    () => (Array.isArray(lecturersData) ? lecturersData : []),
    [lecturersData]
  );

  const {
    data: trackedLecturersData,
    loading: trackedLecturersLoading,
    refetch: refetchTrackedLecturers,
  } = useApi(
    ({ signal }) => apiFetch("/api/tracked-lecturers", { signal }),
    []
  );
  const trackedLecturers = useMemo(
    () => (Array.isArray(trackedLecturersData) ? trackedLecturersData : []),
    [trackedLecturersData]
  );

  // Aggregated dashboard stats derived from hook state. No fetching here.
  const stats = useMemo(
    () => ({
      coursesCount: trackedCourses.length,
      reviewsCount: myReviews.length,
      contactRequestsCount: contactRequests.length,
    }),
    [trackedCourses.length, myReviews.length, contactRequests.length]
  );

  const isLoading =
    coursesLoading ||
    trackedCoursesLoading ||
    lecturersLoading ||
    trackedLecturersLoading ||
    contactRequestsLoading ||
    reviewsLoading;

  // UI-only state.
  const [isSecondaryLoading, setIsSecondaryLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseCarouselIndex, setCourseCarouselIndex] = useState(0);
  const [lecturerCarouselIndex, setLecturerCarouselIndex] = useState(0);
  const [trackedCarouselIndex, setTrackedCarouselIndex] = useState(0);

  // Expose a global refresh hook so legacy code (review modals, etc.) can force a
  // reload of every dashboard resource. Kept for backward compatibility.
  const refreshAll = useCallback(async () => {
    setIsSecondaryLoading(true);
    try {
      await Promise.all([
        refetchCourses(),
        refetchTrackedCourses(),
        refetchLecturers(),
        refetchTrackedLecturers(),
        refetchContactRequests(),
        refetchReviews(),
      ]);
    } finally {
      setIsSecondaryLoading(false);
    }
  }, [
    refetchCourses,
    refetchTrackedCourses,
    refetchLecturers,
    refetchTrackedLecturers,
    refetchContactRequests,
    refetchReviews,
  ]);

  useEffect(() => {
    window.refreshDashboardData = refreshAll;
    return () => {
      delete window.refreshDashboardData;
    };
  }, [refreshAll]);

  // Legacy cross-tab events for tracked lecturers — tracked courses already
  // auto-refresh via useTrackedCourses' own listeners.
  useEffect(() => {
    const handleTrackedLecturerChange = () => refetchTrackedLecturers();
    const handleStorage = (event) => {
      if (event.key === "trackedLecturerChanged") refetchTrackedLecturers();
    };
    window.addEventListener("trackedLecturerAdded", handleTrackedLecturerChange);
    window.addEventListener("trackedLecturerRemoved", handleTrackedLecturerChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("trackedLecturerAdded", handleTrackedLecturerChange);
      window.removeEventListener("trackedLecturerRemoved", handleTrackedLecturerChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refetchTrackedLecturers]);

  // Global `courseMutated` broadcast — fired by any review/follow/unfollow
  // mutation via `CourseDataContext.broadcastCourseMutation`. When it fires
  // we refresh the dashboard slices that surface course aggregates so the
  // carousels, tracked list and review counters all stay in sync without
  // a manual reload.
  useEffect(() => {
    const handleCourseMutated = () => {
      refetchCourses();
      refetchTrackedCourses();
      refetchReviews();
    };
    window.addEventListener(COURSE_MUTATED_EVENT, handleCourseMutated);
    return () => {
      window.removeEventListener(COURSE_MUTATED_EVENT, handleCourseMutated);
    };
  }, [refetchCourses, refetchTrackedCourses, refetchReviews]);

  useEffect(() => {
    document.title = "דף הבית - Course4Me";
    return () => {
      document.title = "Course4Me";
    };
  }, []);

  // Carousel auto-scroll — UI behavior, not data fetching.
  useEffect(() => {
    if (allCourses.length <= 3) return undefined;
    const interval = setInterval(() => {
      setCourseCarouselIndex((prev) =>
        prev >= allCourses.length - 3 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [allCourses.length]);

  useEffect(() => {
    if (lecturers.length <= 3) return undefined;
    const interval = setInterval(() => {
      setLecturerCarouselIndex((prev) =>
        prev >= lecturers.length - 3 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [lecturers.length]);

  // Presentation helpers.
  const formatLecturersDisplay = (list, max = 3, badgeClassName = "bg-blue-200 text-blue-800") => {
    if (!Array.isArray(list) || list.length === 0) return "לא זמין";
    const names = list
      .map((l) => (typeof l === "string" ? l : l?.name || ""))
      .filter(Boolean);
    const displayed = names.slice(0, max).join(", ");
    const remaining = names.length - max;
    return (
      <span className="flex items-center gap-2 flex-wrap">
        <span>{displayed}</span>
        {remaining > 0 && (
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeClassName}`}
          >
            +{remaining} מרצים נוספים
          </span>
        )}
      </span>
    );
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleTrackedCourseClick = (trackedCourse) => {
    const course = trackedCourse?.course;
    if (course) handleCourseClick(course);
  };

  const handleCourseCarouselPrev = () =>
    setCourseCarouselIndex((prev) =>
      prev <= 0 ? Math.max(0, allCourses.length - 3) : prev - 1
    );
  const handleCourseCarouselNext = () =>
    setCourseCarouselIndex((prev) =>
      prev >= allCourses.length - 3 ? 0 : prev + 1
    );
  const handleLecturerCarouselPrev = () =>
    setLecturerCarouselIndex((prev) =>
      prev <= 0 ? Math.max(0, lecturers.length - 3) : prev - 1
    );
  const handleLecturerCarouselNext = () =>
    setLecturerCarouselIndex((prev) =>
      prev >= lecturers.length - 3 ? 0 : prev + 1
    );
  const handleTrackedPrev = () =>
    setTrackedCarouselIndex((prev) =>
      prev <= 0 ? Math.max(0, trackedCourses.length - 3) : prev - 1
    );
  const handleTrackedNext = () =>
    setTrackedCarouselIndex((prev) =>
      prev >= trackedCourses.length - 3 ? 0 : prev + 1
    );

  const visibleCourses = allCourses.slice(
    courseCarouselIndex,
    courseCarouselIndex + 3
  );
  const visibleLecturers = lecturers.slice(
    lecturerCarouselIndex,
    lecturerCarouselIndex + 3
  );
  const visibleTrackedCourses = trackedCourses.slice(
    trackedCarouselIndex,
    trackedCarouselIndex + 3
  );

  if (isLoading) {
    return <ElegantLoadingSpinner message="טוען נתונים" />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50"
      dir="rtl"
    >
      {isSecondaryLoading && (
        <ElegantSecondaryLoading message="מרענן נתונים..." />
      )}
      <WelcomeHeader userName={userFullName} />

      <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-5 sm:space-y-8">
        <StatsCards
          coursesCount={stats.coursesCount}
          trackedLecturersCount={
            trackedLecturers.filter(({ lecturer }) => lecturer).length
          }
          contactRequestsCount={stats.contactRequestsCount}
          refreshData={refreshAll}
          isLoadedFromCache={false}
          allCoursesCount={allCourses.length}
          lecturersCount={lecturers.length}
        />
        <TrackedCoursesList
          trackedCourses={trackedCourses}
          visibleCourses={visibleTrackedCourses}
          carouselIndex={trackedCarouselIndex}
          setCarouselIndex={setTrackedCarouselIndex}
          onPrev={handleTrackedPrev}
          onNext={handleTrackedNext}
          onCourseClick={handleTrackedCourseClick}
          formatLecturersDisplay={formatLecturersDisplay}
          emptyActionLabel="עבור לקורסים שלי"
          onEmptyAction={() => navigate("/tracked-courses")}
        />

        <CourseCarousel
          courses={allCourses}
          visibleCourses={visibleCourses}
          carouselIndex={courseCarouselIndex}
          onPrev={handleCourseCarouselPrev}
          onNext={handleCourseCarouselNext}
          onCourseClick={handleCourseClick}
          formatLecturersDisplay={formatLecturersDisplay}
          setCarouselIndex={setCourseCarouselIndex}
        />
        <LecturerCarousel
          lecturers={lecturers}
          visibleLecturers={visibleLecturers}
          carouselIndex={lecturerCarouselIndex}
          onPrev={handleLecturerCarouselPrev}
          onNext={handleLecturerCarouselNext}
          setCarouselIndex={setLecturerCarouselIndex}
        />
      </div>
      {isModalOpen && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
