import React from "react";

const Popup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "אשר",
  cancelText = "ביטול",
  type = "info", // Default to info if not specified
}) => {
  if (!isOpen) return null;

  // Define different styles for each popup type
  const styles = {
    info: "bg-blue-50 text-blue-700 border-blue-300",
    success: "bg-green-50 text-green-700 border-green-300",
    error: "bg-red-50 text-red-700 border-red-300",
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg p-6 max-w-sm w-full shadow-lg border ${styles[type]}`}
      >
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
