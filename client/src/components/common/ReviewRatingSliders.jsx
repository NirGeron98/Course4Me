import React from "react";

// ReviewRatingSliders — reusable multi-criterion rating control.
// Renders a stack of rows, each with a label, optional icon, and a 1..max slider.
// Props:
//  - criteria: array of { key, label, icon?, hint?, colorClass? }
//      * key: field name in `values`
//      * label: Hebrew label text
//      * icon: optional lucide-react icon component
//      * hint: optional helper line shown under the label
//      * colorClass: tailwind class for the active track segment (e.g. "bg-brand")
//  - values: { [key]: number }
//  - onChange: (key, nextValue) => void
//  - min, max, step: slider bounds (defaults 1..5, step 1)
//  - disabled: disables all sliders
//  - accentClass: default track color when a criterion has no `colorClass`
const ReviewRatingSliders = ({
  criteria = [],
  values = {},
  onChange,
  min = 1,
  max = 5,
  step = 1,
  disabled = false,
  accentClass = "bg-brand",
}) => {
  if (!criteria.length) return null;

  const handleChange = (key) => (event) => {
    const next = Number(event.target.value);
    onChange?.(key, Number.isFinite(next) ? next : min);
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {criteria.map(({ key, label, icon: Icon, hint, colorClass }) => {
        const value = Number(values?.[key] ?? min);
        const clamped = Math.min(Math.max(value, min), max);
        const percent = ((clamped - min) / (max - min)) * 100;
        const trackColor = colorClass || accentClass;
        const sliderId = `rating-${key}`;

        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {Icon && (
                  <span className="shrink-0 text-slate-500">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <label
                    htmlFor={sliderId}
                    className="block text-sm font-medium text-slate-800 truncate"
                  >
                    {label}
                  </label>
                  {hint && (
                    <p className="mt-0.5 text-xs text-muted">{hint}</p>
                  )}
                </div>
              </div>
              <span
                className="shrink-0 text-sm font-bold text-slate-900 tabular-nums"
                aria-live="polite"
              >
                {clamped}
                <span className="text-muted font-medium">{` / ${max}`}</span>
              </span>
            </div>

            <div className="relative h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`absolute inset-y-0 right-0 ${trackColor} transition-all duration-ui ease-ui`}
                style={{ width: `${percent}%` }}
                aria-hidden="true"
              />
            </div>

            <input
              id={sliderId}
              type="range"
              min={min}
              max={max}
              step={step}
              value={clamped}
              disabled={disabled}
              onChange={handleChange(key)}
              aria-label={label}
              className="w-full h-2 -mt-2 appearance-none bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full disabled:cursor-not-allowed"
              style={{ direction: "ltr" }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ReviewRatingSliders;
