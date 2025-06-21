import React from "react";
import { X } from "lucide-react";

const TrackedCourseCard = ({ course, onRemove, onViewDetails }) => {
  const getLecturerName = (lecturers) => {
    if (!Array.isArray(lecturers) || lecturers.length === 0) return "מרצה לא מזוהה";
    const first = lecturers[0];
    if (typeof first === "object" && first.name) return first.name;
    return "מרצה לא מזוהה";
  };

  const getFirstSentence = (description) => {
    if (!description) return "אין תיאור זמין";
    const firstSentence = description.split('.')[0];
    return firstSentence.length > 80
      ? firstSentence.substring(0, 80) + "..."
      : firstSentence + (description.includes('.') ? '.' : '...');
  };

  const handleCardClick = (e) => {
    if (onViewDetails) {
      onViewDetails(course);
    }
  };

  return (
    <div
      className="relative bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/40 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-emerald-100/50 hover:border-emerald-200 group hover:scale-105 transform cursor-pointer overflow-hidden"
      dir="rtl"
      onClick={handleCardClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700"></div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(course._id);
        }}
        className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 hover:bg-red-100/80 rounded-xl backdrop-blur-sm z-10 hover:scale-110 transform"
        title="הסר מהמעקב"
        aria-label="הסר מהמעקב"
      >
        <X className="w-5 h-5 text-red-500 hover:text-red-600" />
      </button>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
          {course.title}
        </h3>

        <div className="space-y-3 mb-6">
          {course.courseNumber && (
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100/70 text-emerald-800 backdrop-blur-sm">
                מספר קורס: {course.courseNumber}
              </span>
            </div>
          )}

          {getLecturerName(course.lecturers) && (
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100/70 text-blue-800 backdrop-blur-sm">
                מרצה: {getLecturerName(course.lecturers)}
              </span>
            </div>
          )}

          {course.credits && (
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100/70 text-purple-800 backdrop-blur-sm">
                {course.credits} נק״ז
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed text-right text-base font-medium">
            {getFirstSentence(course.description)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackedCourseCard;
