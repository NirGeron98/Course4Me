import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./useApi";
import { useCourseDataContext } from "../contexts/CourseDataContext";

// useLecturerReviewForm — encapsulates all state, data, validation and
// submission logic for the lecturer review form. Presentational components
// should remain dumb and only read values / call handlers from this hook.
//
// Params:
//  - lecturerId: id of the reviewed lecturer
//  - user: auth user (used only for token fallback)
//  - existingReview: when provided, hook hydrates into edit mode
//  - onSubmitted: (review) => void, called after a successful save
//
// Returned shape:
//  { formData, setField, resetField, courses, loadingCourses,
//    submitting, error, isEdit, handleSubmit, courseOptions,
//    selectedCourseOptions, handleCoursesChange }

const RATING_FIELDS = [
  "clarity",
  "responsiveness",
  "availability",
  "organization",
  "knowledge",
];

const INITIAL_FORM = {
  courses: [],
  clarity: 3,
  responsiveness: 3,
  availability: 3,
  organization: 3,
  knowledge: 3,
  comment: "",
  isAnonymous: false,
};

const hydrateFromExisting = (existingReview) => {
  if (!existingReview) return INITIAL_FORM;
  let coursesArray = [];
  if (Array.isArray(existingReview.courses)) {
    coursesArray = existingReview.courses.map((c) => c?._id || c);
  } else if (existingReview.course) {
    coursesArray = [existingReview.course._id || existingReview.course];
  }
  return {
    courses: coursesArray,
    clarity: existingReview.clarity ?? 3,
    responsiveness: existingReview.responsiveness ?? 3,
    availability: existingReview.availability ?? 3,
    organization: existingReview.organization ?? 3,
    knowledge: existingReview.knowledge ?? 3,
    comment: existingReview.comment || "",
    isAnonymous: Boolean(existingReview.isAnonymous),
  };
};

// Refreshes the tracked-lecturers localStorage cache so other pages pick up
// the new review aggregate immediately. Preserves legacy cross-tab signals.
const syncTrackedLecturerCache = async (lecturerId, token) => {
  try {
    const updated = await apiFetch(`/api/lecturers/${lecturerId}`, { token });
    const cacheKey = "tracked_lecturers_data";
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const list = parsed?.trackedLecturers;
      if (Array.isArray(list)) {
        const idx = list.findIndex(
          (item) => item?.lecturer && item.lecturer._id === lecturerId
        );
        if (idx >= 0) {
          list[idx].lecturer = updated;
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ trackedLecturers: list, timestamp: Date.now() })
          );
          localStorage.setItem(
            "trackedLecturerChanged",
            JSON.stringify({
              lecturerId,
              action: "updated",
              timestamp: Date.now(),
              data: updated,
            })
          );
        }
      }
    }
  } catch (err) {
    console.error("Error updating tracked lecturers cache:", err);
  }
};

const useLecturerReviewForm = ({
  lecturerId,
  user,
  existingReview = null,
  onSubmitted,
}) => {
  const isEdit = Boolean(existingReview);
  const [formData, setFormData] = useState(() => hydrateFromExisting(existingReview));
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pull the course-mutation broadcaster from context so a lecturer
  // review submit invalidates every tagged course the same way a course
  // review submit would. This keeps the two review flows symmetric and
  // ensures Dashboard / TrackedCourses / CoursePage listeners react to
  // lecturer reviews too.
  const { broadcastCourseMutation } = useCourseDataContext();

  // Re-hydrate when parent swaps existingReview (reuse across modal openings).
  useEffect(() => {
    setFormData(hydrateFromExisting(existingReview));
  }, [existingReview]);

  // Fetch all courses and filter to the ones taught by this lecturer.
  useEffect(() => {
    let cancelled = false;
    const loadCourses = async () => {
      setLoadingCourses(true);
      try {
        const allCourses = await apiFetch("/api/courses", { token: user?.token });
        if (cancelled) return;
        const lecturerCourses = (allCourses || []).filter(
          (course) =>
            Array.isArray(course.lecturers) &&
            course.lecturers.some((lec) => lec._id === lecturerId)
        );
        setCourses(lecturerCourses);
        // Auto-select the sole course for new reviews.
        if (!existingReview && lecturerCourses.length === 1) {
          setFormData((prev) => ({ ...prev, courses: [lecturerCourses[0]._id] }));
        }
      } catch (err) {
        if (!cancelled) setError("שגיאה בטעינת רשימת הקורסים");
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    };
    loadCourses();
    return () => {
      cancelled = true;
    };
  }, [lecturerId, user?.token, existingReview]);

  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const courseOptions = useMemo(
    () =>
      courses.map((course) => ({
        value: course._id,
        label: `${course.title} (${course.courseNumber})`,
      })),
    [courses]
  );

  const selectedCourseOptions = useMemo(
    () => courseOptions.filter((opt) => formData.courses.includes(opt.value)),
    [courseOptions, formData.courses]
  );

  const handleCoursesChange = useCallback((selected) => {
    const ids = Array.isArray(selected) ? selected.map((opt) => opt.value) : [];
    setFormData((prev) => ({ ...prev, courses: ids }));
  }, []);

  const validate = useCallback(() => {
    if (!formData.courses || formData.courses.length === 0) {
      return "יש לבחור לפחות קורס אחד";
    }
    for (const field of RATING_FIELDS) {
      const value = Number(formData[field]);
      if (!value || value < 1 || value > 5) {
        return "כל הדירוגים חייבים להיות בין 1 ל-5";
      }
    }
    return null;
  }, [formData]);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
      setSubmitting(true);
      setError("");
      try {
        const payload = {
          courses: formData.courses,
          clarity: parseInt(formData.clarity, 10),
          responsiveness: parseInt(formData.responsiveness, 10),
          availability: parseInt(formData.availability, 10),
          organization: parseInt(formData.organization, 10),
          knowledge: parseInt(formData.knowledge, 10),
          comment: formData.comment?.trim() || "",
          isAnonymous: formData.isAnonymous,
        };
        if (!isEdit) payload.lecturer = lecturerId;

        const newReview = await apiFetch(
          isEdit
            ? `/api/lecturer-reviews/${existingReview._id}`
            : "/api/lecturer-reviews",
          {
            method: isEdit ? "PUT" : "POST",
            body: payload,
            token: user?.token,
          }
        );

        // Preserve legacy cross-tab + listener signals.
        localStorage.setItem("reviewAdded", "true");
        sessionStorage.setItem("refreshMyReviews", "true");
        await syncTrackedLecturerCache(lecturerId, user?.token);
        window.dispatchEvent(
          new CustomEvent("reviewAdded", {
            detail: { lecturerId, reviewId: newReview?._id, timestamp: Date.now() },
          })
        );
        window.dispatchEvent(
          new CustomEvent("trackedLecturerUpdated", {
            detail: { lecturerId, reviewId: newReview?._id, timestamp: Date.now() },
          })
        );

        // Symmetry with useCourseReviewForm: broadcast a `courseMutated`
        // event for every course this lecturer review touches, so every
        // subscriber (Dashboard, TrackedCourses, CoursePage, ...) drops
        // its stale copy and refetches. This closes the asymmetry gap
        // flagged by the Batch 1 QA audit.
        if (typeof broadcastCourseMutation === "function") {
          (formData.courses || []).forEach((courseId) => {
            try {
              broadcastCourseMutation(courseId);
            } catch (broadcastError) {
              console.warn(
                "broadcastCourseMutation failed for course",
                courseId,
                broadcastError
              );
            }
          });
        }

        onSubmitted?.(newReview);
      } catch (err) {
        console.error("Error submitting lecturer review:", err);
        setError(err?.message || "שגיאה בשליחת הביקורת");
      } finally {
        setSubmitting(false);
      }
    },
    [
      validate,
      formData,
      isEdit,
      existingReview,
      lecturerId,
      user?.token,
      onSubmitted,
      broadcastCourseMutation,
    ]
  );

  return {
    formData,
    setField,
    courses,
    courseOptions,
    selectedCourseOptions,
    handleCoursesChange,
    loadingCourses,
    submitting,
    error,
    setError,
    isEdit,
    handleSubmit,
  };
};

export default useLecturerReviewForm;
