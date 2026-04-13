import React from "react";
import Modal, { ModalFooter } from "../common/Modal";
import Button from "../common/Button";
import useLecturerReviewForm from "../../hooks/useLecturerReviewForm";
import LecturerReviewFormFields from "./LecturerReviewFormFields";

// LecturerReviewFormModal — thin shell that wires the form hook to the Modal
// + Button primitives. All logic lives in useLecturerReviewForm, all presentation
// lives in LecturerReviewFormFields.
const LecturerReviewFormModal = ({
  lecturerId,
  lecturerName,
  user,
  onClose,
  onReviewSubmitted,
  existingReview = null,
}) => {
  const form = useLecturerReviewForm({
    lecturerId,
    user,
    existingReview,
    onSubmitted: onReviewSubmitted,
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
      title={form.isEdit ? "עריכת ביקורת מרצה" : "כתיבת ביקורת מרצה"}
      description={lecturerName}
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
          form="lecturer-review-form"
          variant="primary"
          loading={form.submitting}
          disabled={submitDisabled}
        >
          {form.isEdit ? "עדכן ביקורת" : "שלח ביקורת"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LecturerReviewFormModal;
