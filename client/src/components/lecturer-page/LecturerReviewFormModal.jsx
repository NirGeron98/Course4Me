import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Users,
  Eye,
  EyeOff,
  Clock,
  Zap,
  Award,
  MessageCircle,
  Loader2,
} from 'lucide-react';

const LecturerReviewFormModal = ({
  lecturerId,
  lecturerName,
  user,
  onClose,
  onReviewSubmitted,
  existingReview = null,
}) => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({
    course: '',
    clarity: 3,
    responsiveness: 3,
    availability: 3,
    organization: 3,
    knowledge: 3,
    comment: '',
    isAnonymous: false // New field for anonymous review
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      console.log('Loading existing lecturer review:', existingReview); // Debug log
      setFormData({
        course: existingReview.course?._id || '',
        clarity: existingReview.clarity,
        responsiveness: existingReview.responsiveness,
        availability: existingReview.availability,
        organization: existingReview.organization,
        knowledge: existingReview.knowledge,
        comment: existingReview.comment || '',
        isAnonymous: Boolean(existingReview.isAnonymous) // Ensure it's a boolean
      });
    }
  }, [existingReview]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });


        if (response.ok) {
          const allCourses = await response.json();
          
          const lecturerCourses = allCourses.filter(
            (course) =>
              course.lecturers &&
              course.lecturers.some((lec) => lec._id === lecturerId)
          );
          
          setCourses(lecturerCourses);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch courses:', errorData);
          throw new Error(errorData.message || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('שגיאה בטעינת רשימת הקורסים');
      } finally {
        setLoadingCourses(false);
      }
    };

    if (!existingReview) {
      fetchCourses();
    } else {
      setLoadingCourses(false);
    }
  }, [lecturerId, user.token, existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!existingReview && !formData.course) {
      setError('יש לבחור קורס');
      setSubmitting(false);
      return;
    }

    // Validate ratings
    const requiredRatings = ['clarity', 'responsiveness', 'availability', 'organization', 'knowledge'];
    for (const rating of requiredRatings) {
      if (!formData[rating] || formData[rating] < 1 || formData[rating] > 5) {
        setError(`הערכה עבור ${rating} חייבת להיות בין 1 ל-5`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const url = existingReview
        ? `${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/${existingReview._id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews`;

      const method = existingReview ? 'PUT' : 'POST';

      let requestData;
      if (existingReview) {
        // For updates, don't send lecturer and course IDs
        requestData = {
          clarity: parseInt(formData.clarity),
          responsiveness: parseInt(formData.responsiveness),
          availability: parseInt(formData.availability),
          organization: parseInt(formData.organization),
          knowledge: parseInt(formData.knowledge),
          comment: formData.comment?.trim() || '',
          isAnonymous: formData.isAnonymous
        };
      } else {
        // For new reviews, include lecturer and course IDs
        requestData = {
          lecturer: lecturerId,
          course: formData.course,
          clarity: parseInt(formData.clarity),
          responsiveness: parseInt(formData.responsiveness),
          availability: parseInt(formData.availability),
          organization: parseInt(formData.organization),
          knowledge: parseInt(formData.knowledge),
          comment: formData.comment?.trim() || '',
          isAnonymous: formData.isAnonymous
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'שגיאה בשליחת הביקורת');
      }

      const newReview = await response.json();
      onReviewSubmitted(newReview);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'שגיאה בשליחת הביקורת');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingInput = (label, field, icon, colorType) => {
    // Define color classes for each type
    const colorClasses = {
      blue: {
        selected: 'bg-blue-500 border-blue-500 text-white',
        unselected: 'border-gray-300 text-blue-500 hover:border-blue-300'
      },
      green: {
        selected: 'bg-green-500 border-green-500 text-white',
        unselected: 'border-gray-300 text-green-500 hover:border-green-300'
      },
      orange: {
        selected: 'bg-orange-500 border-orange-500 text-white',
        unselected: 'border-gray-300 text-orange-500 hover:border-orange-300'
      },
      red: {
        selected: 'bg-red-500 border-red-500 text-white',
        unselected: 'border-gray-300 text-red-500 hover:border-red-300'
      },
      yellow: {
        selected: 'bg-yellow-500 border-yellow-500 text-white',
        unselected: 'border-gray-300 text-yellow-500 hover:border-yellow-300'
      }
    };

    const colors = colorClasses[colorType];

    return (
      <div>
        <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
          {icon}
          {label}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData({ ...formData, [field]: value })}
              className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${
                formData[field] >= value
                  ? colors.selected
                  : colors.unselected
              }`}
            >
              {value}
            </button>
          ))}
          <span className="mr-3 text-gray-600 font-medium">
            {formData[field]}/5.0
          </span>
        </div>
      </div>
    );
  };

  // Styled Toggle component for anonymous review
  const AnonymousToggle = () => (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    {formData.isAnonymous ? (
                        <EyeOff className="w-5 h-5 text-blue-600" />
                    ) : (
                        <Eye className="w-5 h-5 text-blue-600" />
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">ביקורת אנונימית</h3>
                    <p className="text-sm text-gray-600">
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
                className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.isAnonymous ? '-translate-x-6' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {existingReview ? 'עריכת ביקורת מרצה' : 'כתיבת ביקורת מרצה'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-purple-100 mt-2">{lecturerName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>שגיאה:</strong> {error}
            </div>
          )}

          {!existingReview && (
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                בחר קורס *
              </label>
              {loadingCourses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="mr-2 text-gray-600">טוען קורסים...</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                  לא נמצאו קורסים עבור מרצה זה
                </div>
              ) : (
                <select
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">בחר קורס...</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.courseNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {existingReview && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Award className="w-5 h-5" />
                <span className="font-medium">
                  קורס: {existingReview.course?.title} ({existingReview.course?.courseNumber})
                </span>
              </div>
            </div>
          )}

          {/* Anonymous Toggle */}
          <AnonymousToggle />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {renderRatingInput('בהירות הוראה', 'clarity', <Eye className="w-5 h-5 text-blue-500" />, 'blue')}
            {renderRatingInput('התחשבות בסטודנטים', 'responsiveness', <Users className="w-5 h-5 text-green-500" />, 'green')}
            {renderRatingInput('זמינות', 'availability', <Clock className="w-5 h-5 text-orange-500" />, 'orange')}
            {renderRatingInput('ארגון השיעור', 'organization', <Zap className="w-5 h-5 text-red-500" />, 'red')}
            {renderRatingInput('עומק הידע', 'knowledge', <Star className="w-5 h-5 text-yellow-500" />, 'yellow')}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              הערות נוספות (אופציונלי)
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="שתף את החוויה שלך מהמרצה..."
            />
          </div>

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
              disabled={submitting || (!existingReview && !formData.course)}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {existingReview ? 'מעדכן...' : 'שולח...'}
                </>
              ) : existingReview ? (
                'עדכן ביקורת'
              ) : (
                'שלח ביקורת'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LecturerReviewFormModal;