import React from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

/**
 * User-friendly alert for success, error, or info.
 * Keeps layout stable and avoids raw error text.
 */
const Alert = ({
  type = "error",
  message,
  onDismiss,
  className = "",
}) => {
  const config = {
    error: {
      icon: AlertCircle,
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-800",
      iconClass: "text-red-500",
    },
    success: {
      icon: CheckCircle,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-800",
      iconClass: "text-emerald-500",
    },
    info: {
      icon: Info,
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-800",
      iconClass: "text-blue-500",
    },
  };

  const { icon: Icon, bg, border, text, iconClass } = config[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${border} ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} aria-hidden="true" />
      <p className={`flex-1 text-sm font-medium ${text}`}>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
          aria-label="סגור"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
