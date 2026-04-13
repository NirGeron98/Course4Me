import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Modal — accessible dialog primitive. Handles:
//  - Portal to document.body
//  - Escape-to-close
//  - Body scroll lock while open
//  - Backdrop click to close (optional)
//  - role=dialog + aria-modal + aria-labelledby
// Children receive the raw content area; use ModalFooter for action rows.
// On mobile the modal is full-width (bottom sheet style); the max-width only
// kicks in at the sm breakpoint so small screens never get pinched content.
const SIZE_CLASSES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[min(96vw,1200px)]",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  closeOnBackdrop = true,
  showCloseButton = true,
  initialFocusRef,
  className = "",
}) => {
  const handleEscape = useCallback(
    (event) => {
      if (event.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return undefined;
    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleEscape]);

  useEffect(() => {
    if (isOpen && initialFocusRef?.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  const titleId = title ? "modal-title" : undefined;
  const descriptionId = description ? "modal-description" : undefined;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const handleBackdropClick = (event) => {
    if (!closeOnBackdrop) return;
    if (event.target === event.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-backdropEnter"
      onMouseDown={handleBackdropClick}
      dir="rtl"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`w-full ${sizeClass} max-h-[100dvh] sm:max-h-[90vh] bg-surface-raised rounded-t-card-lg sm:rounded-card-lg shadow-elevated-lg overflow-hidden flex flex-col animate-modalEnter ${className}`.trim()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-bold text-slate-900 truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm text-muted"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="סגור"
                className="shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-button p-1.5 transition-colors duration-ui ease-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};

// Optional footer primitive for consistent action rows.
export const ModalFooter = ({ children, className = "" }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-surface-sunken ${className}`.trim()}
  >
    {children}
  </div>
);

export default Modal;
