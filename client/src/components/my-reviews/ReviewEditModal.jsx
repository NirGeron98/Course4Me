import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Zap, 
  Clock, 
  Award, 
  MessageCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ThumbsUp,
  Save,
  Users,
  Star
} from 'lucide-react';

const ReviewEditModal = ({ review, user, onClose, onReviewUpdated }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (review.reviewType === 'course') {
      setFormData({
        interest: review.interest || 3,
        difficulty: review.difficulty || 3,
        investment: review.investment || 3,
        teachingQuality: review.teachingQuality || 3,
        recommendation: review.recommendation || 3,
        comment: review.comment || '',
        isAnonymous: Boolean(review.isAnonymous)
      });
    } else {
      setFormData({
        clarity: review.clarity || 3,
        responsiveness: review.responsiveness || 3,
        availability: review.availability || 3,
        organization: review.organization || 3,
        knowledge: review.knowledge || 3,
        comment: review.comment || '',
        isAnonymous: Boolean(review.isAnonymous)
      });
    }
  }, [review]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const endpoint = review.reviewType === 'course' 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${review._id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/${review._id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בעדכון הביקורת');
      }

      const updatedReview = await response.json();
      onReviewUpdated({ ...updatedReview, reviewType: review.reviewType });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingInput = (label, field, icon, color) => (
    <div>
      <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
        {icon}
        <span className="truncate">{label}</span>
      </label>
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFormData({ ...formData, [field]: value })}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 font-bold transition-all text-sm sm:text-base ${formData[field] >= value
              ? `bg-${color}-500 border-${color}-500 text-white`
              : `border-gray-300 text-${color}-500 hover:border-${color}-300`
            }`}
          >
            {value}
          </button>
        ))}
        <span className="mr-2 sm:mr-3 text-gray-600 font-medium text-sm sm:text-base whitespace-nowrap">{formData[field]}/5</span>
      </div>
    </div>
  );

  const AnonymousToggle = () => (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            {formData.isAnonymous ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">ביקורת אנונימית</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {formData.isAnonymous 
                ? 'הביקורת תופיע כ"משתמש אנונימי"' 
                : 'השם שלך יופיע בביקורת'
              }
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
          className={`relative inline-flex h-6 w-11 sm:h-8 sm:w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            formData.isAnonymous ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={formData.isAnonymous}
        >
          <span className="sr-only">
            {formData.isAnonymous ? 'הפוך לגלוי' : 'הפוך לאנונימי'}
          </span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 sm:h-7 sm:w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              formData.isAnonymous ? '-translate-x-5 sm:-translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <div className={`bg-gradient-to-r ${
          review.reviewType === 'course' 
            ? 'from-emerald-500 to-emerald-600' 
            : 'from-purple-500 to-purple-600'
        } text-white p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                עריכת {review.reviewType === 'course' ? 'ביקורת קורס' : 'ביקורת מרצה'}
              </h2>
              <p className={`${
                review.reviewType === 'course' ? 'text-emerald-100' : 'text-purple-100'
              } mt-1`}>
                {review.course?.title} • {review.lecturer?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-white hover:${
                review.reviewType === 'course' ? 'text-emerald-200' : 'text-purple-200'
              } transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Course Info Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{review.course?.title}</h3>
                <p className="text-gray-600">{review.lecturer?.name}</p>
              </div>
              {review.course?.courseNumber && (
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                  {review.course.courseNumber}
                </span>
              )}
              {review.course?.department && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                  {review.course.department}
                </span>
              )}
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                review.reviewType === 'course'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {review.reviewType === 'course' ? 'דירוג קורס' : 'דירוג מרצה'}
              </span>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <AnonymousToggle />

          {/* Rating Inputs - Different for course vs lecturer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {review.reviewType === 'course' ? (
              <>
                {renderRatingInput('עד כמה הקורס מעניין?', 'interest', <Heart className="w-5 h-5 text-red-500" />, 'red')}
                {renderRatingInput('עד כמה הקורס קשה?', 'difficulty', <Zap className="w-5 h-5 text-yellow-500" />, 'yellow')}
                {renderRatingInput('כמה זמן השקעת בקורס?', 'investment', <Clock className="w-5 h-5 text-orange-500" />, 'orange')}
                {renderRatingInput('איכות ההוראה', 'teachingQuality', <Award className="w-5 h-5 text-purple-500" />, 'purple')}
                {renderRatingInput('עד כמה היית ממליץ על הקורס?', 'recommendation', <ThumbsUp className="w-5 h-5 text-emerald-500" />, 'emerald')}
              </>
            ) : (
              <>
                {renderRatingInput('בהירות הוראה', 'clarity', <Eye className="w-5 h-5 text-blue-500" />, 'blue')}
                {renderRatingInput('התחשבות בסטודנטים', 'responsiveness', <Users className="w-5 h-5 text-green-500" />, 'green')}
                {renderRatingInput('זמינות', 'availability', <Clock className="w-5 h-5 text-orange-500" />, 'orange')}
                {renderRatingInput('ארגון השיעור', 'organization', <Zap className="w-5 h-5 text-red-500" />, 'red')}
                {renderRatingInput('עומק הידע', 'knowledge', <Star className="w-5 h-5 text-yellow-500" />, 'yellow')}
              </>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              הערות נוספות (אופציונלי)
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                review.reviewType === 'course' 
                  ? 'focus:ring-emerald-500' 
                  : 'focus:ring-purple-500'
              }`}
              rows="4"
              placeholder={`שתף את החוויה שלך מ${review.reviewType === 'course' ? 'הקורס' : 'המרצה'}...`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
              disabled={submitting}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 ${
                review.reviewType === 'course' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  מעדכן...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  שמור שינויים
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewEditModal;