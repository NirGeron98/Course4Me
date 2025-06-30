import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, User, Building, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLecturerSlug } from '../../utils/slugUtils';

const LecturerCarousel = ({
  lecturers,
  visibleLecturers,
  carouselIndex,
  onPrev,
  onNext,
  setCarouselIndex
}) => {
  const navigate = useNavigate();
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (lecturers.length === 0) return null;

  const handleLecturerClick = (lecturer) => {
    setSelectedLecturer(lecturer);
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (selectedLecturer) {
      navigate(`/lecturer/${getLecturerSlug(selectedLecturer)}`);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLecturer(null);
  };

  const renderPaginationDots = () => {
    if (lecturers.length <= 3) return null;

    const totalPages = Math.ceil(lecturers.length / 3);
    const currentPage = Math.floor(carouselIndex / 3);

    if (totalPages <= 8) {
      return Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => setCarouselIndex(index * 3)}
          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${currentPage === index ? 'bg-purple-600' : 'bg-gray-300'
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
          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${currentPage === i ? 'bg-purple-600' : 'bg-gray-300'
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
    <>
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
              onClick={() => handleLecturerClick(lecturer)}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group hover:scale-105 transform duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-200 rounded-full p-2 group-hover:bg-purple-300 transition-colors">
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

              {/* Click indicator */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  לחץ לצפייה בפרופיל
                </span>
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

      {/* Confirmation Modal */}
      {showModal && selectedLecturer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">צפייה בפרופיל מרצה</h3>
              </div>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{selectedLecturer.name}</h4>
                  <p className="text-gray-600 text-sm">{selectedLecturer.department}</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <p className="text-gray-700 text-center">
                  האם תרצה לעבור לעמוד הפרופיל של המרצה <span className="font-semibold">{selectedLecturer.name}</span>?
                </p>
                <p className="text-gray-500 text-sm text-center mt-2">
                  בעמוד הפרופיל תוכל לראות פרטים נוספים, ביקורות ודירוגים
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  ביטול
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  עבור לפרופיל
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LecturerCarousel;