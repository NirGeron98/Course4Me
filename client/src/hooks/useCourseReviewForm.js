import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./useApi";
import { useCourseDataContext } from "../contexts/CourseDataContext";

// useCourseReviewForm — owns all state, data, validation and submission for
// the course review form. Mirrors the shape of useLecturerReviewForm so the
// presentational fields component can stay dumb.
//
// Params:
//  - courseId: id of the reviewed course
//  - user: auth user (token fallback)
//  - existingReview: edit-mode hydration source
//  - onSubmitted: (review, action?) => void
//    action === "edit" is used to signal that the user already has a review
//    and wants to switch into edit mode on the parent.

const RATING_FIELDS = [
  "interest",
  "difficulty",
  "workload",
  "teachingQuality",
  "recommendation",
];

const INITIAL_FORM = {
  lecturers: [],
  lecturer: "",
  interest: 3,
  difficulty: 3,
  workload: 3,
  teachingQuality: 3,
  recommendation: 3,
  comment: "",
  isAnonymous: false,
};

const hydrateFromExisting = (existingReview) => {
  if (!existingReview) return INITIAL_FORM;
  let selected = [];
  if (Array.isArray(existingReview.lecturers) && existingReview.lecturers.length) {
    selected = existingReview.lecturers.map((l) => (typeof l === "object" ? l._id : l));
  } else if (existingReview.lecturer) {
    selected = [
      typeof existingReview.lecturer === "object"
        ? existingReview.lecturer._id
        : existingReview.lecturer,
    ];
  }
  return {
    lecturers: selected,
    lecturer: selected[0] || "",
    interest: Number(existingReview.interest) || 3,
    difficulty: Number(existingReview.difficulty) || 3,
    workload: Number(existingReview.workload) || 3,
    teachingQuality: Number(existingReview.teachingQuality) || 3,
    recommendation: Number(existingReview.recommendation) || 3,
    comment: existingReview.comment || "",
    isAnonymous: Boolean(existingReview.isAnonymous),
  };
};

const useCourseReviewForm = ({
  courseId,
  user,
  existingReview = null,
  onSubmitted,
}) => {
  const isEdit = Boolean(existingReview);
  const { broadcastCourseMutation } = useCourseDataContext();

  const [formData, setFormData] = useState(() => hydrateFromExisting(existingReview));
  const [lecturers, setLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(true);
  const [allReviews, setAllReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingUserReview, setExistingUserReview] = useState(null);

  useEffect(() => {
    setFormData(hydrateFromExisting(existingReview));
  }, [existingReview]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingLecturers(true);
      try {
        const courseData = await apiFetch(`/api/courses/${courseId}`, {
          token: user?.token,
        });
        if (cancelled) return;
        const courseLecturers = courseData?.lecturers || [];
        setLecturers(courseLecturers);
        if (courseLecturers.length === 1 && !existingReview) {
          setFormData((prev) => ({
            ...prev,
            lecturers: [courseLecturers[0]._id],
            lecturer: courseLecturers[0]._id,
          }));
        }

        const reviewsData = await apiFetch(`/api/reviews/course/${courseId}`, {
          token: user?.token,
        });
        if (!cancelled) setAllReviews(reviewsData || []);
      } catch (err) {
        if (!cancelled) setError("שגיאה בטעינת המידע");
      } finally {
        if (!cancelled) setLoadingLecturers(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId, user?.token, existingReview]);

  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const lecturerOptions = useMemo(
    () => lecturers.map((l) => ({ value: l._id, label: l.name })),
    [lecturers]
  );

  const selectedLecturerOptions = useMemo(
    () => lecturerOptions.filter((opt) => formData.lecturers.includes(opt.value)),
    [lecturerOptions, formData.lecturers]
  );

  const findUserReview = useCallback(() => {
    if (!user?.user) return null;
    return allReviews.find((r) => r.user && r.user._id === user.user._id) || null;
  }, [allReviews, user?.user]);

  const handleLecturersChange = useCallback(
    (selected) => {
      const ids = Array.isArray(selected) ? selected.map((o) => o.value) : [];
      if (isEdit) {
        setFormData((prev) => ({ ...prev, lecturers: ids, lecturer: ids[0] || "" }));
        return;
      }
      const prior = findUserReview();
      if (prior) {
        setExistingUserReview(prior);
        return;
      }
      setFormData((prev) => ({ ...prev, lecturers: ids, lecturer: ids[0] || "" }));
    },
    [isEdit, findUserReview]
  );

  const dismissExistingReviewPrompt = useCallback(() => {
    setExistingUserReview(null);
    setFormData((prev) => ({ ...prev, lecturers: [], lecturer: "" }));
  }, []);

  const confirmEditExistingReview = useCallback(() => {
    const target = existingUserReview;
    setExistingUserReview(null);
    onSubmitted?.(target, "edit");
  }, [existingUserReview, onSubmitted]);

  const validate = useCallback(() => {
    if (!formData.lecturers || formData.lecturers.length === 0) {
      return "יש לבחור לפחות מרצה אחד";
    }
    for (const field of RATING_FIELDS) {
      const v = Number(formData[field]);
      if (!v || v < 1 || v > 5) return "כל הדירוגים חייבים להיות בין 1 ל-5";
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
          lecturers: formData.lecturers,
          lecturer: formData.lecturers[0] || formData.lecturer,
          interest: Number(formData.interest),
          difficulty: Number(formData.difficulty),
          workload: Number(formData.workload),
          teachingQuality: Number(formData.teachingQuality),
          recommendation: Number(formData.recommendation),
          comment: String(formData.comment || "").trim(),
          isAnonymous: Boolean(formData.isAnonymous),
        };
        if (!isEdit) payload.course = courseId;

        const newReview = await apiFetch(
          isEdit ? `/api/reviews/${existingReview._id}` : "/api/reviews",
          {
            method: isEdit ? "PUT" : "POST",
            body: payload,
            token: user?.token,
          }
        );

        localStorage.setItem(isEdit ? "reviewUpdated" : "reviewAdded", "true");
        sessionStorage.setItem("refreshMyReviews", "true");
        window.dispatchEvent(new CustomEvent(isEdit ? "reviewUpdated" : "reviewAdded"));
        // Phase 1 cache invalidation — drops the cached course entry and
        // bumps dependent views (Dashboard / TrackedCourses / search).
        broadcastCourseMutation?.(courseId);

        onSubmitted?.(newReview);
      } catch (err) {
        console.error("Error submitting course review:", err);
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
      courseId,
      user?.token,
      broadcastCourseMutation,
      onSubmitted,
    ]
  );

  return {
    formData,
    setField,
    lecturers,
    lecturerOptions,
    selectedLecturerOptions,
    handleLecturersChange,
    loadingLecturers,
    submitting,
    error,
    setError,
    isEdit,
    handleSubmit,
    existingUserReview,
    dismissExistingReviewPrompt,
    confirmEditExistingReview,
  };
};

export default useCourseReviewForm;
