import React from "react";
import { Eye, Plus, User, Building, Hash, BookOpen } from "lucide-react";

const CourseItem = ({ course, onViewDetails, onAdd, isAdding }) => {
  // Helper function to get lecturer name
  const getLecturerName = (lecturer) => {
    if (!lecturer) return null;
    if (typeof lecturer === 'string') return lecturer;
    if (typeof lecturer === 'object') return lecturer.name;
    return null;
  };

  return (
    <div className="group bg-white hover:bg-emerald-50 border-2 border-gray-100 hover:border-emerald-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg" dir="rtl">
      <div className="flex items-center justify-between">
        
        {/* Course Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <div className="bg-emerald-100 group-hover:bg-emerald-200 rounded-full p-2 transition-colors">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            
            <div className="flex-1 text-right mr-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors">
                {course.title || course.name || "שם הקורס"}
              </h3>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {/* Course Number */}
                {(course.courseNumber || course.code) && (
                  <div className="flex items-center space-x-1">
                    <Hash className="w-4 h-4 text-gray-400 ml-1" />
                    <span>{course.courseNumber || course.code}</span>
                  </div>
                )}
                
                {/* Lecturer */}
                {getLecturerName(course.lecturer) && (
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400 ml-1" />
                    <span>{getLecturerName(course.lecturer)}</span>
                  </div>
                )}
                
                {/* Department */}
                {course.department && (
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4 text-gray-400 ml-1" />
                    <span>{course.department}</span>
                  </div>
                )}
              </div>

              {/* Credits Badge */}
              {course.credits && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.credits} נק״ז
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mr-4">
          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(course);
            }}
            disabled={isAdding}
            className="group/btn flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="הצג פרטים"
            aria-label="הצג פרטים"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Add Course Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(course);
            }}
            disabled={isAdding}
            className="group/btn flex items-center justify-center w-10 h-10 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 hover:text-emerald-700 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="הוסף למעקב"
            aria-label="הוסף למעקב"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Course Description Preview */}
      {course.description && (
        <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-emerald-100">
          <p className="text-sm text-gray-600 text-right line-clamp-2 leading-relaxed">
            {course.description.length > 120 
              ? `${course.description.substring(0, 120)}...` 
              : course.description
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseItem;