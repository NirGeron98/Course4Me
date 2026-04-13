import React from "react";
import { Save } from "lucide-react";
import Modal, { ModalFooter } from "../common/Modal";
import Button from "../common/Button";
import useCourseReviewForm from "../../hooks/useCourseReviewForm";
import useLecturerReviewForm from "../../hooks/useLecturerReviewForm";
import CourseReviewFormFields from "../course-page/CourseReviewFormFields";
import LecturerReviewFormFields from "../lecturer-page/LecturerReviewFormFields";

// ReviewEditModal — unified editor for both course and lecturer reviews.
// Branches to the appropriate hook + fields component based on reviewType.
// Each branch is a dedicated child component so React's rule-of-hooks is
// respected and each hook lifecycle is isolated.

const resolveId = (ref) => (ref && typeof ref === "object" ? ref._id : ref);

const CourseReviewEditor = ({ review, user, onClose, onReviewUpdated }) => {
  const courseId = resolveId(review.course);
  const form = useCourseReviewForm({
    courseId,
    user,
    existingReview: review,
    onSubmitted: (updated) => {
      onReviewUpdated?.({ ...updated, reviewType: "course" });
    },
  });

  const submitDisabled =
    form.submitting ||
    form.loadingLecturers ||
    !form.formData.lecturers ||
    form.formData.lecturers.length === 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="עריכת ביקורת קורס"
      description={`${review.course?.title || ""}${
        review.course?.courseNumber ? ` • ${review.course.courseNumber}` : ""
      }`}
      size="xl"
    >
      <CourseReviewFormFields
        formId="review-edit-course-form"
        formData={form.formData}
        setField={form.setField}
        lecturers={form.lecturers}
        lecturerOptions={form.lecturerOptions}
        selectedLecturerOptions={form.selectedLecturerOptions}
        handleLecturersChange={form.handleLecturersChange}
        loadingLecturers={form.loadingLecturers}
        error={form.error}
        isEdit
        onSubmit={form.handleSubmit}
      />

      <ModalFooter className="-mx-6 -mb-5 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={form.submitting}
        >
          ביטול
        </Button>
        <Button
          type="submit"
          form="review-edit-course-form"
          variant="primary"
          loading={form.submitting}
          disabled={submitDisabled}
          leftIcon={Save}
        >
          שמור שינויים
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const LecturerReviewEditor = ({ review, user, onClose, onReviewUpdated }) => {
  const lecturerId = resolveId(review.lecturer);
  const form = useLecturerReviewForm({
    lecturerId,
    user,
    existingReview: review,
    onSubmitted: (updated) => {
      // Legacy ReviewEditModal expected a `reviewUpdated` signal for edit flows.
      localStorage.setItem("reviewUpdated", "true");
      window.dispatchEvent(new CustomEvent("reviewUpdated"));
      onReviewUpdated?.({ ...updated, reviewType: "lecturer" });
    },
  });

  const submitDisabled =
    form.submitting ||
    form.loadingCourses ||
    !form.formData.courses ||
    form.formData.courses.length === 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="עריכת ביקורת מרצה"
      description={review.lecturer?.name || ""}
      size="xl"
    >
      <LecturerReviewFormFields
        formData={form.formData}
        setField={form.setField}
        courses={form.courses}
        courseOptions={form.courseOptions}
        selectedCourseOptions={form.selectedCourseOptions}
        handleCoursesChange={form.handleCoursesChange}
        loadingCourses={form.loadingCourses}
        error={form.error}
        isEdit
        onSubmit={form.handleSubmit}
      />

      <ModalFooter className="-mx-6 -mb-5 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={form.submitting}
        >
          ביטול
        </Button>
        <Button
          type="submit"
          form="lecturer-review-form"
          variant="primary"
          loading={form.submitting}
          disabled={submitDisabled}
          leftIcon={Save}
        >
          שמור שינויים
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const ReviewEditModal = ({ review, user, onClose, onReviewUpdated }) => {
  if (!review) return null;
  return review.reviewType === "course" ? (
    <CourseReviewEditor
      review={review}
      user={user}
      onClose={onClose}
      onReviewUpdated={onReviewUpdated}
    />
  ) : (
    <LecturerReviewEditor
      review={review}
      user={user}
      onClose={onClose}
      onReviewUpdated={onReviewUpdated}
    />
  );
};

export default ReviewEditModal;
