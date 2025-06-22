import React from 'react';
import { Plus, MessageCircle, Loader2, Star } from 'lucide-react';

const LecturerReviewsSection = ({
  reviews,
  courses,
  filterCourse,
  setFilterCourse,
  sortBy,
  setSortBy,
  filteredReviews,
  reviewsLoading,
  onWriteReview,
  onEditReview,
  user,
}) => {
  // Render star rating icons
  const renderStars = (rating, size = 'w-4 h-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className={`${size} fill-yellow-200 text-yellow-400`} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-purple-500" />
          ביקורות סטודנטים ({reviews.length})
        </h2>

        <button
          onClick={onWriteReview}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          כתוב ביקורת
        </button>
      </div>

      {/* Filters */}
      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">כל הקורסים</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">הכי חדש</option>
            <option value="oldest">הכי ישן</option>
            <option value="highest">ציון גבוה</option>
            <option value="lowest">ציון נמוך</option>
          </select>
        </div>
      )}

      {/* Loading state */}
      {reviewsLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">טוען ביקורות...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {filterCourse !== 'all' ? 'אין ביקורות לקורס זה' : 'אין ביקורות עדיין'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filterCourse !== 'all'
              ? 'נסה לבחור קורס אחר או כתוב ביקורת ראשונה.'
              : 'היה הראשון לכתוב ביקורת על המרצה.'}
          </p>
          <button
            onClick={onWriteReview}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            כתוב ביקורת ראשונה
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-800">
                      {review.user.fullName}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {review.course.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {renderStars(parseFloat(review.overallRating))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {review.overallRating}/5
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>

                {review.user._id === user.user._id && (
                  <button
                    onClick={() => onEditReview(review)}
                    className="text-purple-500 hover:text-purple-600 text-sm font-medium"
                  >
                    ערוך
                  </button>
                )}
              </div>

              {/* Comment box */}
              {review.comment && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerReviewsSection;
