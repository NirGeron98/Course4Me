import React from "react";
import Select from "react-select";
import {
  Award,
  Clock,
  Eye,
  Loader2,
  MessageCircle,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Input from "../common/Input";
import ReviewRatingSliders from "../common/ReviewRatingSliders";
import AnonymousToggle from "../common/AnonymousToggle";
import Alert from "../common/Alert";

// LecturerReviewFormFields — presentational form body for the lecturer review.
// Consumes state + handlers from useLecturerReviewForm. Holds no business logic.

const RATING_CRITERIA = [
  { key: "clarity", label: "בהירות הוראה", icon: Eye, colorClass: "bg-blue-500" },
  { key: "responsiveness", label: "התחשבות בסטודנטים", icon: Users, colorClass: "bg-emerald-500" },
  { key: "availability", label: "זמינות", icon: Clock, colorClass: "bg-orange-500" },
  { key: "organization", label: "ארגון השיעור", icon: Zap, colorClass: "bg-rose-500" },
  { key: "knowledge", label: "עומק הידע", icon: Star, colorClass: "bg-amber-500" },
];

// react-select visual overrides to match the Phase 2 design tokens.
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#8b5cf6" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(139, 92, 246, 0.15)" : "none",
    "&:hover": { borderColor: "#8b5cf6" },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#f3e8ff",
    borderRadius: "6px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#581c87",
    fontWeight: 500,
  }),
  placeholder: (provided) => ({ ...provided, color: "#94a3b8" }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#8b5cf6"
      : state.isFocused
      ? "#faf5ff"
      : "white",
    color: state.isSelected ? "white" : "#334155",
  }),
};

const CoursesPicker = ({
  isEdit,
  loadingCourses,
  courses,
  courseOptions,
  selectedCourseOptions,
  onCoursesChange,
}) => {
  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center py-4 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span className="mr-2 text-sm">טוען קורסים...</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-4 text-muted bg-surface-sunken rounded-card text-sm">
        לא נמצאו קורסים עבור מרצה זה
      </div>
    );
  }

  if (!isEdit && courses.length === 1) {
    const only = courses[0];
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card">
        <div className="flex items-center gap-2 text-emerald-700">
          <Award className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">
            {only.title} ({only.courseNumber})
          </span>
        </div>
        <p className="text-xs text-emerald-600 mt-1">
          הקורס נבחר אוטומטית מכיוון שזה הקורס היחיד של המרצה
        </p>
      </div>
    );
  }

  return (
    <Select
      isMulti
      value={selectedCourseOptions}
      onChange={onCoursesChange}
      options={courseOptions}
      placeholder={isEdit ? "בחר קורסים לעדכון..." : "בחר קורסים..."}
      isSearchable
      classNamePrefix="react-select"
      styles={selectStyles}
      noOptionsMessage={() => "לא נמצאו קורסים"}
    />
  );
};

const LecturerReviewFormFields = ({
  formData,
  setField,
  courses,
  courseOptions,
  selectedCourseOptions,
  handleCoursesChange,
  loadingCourses,
  error,
  isEdit,
  onSubmit,
}) => {
  return (
    <form id="lecturer-review-form" onSubmit={onSubmit} className="flex flex-col gap-5" dir="rtl">
      {error && <Alert type="error" message={error} />}

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
          <Award className="w-4 h-4 text-brand" aria-hidden="true" />
          {isEdit ? "עדכן קורסים" : courses.length === 1 ? "קורס נבחר אוטומטית" : "בחר קורסים *"}
        </label>
        <CoursesPicker
          isEdit={isEdit}
          loadingCourses={loadingCourses}
          courses={courses}
          courseOptions={courseOptions}
          selectedCourseOptions={selectedCourseOptions}
          onCoursesChange={handleCoursesChange}
        />
      </div>

      <AnonymousToggle
        checked={formData.isAnonymous}
        onChange={(next) => setField("isAnonymous", next)}
      />

      <ReviewRatingSliders
        criteria={RATING_CRITERIA}
        values={formData}
        onChange={(key, next) => setField(key, next)}
      />

      <Input
        as="textarea"
        rows={3}
        label="הערות נוספות (אופציונלי)"
        leftIcon={MessageCircle}
        placeholder="שתף את החוויה שלך מהמרצה..."
        value={formData.comment}
        onChange={(event) => setField("comment", event.target.value)}
      />
    </form>
  );
};

export default LecturerReviewFormFields;
