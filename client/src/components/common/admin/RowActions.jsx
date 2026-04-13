import React from "react";
import { Pencil, Trash2, Eye, Check, X } from "lucide-react";

// RowActions — compact icon-button cluster used in admin list rows.
// Props:
//  - onView / onEdit / onDelete / onApprove / onReject: optional click handlers.
//    Pass only the actions you want to render.
//  - disabled: disables every action
//  - size: "sm" | "md" (default "sm")
//  - className: extra classes for the wrapper
//
// Each action is a small icon button with an aria-label; Hebrew labels live here
// so consumers get a consistent voice. Override with explicit label props if needed.
const BUTTON_BASE =
  "inline-flex items-center justify-center rounded-button transition-colors duration-ui ease-ui " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT_CLASS = {
  view: "text-slate-600 hover:text-brand hover:bg-brand/10 focus-visible:ring-brand",
  edit: "text-slate-600 hover:text-brand hover:bg-brand/10 focus-visible:ring-brand",
  delete:
    "text-slate-600 hover:text-danger hover:bg-danger/10 focus-visible:ring-danger",
  approve:
    "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 focus-visible:ring-emerald-500",
  reject:
    "text-slate-600 hover:text-danger hover:bg-danger/10 focus-visible:ring-danger",
};

const SIZE_CLASS = {
  sm: "w-8 h-8",
  md: "w-9 h-9",
};

const ICON_SIZE = {
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
};

const ActionButton = ({ variant, size, label, icon: Icon, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`${BUTTON_BASE} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]}`}
  >
    <Icon className={ICON_SIZE[size]} aria-hidden="true" />
  </button>
);

const RowActions = ({
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  disabled = false,
  size = "sm",
  viewLabel = "צפייה",
  editLabel = "עריכה",
  deleteLabel = "מחיקה",
  approveLabel = "אישור",
  rejectLabel = "דחייה",
  className = "",
}) => {
  const resolvedSize = SIZE_CLASS[size] ? size : "sm";

  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-1 ${className}`.trim()}
    >
      {onView && (
        <ActionButton
          variant="view"
          size={resolvedSize}
          label={viewLabel}
          icon={Eye}
          onClick={onView}
          disabled={disabled}
        />
      )}
      {onEdit && (
        <ActionButton
          variant="edit"
          size={resolvedSize}
          label={editLabel}
          icon={Pencil}
          onClick={onEdit}
          disabled={disabled}
        />
      )}
      {onApprove && (
        <ActionButton
          variant="approve"
          size={resolvedSize}
          label={approveLabel}
          icon={Check}
          onClick={onApprove}
          disabled={disabled}
        />
      )}
      {onReject && (
        <ActionButton
          variant="reject"
          size={resolvedSize}
          label={rejectLabel}
          icon={X}
          onClick={onReject}
          disabled={disabled}
        />
      )}
      {onDelete && (
        <ActionButton
          variant="delete"
          size={resolvedSize}
          label={deleteLabel}
          icon={Trash2}
          onClick={onDelete}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default RowActions;
