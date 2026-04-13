import React, { useId } from "react";

// Input — text/number/email/etc input with built-in label, hint, and error states.
// Props:
//  - label: visible label text (Hebrew copy)
//  - hint: helper text below the input
//  - error: error message; replaces the hint and applies danger styles
//  - leftIcon / rightIcon: optional lucide-react icon component
//  - as: "input" (default) or "textarea"
//  - fullWidth: stretch to parent width (default: true)
const BASE_FIELD =
  "w-full rounded-button bg-surface-raised border text-slate-900 placeholder-slate-400 " +
  "transition-colors duration-ui ease-ui " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 " +
  "disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed";

const NEUTRAL_BORDER =
  "border-slate-300 hover:border-slate-400 focus-visible:border-brand focus-visible:ring-brand/40";

const DANGER_BORDER =
  "border-danger focus-visible:border-danger focus-visible:ring-danger/40";

// Mobile gets the 16px/44px treatment: text-base prevents iOS from zooming on
// focus, min-h-11 gives a proper touch target. Desktop keeps the tighter look.
const SIZE_CLASS =
  "text-base sm:text-sm px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[38px]";

const Input = React.forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    as = "input",
    id,
    className = "",
    fullWidth = true,
    required,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const fieldId = id || `field-${reactId}`;
  const describedById = error
    ? `${fieldId}-error`
    : hint
    ? `${fieldId}-hint`
    : undefined;

  const borderClass = error ? DANGER_BORDER : NEUTRAL_BORDER;
  const paddingWithIcons =
    (LeftIcon ? " pr-10" : "") + (RightIcon ? " pl-10" : "");

  const sharedProps = {
    ref,
    id: fieldId,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedById,
    required,
    className:
      `${BASE_FIELD} ${borderClass} ${SIZE_CLASS}${paddingWithIcons} ${className}`.trim(),
    ...rest,
  };

  const field =
    as === "textarea" ? (
      <textarea {...sharedProps} />
    ) : (
      <input {...sharedProps} />
    );

  return (
    <div className={fullWidth ? "w-full" : ""} dir="rtl">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-danger mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">
            <LeftIcon className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
        {field}
        {RightIcon && (
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
            <RightIcon className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
      </div>

      {error ? (
        <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
