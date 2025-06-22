import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Users,
  Eye,
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
    clarity: 5,
    responsiveness: 5,
    availability: 3,
    organization: 5,
    knowledge: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingReview) {
      setFormData({
        course: existingReview.course._id,
        clarity: existingReview.clarity,
        responsiveness: existingReview.responsiveness,
        availability: existingReview.availability,
        organization: existingReview.organization,
        knowledge: existingReview.knowledge,
        comment: existingReview.comment || '',
      });
    }
  }, [existingReview]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses', {
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
          throw new Error('Failed to fetch courses');
        }
      } catch (err) {
        setError('שגיאה בטעינת רשימת הקורסים');
        console.error('Error fetching courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [lecturerId, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.course && !existingReview) {
      setError('יש לבחור קורס');
      setSubmitting(false);
      return;
    }

    try {
      const url = existingReview
        ? `http://localhost:5000/api/lecturer-reviews/${existingReview._id}`
        : 'http://localhost:5000/api/lecturer-reviews';

      const method = existingReview ? 'PUT' : 'POST';

      const requestData = existingReview
        ? { ...formData, lecturer: undefined, course: undefined }
        : { ...formData, lecturer: lecturerId };

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
        throw new Error(errorData.message || 'שגיאה בשליחת הביקורת');
      }

      const newReview = await response.json();
      onReviewSubmitted(newReview);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingInput = (label, field, icon, color) => (
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
                ? `bg-${color}-500 border-${color}-500 text-white`
                : `border-gray-300 text-${color}-500 hover:border-${color}-300`
            }`}
          >
            {value}
          </button>
        ))}
        <span className="mr-3 text-gray-600 font-medium">
          {formData[field]}/5
        </span>
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
              {error}
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
                <div className="text-center py-4 text-gray-500">
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
              disabled={submitting || (!formData.course && !existingReview)}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
