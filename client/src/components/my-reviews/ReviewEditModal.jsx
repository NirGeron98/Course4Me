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
  Star,
  Plus,
  User
} from 'lucide-react';
import Select from 'react-select';

const ReviewEditModal = ({ review, user, onClose, onReviewUpdated }) => {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // New state for multi-select data
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showDepartmentLecturers, setShowDepartmentLecturers] = useState(false);
  const [departmentLecturers, setDepartmentLecturers] = useState([]);
  const [loadingDepartmentLecturers, setLoadingDepartmentLecturers] = useState(false);
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    if (review.reviewType === 'course') {
      // Handle both single lecturer and multiple lecturers
      let selectedLecturers = [];
      if (review.lecturers && review.lecturers.length > 0) {
        selectedLecturers = review.lecturers.map(lec => 
          typeof lec === 'object' ? lec._id : lec
        );
      } else if (review.lecturer) {
        selectedLecturers = [typeof review.lecturer === 'object' 
          ? review.lecturer._id 
          : review.lecturer];
      }
      
      setFormData({
        lecturers: selectedLecturers,
        lecturer: selectedLecturers[0] || '', // For backward compatibility
        interest: review.interest || 3,
        difficulty: review.difficulty || 3,
        workload: review.workload || 3,
        teachingQuality: review.teachingQuality || 3,
        recommendation: review.recommendation || 3,
        comment: review.comment || '',
        isAnonymous: Boolean(review.isAnonymous)
      });
    } else {
      // Handle both old format (single course) and new format (multiple courses)
      let coursesArray = [];
      if (review.courses && Array.isArray(review.courses)) {
        coursesArray = review.courses.map(course => course._id || course);
      } else if (review.course) {
        coursesArray = [review.course._id || review.course];
      }
      
      setFormData({
        courses: coursesArray,
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

  // Fetch lecturers for course reviews
  useEffect(() => {
    if (review.reviewType === 'course' && review.course) {
      const fetchLecturers = async () => {
        setLoadingLecturers(true);
        try {
          const courseResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${review.course._id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          });

          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            setLecturers(courseData.lecturers || []);
            setCourseData(courseData); // Save course data for later use
          } else {
            throw new Error('Failed to fetch course lecturers');
          }
        } catch (err) {
          setError('שגיאה בטעינת רשימת המרצים');
        } finally {
          setLoadingLecturers(false);
        }
      };

      fetchLecturers();
    }
  }, [review, user.token]);

  // Fetch courses for lecturer reviews
  useEffect(() => {
    if (review.reviewType === 'lecturer' && review.lecturer) {
      const fetchCourses = async () => {
        setLoadingCourses(true);
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
                course.lecturers.some((lec) => lec._id === review.lecturer._id)
            );
            setCourses(lecturerCourses);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch courses');
          }
        } catch (err) {
          setError('שגיאה בטעינת רשימת הקורסים');
        } finally {
          setLoadingCourses(false);
        }
      };

      fetchCourses();
    }
  }, [review, user.token]);

  const fetchDepartmentLecturers = async () => {
    if (!courseData?.department) return;
    
    setLoadingDepartmentLecturers(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/lecturers/by-department/${encodeURIComponent(courseData.department)}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const departmentLecturers = await response.json();
        // Filter out lecturers already in the course
        const existingLecturerIds = lecturers.map(l => l._id);
        const filteredLecturers = departmentLecturers.filter(
          lecturer => !existingLecturerIds.includes(lecturer._id)
        );
        setDepartmentLecturers(filteredLecturers);
      } else {
        throw new Error('Failed to fetch department lecturers');
      }
    } catch (error) {
      console.error('Error fetching department lecturers:', error);
      setError('שגיאה בטעינת מרצי המחלקה');
    } finally {
      setLoadingDepartmentLecturers(false);
    }
  };

  const handleShowDepartmentLecturers = () => {
    setShowDepartmentLecturers(true);
    fetchDepartmentLecturers();
  };

  const handleAddLecturerFromDepartment = async (lecturer) => {
    try {
      // Add lecturer to course
      const addResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/courses/${review.course._id}/add-lecturer`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lecturerId: lecturer._id })
        }
      );

      if (addResponse.ok) {
        const result = await addResponse.json();
        // Update lecturers list
        setLecturers(prev => [...prev, lecturer]);
        // Remove from department lecturers
        setDepartmentLecturers(prev => prev.filter(l => l._id !== lecturer._id));
        
        // Auto-select the new lecturer
        setFormData(prev => ({
          ...prev,
          lecturers: [...prev.lecturers, lecturer._id],
          lecturer: prev.lecturers.length === 0 ? lecturer._id : prev.lecturer
        }));
      } else {
        throw new Error('Failed to add lecturer to course');
      }
    } catch (error) {
      console.error('Error adding lecturer:', error);
      setError('שגיאה בהוספת המרצה לקורס');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation for course reviews
    if (review.reviewType === 'course' && (!formData.lecturers || formData.lecturers.length === 0)) {
      setError('יש לבחור לפחות מרצה אחד');
      setSubmitting(false);
      return;
    }

    // Validation for lecturer reviews
    if (review.reviewType === 'lecturer' && (!formData.courses || formData.courses.length === 0)) {
      setError('יש לבחור לפחות קורס אחד');
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = review.reviewType === 'course' 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/reviews/${review._id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/${review._id}`;

      // Prepare request data based on review type
      let requestData;
      if (review.reviewType === 'course') {
        requestData = {
          lecturers: formData.lecturers,
          lecturer: formData.lecturers[0] || formData.lecturer, // For backward compatibility
          interest: Number(formData.interest),
          difficulty: Number(formData.difficulty),
          workload: Number(formData.workload),
          teachingQuality: Number(formData.teachingQuality),
          recommendation: Number(formData.recommendation),
          comment: String(formData.comment || '').trim(),
          isAnonymous: Boolean(formData.isAnonymous)
        };
      } else {
        requestData = {
          courses: formData.courses,
          clarity: parseInt(formData.clarity),
          responsiveness: parseInt(formData.responsiveness),
          availability: parseInt(formData.availability),
          organization: parseInt(formData.organization),
          knowledge: parseInt(formData.knowledge),
          comment: String(formData.comment || '').trim(),
          isAnonymous: Boolean(formData.isAnonymous)
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בעדכון הביקורת');
      }

      const updatedReview = await response.json();
      
      // Signal that a review was updated
      localStorage.setItem('reviewUpdated', 'true');
      sessionStorage.setItem('refreshMyReviews', 'true');
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('reviewUpdated'));
      
      onReviewUpdated({ ...updatedReview, reviewType: review.reviewType });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Multi-select styling
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: `1px solid ${state.isFocused ? (review.reviewType === 'course' ? '#10b981' : '#8b5cf6') : '#d1d5db'}`,
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: state.isFocused ? `0 0 0 2px ${review.reviewType === 'course' ? '#10b98120' : '#8b5cf620'}` : 'none',
      '&:hover': {
        border: `1px solid ${review.reviewType === 'course' ? '#10b981' : '#8b5cf6'}`,
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: review.reviewType === 'course' ? '#dcfce7' : '#f3e8ff',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: review.reviewType === 'course' ? '#059669' : '#7c3aed',
      fontWeight: '500',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: review.reviewType === 'course' ? '#059669' : '#7c3aed',
      '&:hover': {
        backgroundColor: review.reviewType === 'course' ? '#10b981' : '#8b5cf6',
        color: 'white',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  // Handle lecturer selection for course reviews
  const handleLecturerChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({
      ...prev,
      lecturers: selectedIds,
      lecturer: selectedIds[0] || '' // For backward compatibility
    }));
  };

  // Handle course selection for lecturer reviews
  const handleCourseChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({
      ...prev,
      courses: selectedIds
    }));
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

          {/* Multi-select for Lecturers (Course Reviews) or Courses (Lecturer Reviews) */}
          {review.reviewType === 'course' ? (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800">בחירת מרצים</h3>
                  <p className="text-emerald-600 text-sm">בחר את המרצים שלימדו אותך בקורס זה</p>
                </div>
              </div>
              
              {loadingLecturers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="mr-2 text-emerald-600">טוען מרצים...</span>
                </div>
              ) : (
                <Select
                  isMulti
                  value={lecturers
                    .filter(lecturer => formData.lecturers?.includes(lecturer._id))
                    .map(lecturer => ({
                      value: lecturer._id,
                      label: lecturer.name
                    }))}
                  onChange={handleLecturerChange}
                  options={lecturers.map(lecturer => ({
                    value: lecturer._id,
                    label: lecturer.name
                  }))}
                  styles={selectStyles}
                  placeholder="בחר מרצים..."
                  noOptionsMessage={() => 'לא נמצאו מרצים'}
                  className="text-right"
                  isRtl={true}
                />
              )}
              
              {/* Add lecturer from department button */}
              {courseData?.department && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleShowDepartmentLecturers}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף מרצה מהמחלקה ({courseData.department})</span>
                  </button>
                </div>
              )}
              
              <div className="mt-3 p-3 bg-emerald-100 rounded-lg">
                <p className="text-emerald-700 text-sm">
                  <strong>קורס:</strong> {review.course?.title}
                  {review.course?.courseNumber && (
                    <span className="mr-2 bg-emerald-200 text-emerald-800 px-2 py-1 rounded text-xs">
                      {review.course.courseNumber}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800">בחירת קורסים</h3>
                  <p className="text-purple-600 text-sm">בחר את הקורסים שלמדת אצל המרצה</p>
                </div>
              </div>
              
              {loadingCourses ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span className="mr-2 text-purple-600">טוען קורסים...</span>
                </div>
              ) : (
                <Select
                  isMulti
                  value={courses
                    .filter(course => formData.courses?.includes(course._id))
                    .map(course => ({
                      value: course._id,
                      label: `${course.title}${course.courseNumber ? ` (${course.courseNumber})` : ''}`
                    }))}
                  onChange={handleCourseChange}
                  options={courses.map(course => ({
                    value: course._id,
                    label: `${course.title}${course.courseNumber ? ` (${course.courseNumber})` : ''}`
                  }))}
                  styles={selectStyles}
                  placeholder="בחר קורסים..."
                  noOptionsMessage={() => 'לא נמצאו קורסים'}
                  className="text-right"
                  isRtl={true}
                />
              )}
              
              <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                <p className="text-purple-700 text-sm">
                  <strong>מרצה:</strong> {review.lecturer?.name}
                  {review.lecturer?.department && (
                    <span className="mr-2 bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs">
                      {review.lecturer.department}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Anonymous Toggle */}
          <AnonymousToggle />

          {/* Rating Inputs - Different for course vs lecturer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {review.reviewType === 'course' ? (
              <>
                {renderRatingInput('עד כמה הקורס מעניין?', 'interest', <Heart className="w-5 h-5 text-red-500" />, 'red')}
                {renderRatingInput('עד כמה הקורס קשה?', 'difficulty', <Zap className="w-5 h-5 text-yellow-500" />, 'yellow')}
                {renderRatingInput('כמה זמן השקעת בקורס?', 'workload', <Clock className="w-5 h-5 text-orange-500" />, 'orange')}
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

      {/* Department Lecturers Modal */}
      {showDepartmentLecturers && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-60 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  מרצים במחלקה {courseData?.department}
                </h3>
                <button
                  onClick={() => setShowDepartmentLecturers(false)}
                  className="text-white hover:text-blue-200 transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">
                בחר מרצה להוספה לקורס ולביקורת
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
              {loadingDepartmentLecturers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="mr-2 text-gray-600">טוען מרצים...</span>
                </div>
              ) : departmentLecturers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  לא נמצאו מרצים נוספים במחלקה זו
                </div>
              ) : (
                <div className="space-y-3">
                  {departmentLecturers.map((lecturer) => (
                    <div
                      key={lecturer._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {lecturer.name}
                          </h4>
                          {lecturer.email && (
                            <p className="text-sm text-gray-500">
                              {lecturer.email}
                            </p>
                          )}
                          {lecturer.averageRating && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < Math.floor(lecturer.averageRating)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({lecturer.ratingsCount} ביקורות)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddLecturerFromDepartment(lecturer)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>הוסף</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewEditModal;