import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';

const ContactModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const subjectOptions = [
    { value: 'add_lecturer_to_course', label: 'שיוך מרצה לקורס' },
    { value: 'add_course_to_lecturer', label: 'שיוך קורס למרצה' },
    { value: 'add_course_to_system', label: 'הוספת קורס למערכת' },
    { value: 'add_lecturer_to_system', label: 'הוספת מרצה למערכת' },
    { value: 'general_inquiry', label: 'נושא כללי' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description.trim()) {
      setError('נושא ותיאור הם שדות חובה');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/contact-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה בשליחת הפנייה');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ subject: '', description: '' });
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({ subject: '', description: '' });
      setError('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100" 
        dir="rtl"
        onClick={e => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg ml-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">פתיחת פנייה חדשה</h2>
                <p className="text-indigo-100 text-sm">שלח לנו פנייה ונחזור אליך בהקדם</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent mb-3">הפנייה נשלחה בהצלחה!</h3>
              <p className="text-slate-600">תקבל עדכון כאשר נענה על פנייתך</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  נושא הפנייה *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-base"
                  required
                >
                  <option value="">בחר נושא...</option>
                  {subjectOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  תיאור הבקשה *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="אנא תאר את בקשתך בפירוט..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-base leading-relaxed"
                  required
                />
                <div className="text-sm text-slate-500 mt-2 text-left">
                  {formData.description.length}/1000 תווים
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 font-medium"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.subject || !formData.description.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center font-medium shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                      שולח...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-5 h-5 ml-2" />
                      שלח פנייה
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;