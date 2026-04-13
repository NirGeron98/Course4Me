import React from "react";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";

// StatusBadge — small chip that renders a contact request status with
// matching icon + color. Also exports the shared status catalog so the rest
// of the panel (filters, stat cards) can stay in lockstep.

export const STATUS_CATALOG = {
  pending: {
    text: "ממתין לטיפול",
    icon: Clock,
    chip: "text-orange-700 bg-orange-50 border border-orange-100",
  },
  in_progress: {
    text: "בטיפול",
    icon: Loader2,
    chip: "text-blue-700 bg-blue-50 border border-blue-100",
  },
  answered: {
    text: "נענתה",
    icon: CheckCircle2,
    chip: "text-emerald-700 bg-emerald-50 border border-emerald-100",
  },
};

export const SUBJECT_LABELS = {
  add_lecturer_to_course: "שיוך מרצה לקורס",
  add_course_to_lecturer: "שיוך קורס למרצה",
  add_course_to_system: "הוספת קורס למערכת",
  add_lecturer_to_system: "הוספת מרצה למערכת",
  general_inquiry: "נושא כללי",
};

export const getSubjectLabel = (subject) => SUBJECT_LABELS[subject] || subject;

const StatusBadge = ({ status, className = "" }) => {
  const entry = STATUS_CATALOG[status] || STATUS_CATALOG.pending;
  const Icon = entry.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${entry.chip} ${className}`.trim()}
    >
      <Icon
        className={`w-3 h-3 ${status === "in_progress" ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {entry.text}
    </span>
  );
};

export default StatusBadge;
