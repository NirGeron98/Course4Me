import React from "react";

/**
 * Reusable empty state for lists and sections.
 * Provides consistent messaging and optional CTA without changing behavior.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-10 px-6 text-center rounded-2xl border border-gray-100 bg-gray-50/50 ${className}`}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-gray-200/80 p-4 text-gray-500" aria-hidden="true">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
