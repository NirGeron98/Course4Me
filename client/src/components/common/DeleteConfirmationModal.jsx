import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-800">
              {title || "אישור מחיקה"}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            {message || "האם אתה בטוח שברצונך למחוק את הביקורת? פעולה זו אינה ניתנת לביטול."}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:shadow-md"
            >
              ביטול
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
            >
              מחק ביקורת
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;