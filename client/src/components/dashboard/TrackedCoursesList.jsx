import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import EmptyState from '../common/EmptyState';

const TrackedCoursesList = ({
  trackedCourses,
  onCourseClick,
  formatLecturersDisplay,
  visibleCourses,
  onPrev,
  onNext,
  setCarouselIndex,
  carouselIndex,
  emptyActionLabel,
  onEmptyAction,
}) => {
  const isEmpty = trackedCourses.length === 0;

  const renderPaginationDots = () => {
    if (trackedCourses.length <= 3) return null;

    const totalPages = Math.ceil(trackedCourses.length / 3);
    const currentPage = Math.floor(carouselIndex / 3);

    return Array.from({ length: totalPages }).map((_, index) => (
      <button
        key={index}
        onClick={() => setCarouselIndex(index * 3)}
        className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
          currentPage === index ? 'bg-emerald-600' : 'bg-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 transition-shadow duration-ui hover:shadow-card-hover" aria-labelledby="tracked-courses-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="tracked-courses-heading" className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-emerald-600" aria-hidden="true" />
          הקורסים שלי
        </h2>
        {!isEmpty && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrev}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={trackedCourses.length <= 3}
              aria-label="הקודם"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={trackedCourses.length <= 3}
              aria-label="הבא"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Heart}
          title="עדיין אין קורסים במעקב"
          description="הוסף קורסים למעקב כדי לראות אותם כאן ולקבל עדכונים."
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleCourses.map((tracked, index) => {
              const course = tracked?.course;
              if (!course) return null;

              return (
                <div
                  key={course._id || index}
                  onClick={() => onCourseClick(tracked)}
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-card-lg p-4 border border-emerald-200 hover:shadow-card-hover transition-shadow duration-200 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCourseClick(tracked); } }}
                >
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">{course.title}</h3>
                  {Array.isArray(course.lecturers) && course.lecturers.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      מרצים: {formatLecturersDisplay(course.lecturers, 3, "bg-emerald-200 text-emerald-800")}
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
          {trackedCourses.length > 3 && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 max-w-full overflow-hidden px-4">
                {renderPaginationDots()}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default TrackedCoursesList;
