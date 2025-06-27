import React from 'react';
import { Users, ChevronLeft, ChevronRight, User, Building } from 'lucide-react';

const LecturerCarousel = ({ 
  lecturers, 
  visibleLecturers, 
  carouselIndex, 
  onPrev, 
  onNext,
  setCarouselIndex 
}) => {
  if (lecturers.length === 0) return null;

  const renderPaginationDots = () => {
    if (lecturers.length <= 3) return null;

    const totalPages = Math.ceil(lecturers.length / 3);
    const currentPage = Math.floor(carouselIndex / 3);
    
    if (totalPages <= 8) {
      return Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => setCarouselIndex(index * 3)}
          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
            currentPage === index ? 'bg-purple-600' : 'bg-gray-300'
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
            currentPage === i ? 'bg-purple-600' : 'bg-gray-300'
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
    <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-600" />
          מרצים במערכת
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={lecturers.length <= 3}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onNext}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={lecturers.length <= 3}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleLecturers.map((lecturer) => (
          <div
            key={lecturer._id}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-200 rounded-full p-2">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                {lecturer.name}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-500" />
                <span>{lecturer.department}</span>
              </div>
              <p className="truncate">{lecturer.email}</p>
            </div>
          </div>
        ))}
      </div>

      {lecturers.length > 3 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 max-w-full overflow-hidden px-4">
            {renderPaginationDots()}
          </div>
        </div>
      )}
    </section>
  );
};

export default LecturerCarousel;