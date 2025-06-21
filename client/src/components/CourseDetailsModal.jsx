import React from "react";
import { useNavigate } from "react-router-dom";
import { X, BookOpen, Building, Hash, FileText, Award, Users, ArrowLeft } from "lucide-react";

const CourseDetailsModal = ({ course, onClose }) => {
  const navigate = useNavigate();
  
  if (!course) return null;

  // Helper function to get lecturer name
  const getLecturerName = (lecturer) => {
    if (!lecturer) return null;
    if (typeof lecturer === 'string') return lecturer;
    if (typeof lecturer === 'object') return lecturer.name;
    return null;
  };

  // Helper function to get lecturer department
  const getLecturerDepartment = (lecturer) => {
    if (!lecturer || typeof lecturer !== 'object') return null;
    return lecturer.department;
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
    navigate(`/course/${course._id}`);
    onClose(); // Close modal after navigation
  };

  const allLecturers = getAllLecturers(course.lecturer || course.lecturers);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden relative transform transition-all duration-300 scale-100">

        {/* Elegant Header with integrated info */}
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white hover:text-emerald-200 transition-all duration-200 bg-white/20 rounded-full p-2 hover:bg-white/30 hover:scale-110"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Course Title and Main Info */}
          <div className="mr-14">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-white/25 rounded-2xl p-3 flex-shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-right">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                  {course.title || course.name || "שם הקורס"}
                </h2>

                {/* Compact info badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
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

                {/* Lecturers Display */}
                {allLecturers.length > 0 && (
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-white" />
                      <span className="text-white font-medium text-sm">
                        {allLecturers.length > 1 ? 'מרצים' : 'מרצה'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {allLecturers.map((lecturer, index) => (
                        <div
                          key={index}
                          className="flex flex-wrap items-center gap-3 text-white/90 text-sm bg-white/10 px-3 py-2 rounded-lg"
                        >
                          <span className="font-semibold">{getLecturerName(lecturer)}</span>
                          {getLecturerDepartment(lecturer) && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              {getLecturerDepartment(lecturer)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content - focused on description */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 220px)' }}>

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

          {/* Course Description - Main Focus */}
          {(course.description || course.summary) && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  תיאור הקורס
                </h3>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50">
                <div
                  className="text-gray-700 text-right leading-relaxed whitespace-pre-line overflow-y-auto prose prose-sm max-w-none"
                  style={{
                    maxHeight: '350px',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#10b981 transparent'
                  }}
                >
                  {course.description || course.summary || "אין תיאור זמין"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Elegant Footer */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-5">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all duration-200 text-sm border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
            >
              סגור
            </button>

            <button 
              onClick={handleGoToCourse}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
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