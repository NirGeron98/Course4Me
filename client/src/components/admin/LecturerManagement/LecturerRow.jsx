import React from "react";
import RowActions from "../../common/admin/RowActions";

// LecturerRow — presentational helpers for the lecturer list table.
// Exports `lecturerColumns` (used by ListTable) and `renderLecturerRowActions`
// (used as ListTable's renderRowActions prop). Keeping both factories in one
// file lets the shell component stay focused on orchestration.

const DepartmentChips = ({ lecturer }) => {
  // Supports the new object array shape and the legacy comma-separated string.
  let names = [];
  if (Array.isArray(lecturer.departments) && lecturer.departments.length) {
    names = lecturer.departments.map((d) => (typeof d === "object" ? d?.name : d));
  } else if (typeof lecturer.department === "string" && lecturer.department.trim()) {
    names = lecturer.department.split(",").map((n) => n.trim());
  }
  names = names.filter(Boolean);

  if (names.length === 0) {
    return <span className="text-xs text-muted">אין מחלקות</span>;
  }

  const visible = names.slice(0, 2);
  const overflow = names.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((name, index) => (
        <span
          key={`${name}-${index}`}
          className="inline-block px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100"
        >
          {name}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full cursor-help"
          title={names.slice(2).join(", ")}
        >
          +{overflow} נוספות
        </span>
      )}
    </div>
  );
};

export const lecturerColumns = [
  {
    key: "name",
    header: "שם המרצה",
    render: (row) => (
      <div className="font-semibold text-slate-800 truncate" title={row.name}>
        {row.name}
      </div>
    ),
  },
  {
    key: "email",
    header: 'דוא"ל',
    render: (row) => (
      <span className="text-sm text-slate-600 truncate" title={row.email}>
        {row.email}
      </span>
    ),
  },
  {
    key: "departments",
    header: "מחלקות",
    render: (row) => <DepartmentChips lecturer={row} />,
  },
];

export const renderLecturerRowActions = ({ onEdit, onDelete, disabled }) => (row) => (
  <RowActions
    onEdit={() => onEdit(row)}
    onDelete={() => onDelete(row)}
    disabled={disabled}
  />
);

export default DepartmentChips;
