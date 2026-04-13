import React from "react";
import Select from "react-select";
import {
  Award,
  Clock,
  Heart,
  Loader2,
  MessageCircle,
  ThumbsUp,
  User,
  Zap,
} from "lucide-react";
import Input from "../common/Input";
import ReviewRatingSliders from "../common/ReviewRatingSliders";
import AnonymousToggle from "../common/AnonymousToggle";
import Alert from "../common/Alert";

// CourseReviewFormFields — presentational body of the course review form.
// All state and handlers are injected from useCourseReviewForm.

const RATING_CRITERIA = [
  { key: "interest", label: "עד כמה הקורס מעניין?", icon: Heart, colorClass: "bg-rose-500" },
  { key: "difficulty", label: "עד כמה הקורס קשה?", icon: Zap, colorClass: "bg-amber-500" },
  { key: "workload", label: "כמה זמן השקעת בקורס?", icon: Clock, colorClass: "bg-orange-500" },
  { key: "teachingQuality", label: "איכות ההוראה", icon: Award, colorClass: "bg-violet-500" },
  { key: "recommendation", label: "עד כמה היית ממליץ?", icon: ThumbsUp, colorClass: "bg-emerald-500" },
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#10b981" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(16,185,129,0.15)" : "none",
    "&:hover": { borderColor: "#10b981" },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#dcfce7",
    borderRadius: "6px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#166534",
    fontWeight: 500,
  }),
  placeholder: (provided) => ({ ...provided, color: "#94a3b8" }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#10b981"
      : state.isFocused
      ? "#f0fdf4"
      : "white",
    color: state.isSelected ? "white" : "#334155",
  }),
};

const LecturersPicker = ({
  isEdit,
  loadingLecturers,
  lecturers,
  lecturerOptions,
  selectedLecturerOptions,
  onLecturersChange,
}) => {
  if (loadingLecturers) {
    return (
      <div className="flex items-center justify-center py-4 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span className="mr-2 text-sm">טוען מרצים...</span>
      </div>
    );
  }

  if (lecturers.length === 0) {
    return (
      <div className="text-center py-4 text-muted bg-surface-sunken rounded-card text-sm">
        לא נמצאו מרצים עבור קורס זה
      </div>
    );
  }

  if (!isEdit && lecturers.length === 1) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card">
        <div className="flex items-center gap-2 text-emerald-700">
          <User className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">{lecturers[0].name}</span>
        </div>
        <p className="text-xs text-emerald-600 mt-1">
          המרצה נבחר אוטומטית מכיוון שזה המרצה היחיד של הקורס
        </p>
      </div>
    );
  }

  return (
    <Select
      isMulti
      value={selectedLecturerOptions}
      onChange={onLecturersChange}
      options={lecturerOptions}
      placeholder="בחר מרצים..."
      isSearchable
      classNamePrefix="react-select"
      styles={selectStyles}
      noOptionsMessage={() => "לא נמצאו מרצים"}
    />
  );
};

const CourseReviewFormFields = ({
  formId = "course-review-form",
  formData,
  setField,
  lecturers,
  lecturerOptions,
  selectedLecturerOptions,
  handleLecturersChange,
  loadingLecturers,
  error,
  isEdit,
  onSubmit,
}) => {
  return (
    <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-5" dir="rtl">
      {error && <Alert type="error" message={error} />}

      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
          <User className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          {isEdit ? "עדכן מרצים" : lecturers.length === 1 ? "מרצה נבחר אוטומטית" : "בחר מרצים *"}
        </label>
        <LecturersPicker
          isEdit={isEdit}
          loadingLecturers={loadingLecturers}
          lecturers={lecturers}
          lecturerOptions={lecturerOptions}
          selectedLecturerOptions={selectedLecturerOptions}
          onLecturersChange={handleLecturersChange}
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
        accentClass="bg-emerald-500"
      />

      <Input
        as="textarea"
        rows={3}
        label="הערות נוספות (אופציונלי)"
        leftIcon={MessageCircle}
        placeholder="שתף את החוויה שלך מהקורס..."
        value={formData.comment}
        onChange={(event) => setField("comment", event.target.value)}
      />
    </form>
  );
};

export default CourseReviewFormFields;
