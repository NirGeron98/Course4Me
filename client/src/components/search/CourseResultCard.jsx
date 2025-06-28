import React from 'react';
import { BookOpen, Building, Hash, Star, Eye, Users } from 'lucide-react';

const CourseResultCard = ({ course, onSelect }) => {
  // Safety check for course object
  if (!course) {
    return null;
  }

  // Render stars function for rating display
  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  // Format department display - handle both string and array formats
  const formatDepartments = (department) => {
    if (!department) return '';
    
    if (Array.isArray(department)) {
      return department.join(', ');
    }
    
    return department;
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {course?.title || 'שם קורס לא זמין'}
            </h4>
            
            {/* Course Info Pills */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
              {course?.courseNumber && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  <span className="font-medium">{course.courseNumber}</span>
                </div>
              )}
              {course?.credits && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <span className="font-medium">{course.credits} נק"ז</span>
                </div>
              )}
              {course?.academicInstitution && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  <Building className="w-3 h-3" />
                  <span className="font-medium">{course.academicInstitution}</span>
                </div>
              )}
            </div>

            {/* Department */}
            {course?.department && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Building className="w-4 h-4 text-gray-400" />
                <span>{formatDepartments(course.department)}</span>
              </div>
            )}

            {/* Lecturers */}
            {course?.lecturers && course.lecturers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="flex flex-wrap gap-1">
                  {course.lecturers.slice(0, 5).map((lecturer, index) => (
                    <span key={index} className="text-blue-600 hover:text-blue-700 transition-colors">
                      {typeof lecturer === 'object' && lecturer.name ? lecturer.name : lecturer}
                      {index < Math.min(4, course.lecturers.length - 1) ? ',' : ''}
                    </span>
                  ))}
                  {course.lecturers.length > 5 && (
                    <span className="text-gray-500 font-medium">
                      +{course.lecturers.length - 5} מרצים נוספים
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Rating */}
            {course?.averageRating && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  {renderStars(course.averageRating)}
                </div>
                <span className="text-sm font-medium text-yellow-600">
                  {course.averageRating.toFixed(1)}
                </span>
                {course?.ratingsCount && (
                  <span className="text-xs text-gray-500">
                    ({course.ratingsCount} ביקורות)
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {course?.description && (
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {course.description.length > 120
                  ? `${course.description.substring(0, 120)}...`
                  : course.description}
              </p>
            )}

            {/* Prerequisites */}
            {course?.prerequisites && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-1">דרישות קדם:</div>
                <div className="flex flex-wrap gap-1">
                  {course.prerequisites.split(',').slice(0, 3).map((prereq, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {prereq.trim()}
                    </span>
                  ))}
                  {course.prerequisites.split(',').length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
                      +{course.prerequisites.split(',').length - 3} נוספים
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onSelect}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Eye className="w-4 h-4" />
          פרטים מלאים
        </button>
      </div>
    </div>
  );
};

export default CourseResultCard;