import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '../common/EmptyState';

const CourseCarousel = ({ 
  courses, 
  visibleCourses, 
  carouselIndex, 
  onPrev, 
  onNext, 
  onCourseClick, 
  formatLecturersDisplay,
  setCarouselIndex 
}) => {
  const isEmpty = courses.length === 0;

  const renderPaginationDots = () => {
    if (courses.length <= 3) return null;

    const totalPages = Math.ceil(courses.length / 3);
    const currentPage = Math.floor(carouselIndex / 3);
    
    if (totalPages <= 8) {
      return Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => setCarouselIndex(index * 3)}
          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
            currentPage === index ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      ));
    }
    
    const dots = [];
    const maxVisibleDots = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisibleDots / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisibleDots - 1);
    
    if (endPage - startPage < maxVisibleDots - 1) {
      startPage = Math.max(0, endPage - maxVisibleDots + 1);
    }
    
    if (startPage > 0) {
      dots.push(
        <button
          key={0}
          onClick={() => setCarouselIndex(0)}
          className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"
        />
      );
      if (startPage > 1) {
        dots.push(
          <span key="start-ellipsis" className="text-gray-400 text-xs px-1 flex-shrink-0">
            ...
          </span>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      dots.push(
        <button
          key={i}
          onClick={() => setCarouselIndex(i * 3)}
          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
            currentPage === i ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      );
    }
    
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        dots.push(
          <span key="end-ellipsis" className="text-gray-400 text-xs px-1 flex-shrink-0">
            ...
          </span>
        );
      }
      dots.push(
        <button
          key={totalPages - 1}
          onClick={() => setCarouselIndex((totalPages - 1) * 3)}
          className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"
        />
      );
    }
    
    return dots;
  };

  return (
    <section className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 transition-shadow duration-ui hover:shadow-card-hover" aria-labelledby="courses-system-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="courses-system-heading" className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" />
          קורסים במערכת
        </h2>
        {!isEmpty && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrev}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={courses.length <= 3}
              aria-label="הקודם"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
              disabled={courses.length <= 3}
              aria-label="הבא"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          icon={BookOpen}
          title="אין קורסים להצגה"
          description="קורסים יופיעו כאן כאשר ייטענו ממערכת."
        />
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleCourses.map((course) => (
          <div
            key={course._id}
            onClick={() => onCourseClick(course)}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-card-lg p-4 border border-blue-200 hover:shadow-card-hover transition-shadow duration-200 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCourseClick(course); } }}
          >
            <h3 className="font-semibold text-gray-800 mb-1 truncate">{course.title}</h3>
            {Array.isArray(course.lecturers) && course.lecturers.length > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                מרצים: {formatLecturersDisplay(course.lecturers)}
              </p>
            )}

            {course.credits && (
              <span className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                {course.credits} נק״ז
              </span>
            )}
          </div>
        ))}
      </div>

      {courses.length > 3 && (
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

export default CourseCarousel;