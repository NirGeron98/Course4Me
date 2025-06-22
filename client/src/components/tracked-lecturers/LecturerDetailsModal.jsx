import React from "react";
import { X, User, Building, Mail, Hash, Calendar } from "lucide-react";

const LecturerDetailsModal = ({ lecturer, onClose }) => {
  if (!lecturer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-lg relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-200 p-3 rounded-full">
            <User className="w-6 h-6 text-purple-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {lecturer.name}
          </h2>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-500" />
            <span>מחלקה: {lecturer.department}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-500" />
            <span>אימייל: {lecturer.email}</span>
          </div>
          {lecturer.academicInstitution && (
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-500" />
              <span>מוסד אקדמי: {lecturer.academicInstitution}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>
              נוצר בתאריך:{" "}
              {new Date(lecturer.createdAt).toLocaleDateString("he-IL")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDetailsModal;
