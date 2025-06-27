import React from 'react';
import { BookOpen } from 'lucide-react';

const TrackedCoursesList = ({ trackedCourses, onCourseClick, formatLecturersDisplay }) => {
  if (trackedCourses.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-emerald-600" />
        הקורסים שלי
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trackedCourses.slice(0, 6).map((tracked, index) => {
          const course = tracked?.course;
          if (!course) return null;

          return (
            <div
              key={course._id || index}
              onClick={() => onCourseClick(tracked)}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 hover:shadow-md transition-all cursor-pointer"
            >
              <h3 className="font-semibold text-gray-800 mb-1 truncate">{course.title}</h3>
              {Array.isArray(course.lecturers) && course.lecturers.length > 0 && (
                <p className="text-sm text-gray-600 mb-2">
                  מרצים: {formatLecturersDisplay(course.lecturers)}
                </p>
              )}

              {course.credits && (
                <span className="inline-block bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  {course.credits} נק״ז
                </span>
              )}
            </div>
          );
        })}
      </div>
      {trackedCourses.length > 6 && (
        <div className="mt-4 text-center">
          <button className="text-emerald-600 hover:text-emerald-700 font-medium">
            הצג עוד +{trackedCourses.length - 6}
          </button>
        </div>
      )}
    </section>
  );
};

export default TrackedCoursesList;