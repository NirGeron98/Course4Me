import React, { useEffect, useState } from "react";
import Select from "react-select";
import { User, Mail, Save, Plus } from "lucide-react";
import Modal, { ModalFooter } from "../../common/Modal";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Alert from "../../common/Alert";

// LecturerFormModal — add / edit form wrapped in the Modal primitive.
// Uses react-select for the departments multi-select to stay consistent with
// the course/lecturer review modals. The parent's onSubmit callback handles
// the actual mutation via the useLecturers hook.

const EMPTY_FORM = { name: "", email: "", departments: [] };

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "42px",
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#10b981" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(16,185,129,0.18)" : "none",
    "&:hover": { borderColor: "#10b981" },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#ecfdf5",
    borderRadius: "6px",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#047857",
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

const hydrateFromLecturer = (lecturer, departments) => {
  if (!lecturer) return EMPTY_FORM;
  let selected = [];
  if (Array.isArray(lecturer.departments) && lecturer.departments.length) {
    selected = lecturer.departments.map((d) => (typeof d === "object" ? d?._id : d));
  } else if (typeof lecturer.department === "string" && lecturer.department.trim()) {
    const byName = new Map(departments.map((d) => [d.name.trim().toLowerCase(), d._id]));
    lecturer.department
      .split(",")
      .map((n) => n.trim().toLowerCase())
      .forEach((name) => {
        const id = byName.get(name);
        if (id && !selected.includes(id)) selected.push(id);
      });
  }
  return {
    name: lecturer.name || "",
    email: lecturer.email || "",
    departments: selected.filter(Boolean),
  };
};

const LecturerFormModal = ({
  isOpen,
  mode = "create",
  lecturer = null,
  departments = [],
  submitting = false,
  error = "",
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState(() => hydrateFromLecturer(lecturer, departments));
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData(hydrateFromLecturer(lecturer, departments));
      setLocalError("");
    }
  }, [isOpen, lecturer, departments]);

  const options = departments.map((d) => ({ value: d._id, label: d.name }));
  const selectedOptions = options.filter((opt) => formData.departments.includes(opt.value));

  const handleChange = (field) => (event) =>
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));

  const handleDepartmentsChange = (selected) => {
    const ids = Array.isArray(selected) ? selected.map((o) => o.value) : [];
    setFormData((prev) => ({ ...prev, departments: ids }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setLocalError("יש למלא שם ודוא״ל");
      return;
    }
    if (formData.departments.length === 0) {
      setLocalError("יש לבחור לפחות מחלקה אחת");
      return;
    }
    setLocalError("");
    onSubmit?.({
      name: formData.name.trim(),
      email: formData.email.trim(),
      departments: formData.departments,
    });
  };

  const displayError = localError || error;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "עריכת מרצה" : "הוספת מרצה חדש"}
      description={isEdit ? lecturer?.name || "" : "מלא את פרטי המרצה החדש"}
      size="lg"
    >
      <form
        id="lecturer-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        dir="rtl"
      >
        {displayError && <Alert type="error" message={displayError} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="שם המרצה"
            required
            leftIcon={User}
            value={formData.name}
            onChange={handleChange("name")}
            placeholder="ד״ר יוסי כהן"
          />
          <Input
            label='דוא"ל'
            required
            type="email"
            leftIcon={Mail}
            value={formData.email}
            onChange={handleChange("email")}
            placeholder="lecturer@afeka.ac.il"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            מחלקות <span className="text-danger mr-1">*</span>
          </label>
          <Select
            isMulti
            value={selectedOptions}
            onChange={handleDepartmentsChange}
            options={options}
            placeholder="בחר מחלקות..."
            isSearchable
            classNamePrefix="react-select"
            styles={selectStyles}
            noOptionsMessage={() => "לא נמצאו מחלקות"}
          />
        </div>
      </form>

      <ModalFooter className="-mx-6 -mb-5 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={submitting}
        >
          ביטול
        </Button>
        <Button
          type="submit"
          form="lecturer-form"
          variant="primary"
          loading={submitting}
          leftIcon={isEdit ? Save : Plus}
        >
          {isEdit ? "שמור שינויים" : "הוסף מרצה"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LecturerFormModal;
