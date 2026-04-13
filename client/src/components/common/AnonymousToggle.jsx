import React, { useId } from "react";
import { EyeOff, Eye } from "lucide-react";

// AnonymousToggle — pill-style toggle for "post anonymously" flags on review forms.
// Props:
//  - checked: boolean
//  - onChange: (nextChecked) => void
//  - disabled: disables the toggle
//  - label / description: optional overrides (Hebrew copy by default)
const DEFAULT_LABEL = "פרסום אנונימי";
const DEFAULT_DESCRIPTION = "שם המשתמש לא יוצג לצד הביקורת";

const AnonymousToggle = ({
  checked = false,
  onChange,
  disabled = false,
  label = DEFAULT_LABEL,
  description = DEFAULT_DESCRIPTION,
}) => {
  const reactId = useId();
  const inputId = `anonymous-toggle-${reactId}`;
  const descriptionId = `${inputId}-description`;
  const Icon = checked ? EyeOff : Eye;

  const handleChange = (event) => {
    if (disabled) return;
    onChange?.(event.target.checked);
  };

  return (
    <label
      htmlFor={inputId}
      dir="rtl"
      className={`flex items-center justify-between gap-4 rounded-card border border-slate-200 bg-surface-raised px-4 py-3 shadow-card transition-colors duration-ui ease-ui ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-brand/40 cursor-pointer"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span
          className={`shrink-0 mt-0.5 flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-ui ease-ui ${
            checked ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-500"
          }`}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {label}
          </p>
          {description && (
            <p id={descriptionId} className="mt-0.5 text-xs text-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      <span className="relative inline-flex shrink-0">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          aria-describedby={description ? descriptionId : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="w-11 h-6 rounded-full bg-slate-300 transition-colors duration-ui ease-ui peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 peer-focus-visible:ring-offset-2"
        />
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-card transition-transform duration-ui ease-ui peer-checked:-translate-x-5"
        />
      </span>
    </label>
  );
};

export default AnonymousToggle;
