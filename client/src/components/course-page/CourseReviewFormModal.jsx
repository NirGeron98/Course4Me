import React from "react";
import Modal, { ModalFooter } from "../common/Modal";
import Button from "../common/Button";
import ExistingReviewModal from "../common/ExistingReviewModal";
import useCourseReviewForm from "../../hooks/useCourseReviewForm";
import CourseReviewFormFields from "./CourseReviewFormFields";

// CourseReviewFormModal — thin shell wiring the form hook into Modal + Button
// primitives. All presentation lives in CourseReviewFormFields; all logic
// lives in useCourseReviewForm.
const CourseReviewFormModal = ({
  courseId,
  courseTitle,
  user,
  onClose,
  onReviewSubmitted,
  existingReview = null,
}) => {
  const form = useCourseReviewForm({
    courseId,
    user,
    existingReview,
    onSubmitted: (review, action) => {
      if (action === "edit") {
        onClose?.();
        onReviewSubmitted?.(review, "edit");
        return;
      }
      onReviewSubmitted?.(review);
    },
  });

  const submitDisabled =
    form.submitting ||
    form.loadingLecturers ||
    form.formData.lecturers.length === 0;

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={form.isEdit ? "עריכת ביקורת קורס" : "כתיבת ביקורת קורס"}
        description={courseTitle}
        size="xl"
      >
        <CourseReviewFormFields
          formData={form.formData}
          setField={form.setField}
          lecturers={form.lecturers}
          lecturerOptions={form.lecturerOptions}
          selectedLecturerOptions={form.selectedLecturerOptions}
          handleLecturersChange={form.handleLecturersChange}
          loadingLecturers={form.loadingLecturers}
          error={form.error}
          isEdit={form.isEdit}
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
            form="course-review-form"
            variant="primary"
            loading={form.submitting}
            disabled={submitDisabled}
          >
            {form.isEdit ? "עדכן ביקורת" : "שלח ביקורת"}
          </Button>
        </ModalFooter>
      </Modal>

      {form.existingUserReview && (
        <ExistingReviewModal
          onEdit={form.confirmEditExistingReview}
          onCancel={form.dismissExistingReviewPrompt}
          existingReview={form.existingUserReview}
          reviewType="course"
        />
      )}
    </>
  );
};

export default CourseReviewFormModal;
