import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, BookOpen, Building, Hash, FileText, Award, Users, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const CourseDetailsModal = ({ course, onClose }) => {
  const navigate = useNavigate();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!course) return null;

  // Helper function to get lecturer name
  const getLecturerName = (lecturer) => {
    if (!lecturer) return null;
    if (typeof lecturer === 'string') return lecturer;
    if (typeof lecturer === 'object') return lecturer.name;
    return null;
  };

  // Helper function to get multiple lecturers if array
  const getAllLecturers = (lecturers) => {
    if (!lecturers) return [];
    if (Array.isArray(lecturers)) return lecturers;
    return [lecturers];
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Navigate to course page
  const handleGoToCourse = () => {
    navigate(`/course/${course.courseNumber}`);
    onClose(); // Close modal after navigation
  };

  // Function to truncate description
  const truncateDescription = (text, maxLength = 300) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    
    // Find the last space before maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + "..." : truncated + "...";
  };

  const allLecturers = getAllLecturers(course.lecturer || course.lecturers);
  const description = course.description || course.summary || "";
  const shouldTruncate = description.length > 300;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdropEnter"
      onClick={handleBackdropClick}
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden relative flex flex-col animate-modalEnter">

        {/* Elegant Header with integrated info */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-6 relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 text-white hover:text-emerald-200 transition-all duration-200 bg-white/20 rounded-full p-2 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Course Title and Main Info */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white/25 rounded-2xl p-2 flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 id="course-modal-title" className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                {course.title || course.name || "שם הקורס"}
              </h2>
            </div>

            {/* Compact info badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {/* Course Number */}
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                <Hash className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm">
                  {course.courseNumber || course.code || "לא זמין"}
                </span>
              </div>

              {/* Credits */}
              {course.credits && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Award className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">
                    {course.credits} נק"ז
                  </span>
                </div>
              )}

              {/* Academic Institution */}
              {(course.academicInstitution || course.university) && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Building className="w-4 h-4 text-white" />
                  <span className="text-white font-medium text-sm">
                    {course.academicInstitution || course.university}
                  </span>
                </div>
              )}
            </div>

            {/* Lecturers Display - Compact and Centered */}
            {allLecturers.length > 0 && (
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="bg-white/20 rounded-lg p-1.5">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-base">
                    {allLecturers.length > 1 ? 'מרצים' : 'מרצה'}
                  </h3>
                </div>

                <div className="space-y-1">
                  {/* Display up to 3 lecturers in a vertical list */}
                  {allLecturers.slice(0, 3).map((lecturer, index) => (
                    <div key={index} className="text-center">
                      <div className="font-semibold text-white text-base">
                        {getLecturerName(lecturer)}
                      </div>
                    </div>
                  ))}

                  {/* Show "+X נוספים" in a separate box */}
                  {allLecturers.length > 3 && (
                    <div className="mt-3 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-center">
                      <span className="text-white text-sm font-medium">
                        +{allLecturers.length - 3} נוספים
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content - with controlled overflow */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Secondary Info Row - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Department */}
            {course.department && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">מחלקה</h3>
                </div>
                <p className="text-gray-700 text-right font-medium">{course.department}</p>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-100 rounded-lg p-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">דרישות קדם</h3>
                </div>
                <p className="text-gray-700 text-right font-medium text-sm">
                  {course.prerequisites}
                </p>
              </div>
            )}
          </div>

          {/* Course Description - Main Focus with Controlled Length */}
          {description && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  תיאור הקורס
                </h3>
              </div>

              {/* Description Text with Truncation */}
              <div className="relative">
                <p className="text-gray-700 text-right leading-relaxed whitespace-pre-line text-[15px] md:text-[16px] lg:text-[17px] font-medium">
                  {isDescriptionExpanded || !shouldTruncate 
                    ? description 
                    : truncateDescription(description)
                  }
                </p>

                {/* Expand/Collapse Button */}
                {shouldTruncate && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                      <span>
                        {isDescriptionExpanded ? "הצג פחות" : "הצג עוד"}
                      </span>
                      {isDescriptionExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Elegant Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-5 flex-shrink-0">
          <div className="flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all duration-200 text-sm border border-gray-200 hover:border-gray-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              סגור
            </button>

            <button
              type="button"
              onClick={handleGoToCourse}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-200 text-sm shadow-md hover:shadow-lg flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <span>מעבר לדף הקורס</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetailsModal;