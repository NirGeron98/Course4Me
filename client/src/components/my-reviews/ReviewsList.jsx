import React from 'react';
import { 
  MessageCircle, 
  Star, 
  User, 
  BookOpen, 
  Building, 
  Hash,
  Calendar,
  Eye,
  EyeOff,
  Heart,
  Zap,
  Clock,
  Award,
  ThumbsUp
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';

const ReviewsList = ({ reviews, onEditClick, onDeleteClick }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          לא נמצאו ביקורות
        </h3>
        <p className="text-gray-600">
          נסה לשנות את הסינונים או לכתוב ביקורת ראשונה
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div 
          key={review._id} 
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          {/* Header with Course Info and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Course and Department Info */}
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  {review.course?.title || 'קורס לא ידוע'}
                </h3>
                {review.course?.courseNumber && (
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-sm">
                    <Hash className="w-3 h-3" />
                    {review.course.courseNumber}
                  </span>
                )}
                {review.course?.department && (
                  <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm">
                    <Building className="w-3 h-3" />
                    {review.course.department}
                  </span>
                )}
              </div>

              {/* Lecturer and Date Info */}
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  מרצה: {review.lecturer?.name || 'מרצה לא ידוע'}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(review.createdAt)}
                </span>
                <span className="flex items-center gap-2">
                  {review.isAnonymous ? (
                    <>
                      <EyeOff className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600 font-medium">ביקורת אנונימית</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span>ביקורת גלויה</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEditClick(review)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                title="ערוך ביקורת"
              >
                <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                <span className="hidden sm:inline">ערוך</span>
              </button>
              <button
                onClick={() => onDeleteClick(review)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                title="מחק ביקורת"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span className="hidden sm:inline">מחק</span>
              </button>
            </div>
          </div>

          {/* Rating Display */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-gray-800">דירוג כללי:</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {renderStars(parseFloat(review.recommendation || 0))}
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {review.recommendation || 0}/5.0
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Ratings Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">עניין</span>
              </div>
              <div className="text-lg font-bold text-red-600">{review.interest || 0}/5</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">קושי</span>
              </div>
              <div className="text-lg font-bold text-yellow-600">{review.difficulty || 0}/5</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">השקעה</span>
              </div>
              <div className="text-lg font-bold text-orange-600">{review.investment || 0}/5</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">איכות הוראה</span>
              </div>
              <div className="text-lg font-bold text-purple-600">{review.teachingQuality || 0}/5</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-700">המלצה</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">{review.recommendation || 0}/5</div>
            </div>
          </div>

          {/* Comment Section */}
          {review.comment && (
            <div className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
              <span className="absolute top-2 right-4 text-emerald-300 text-3xl leading-none select-none font-serif">"</span>
              <p className="text-gray-800 text-base leading-relaxed font-medium italic px-4">
                {review.comment}
              </p>
              <span className="absolute bottom-2 left-4 text-emerald-300 text-3xl leading-none select-none font-serif">"</span>
            </div>
          )}

          {/* Additional Info Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>
              נוצר ב-{formatDate(review.createdAt)}
            </span>
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <span>
                עודכן ב-{formatDate(review.updatedAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;