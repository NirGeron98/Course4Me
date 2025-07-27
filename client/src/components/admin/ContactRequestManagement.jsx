import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Loader2, CheckCircle2, Calendar, Search, Filter, RefreshCw, Save, User, Mail, Edit3, Trash2 } from 'lucide-react';
import { useAdminContactRequests } from '../../hooks/useAdminContactRequests';

const ContactRequestManagement = ({ onMessage, onError }) => {
  const token = localStorage.getItem('token');
  const { requests, loading, error, fetchRequests, updateAdminResponse, deleteAdminResponse, updateRequestStatus, deleteRequest } = useAdminContactRequests(token);
  
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [responseData, setResponseData] = useState({});
  const [editingResponse, setEditingResponse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'request' or 'response'

  // Handle filters change
  useEffect(() => {
    fetchRequests(filters);
  }, [filters, fetchRequests]);

  // Handle errors
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  const handleUpdateRequest = async (requestId) => {
    const data = responseData[requestId];
    if (!data || (!data.status && !data.adminResponse)) {
      onError('נדרש לשנות לפחות שדה אחד');
      return;
    }

    try {
      await updateRequestStatus(requestId, data.status, data.adminResponse);

      // Clear response data for this request
      setResponseData(prev => ({
        ...prev,
        [requestId]: { status: '', adminResponse: '' }
      }));

      // Close the expanded request section
      setExpandedRequest(null);

      onMessage('הפנייה עודכנה בהצלחה');
    } catch (err) {
      onError(err.message);
    }
  };

  // New functions for editing and deleting responses
  const handleEditResponse = async (requestId, newResponse) => {
    try {
      await updateAdminResponse(requestId, newResponse);
      setEditingResponse(null);
      onMessage('התגובה עודכנה בהצלחה');
    } catch (err) {
      onError(err.message);
    }
  };

  const handleDeleteResponse = async (requestId) => {
    try {
      await deleteAdminResponse(requestId);
      setShowDeleteConfirm(null);
      onMessage('התגובה נמחקה בהצלחה');
    } catch (err) {
      onError(err.message);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await deleteRequest(requestId);
      setShowDeleteConfirm(null);
      onMessage('הפנייה נמחקה בהצלחה');
    } catch (err) {
      onError(err.message);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: { text: 'ממתין לטיפול', icon: Clock, color: 'text-orange-600 bg-orange-100' },
      in_progress: { text: 'בטיפול', icon: Loader2, color: 'text-blue-600 bg-blue-100' },
      answered: { text: 'נענתה', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const getSubjectDisplay = (subject) => {
    const subjectMap = {
      add_lecturer_to_course: 'שיוך מרצה לקורס',
      add_course_to_lecturer: 'שיוך קורס למרצה',
      add_course_to_system: 'הוספת קורס למערכת',
      add_lecturer_to_system: 'הוספת מרצה למערכת',
      general_inquiry: 'נושא כללי'
    };
    return subjectMap[subject] || subject;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      startDate: '',
      endDate: '',
      search: ''
    });
  };

  const getStatusCounts = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      answered: requests.filter(r => r.status === 'answered').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl">
          <h3 className="text-sm font-medium opacity-90">סה״כ פניות</h3>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
          <h3 className="text-sm font-medium opacity-90">ממתינות לטיפול</h3>
          <p className="text-2xl font-bold">{counts.pending}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <h3 className="text-sm font-medium opacity-90">בטיפול</h3>
          <p className="text-2xl font-bold">{counts.in_progress}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl">
          <h3 className="text-sm font-medium opacity-90">נענו</h3>
          <p className="text-2xl font-bold">{counts.answered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Filter className="w-4 h-4 ml-2" />
            סינון וחיפוש
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            נקה סינונים
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="pending">ממתין לטיפול</option>
              <option value="in_progress">בטיפול</option>
              <option value="answered">נענתה</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מתאריך</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">עד תאריך</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">חיפוש חופשי</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חפש בתוכן..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          רשימת פניות ({requests.length})
        </h3>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          רענן
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin ml-3" />
            <span className="text-gray-600">טוען פניות...</span>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">אין פניות להצגה</h3>
          <p className="text-gray-600">לא נמצאו פניות התואמות את הסינון שנבחר</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusDisplay = getStatusDisplay(request.status);
            const StatusIcon = statusDisplay.icon;
            const isExpanded = expandedRequest === request._id;
            const responseState = responseData[request._id] || { status: '', adminResponse: '' };

            return (
              <div key={request._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusDisplay.text}
                        </span>
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <Calendar className="w-4 h-4 ml-1" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">
                        {getSubjectDisplay(request.subject)}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(request._id);
                          setDeleteType('request');
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="מחק פנייה"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpandedRequest(isExpanded ? null : request._id)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        {isExpanded ? 'סגור' : 'פתח לטיפול'}
                      </button>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <User className="w-4 h-4 ml-1" />
                    <span className="ml-4">{request.user.fullName}</span>
                    <Mail className="w-4 h-4 ml-1" />
                    <span>{request.user.email}</span>
                  </div>

                  {/* Request Description */}
                  <div className="mb-4">
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {request.description}
                    </p>
                  </div>

                  {/* Existing Admin Response */}
                  {request.adminResponse && (
                    <div className="mb-4 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-emerald-700">תגובה קיימת:</h5>
                        <div className="flex items-center gap-2">
                          {request.respondedAt && (
                            <span className="text-xs text-gray-500">
                              {formatDate(request.respondedAt)}
                            </span>
                          )}
                          <button
                            onClick={() => setEditingResponse(request._id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="ערוך תגובה"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(request._id);
                              setDeleteType('response');
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="מחק תגובה"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {editingResponse === request._id ? (
                        <div className="space-y-3">
                          <textarea
                            defaultValue={request.adminResponse}
                            id={`edit-response-${request._id}`}
                            rows={4}
                            maxLength={1000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              {(document.getElementById(`edit-response-${request._id}`)?.value || '').length}/1000
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingResponse(null)}
                                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                              >
                                ביטול
                              </button>
                              <button
                                onClick={() => {
                                  const textarea = document.getElementById(`edit-response-${request._id}`);
                                  if (textarea) {
                                    handleEditResponse(request._id, textarea.value);
                                  }
                                }}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                              >
                                <Save className="w-3 h-3 ml-1" />
                                שמור
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 bg-emerald-50 p-3 rounded-lg">
                          {request.adminResponse}
                        </p>
                      )}
                      
                      {request.respondedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          נענה על ידי: {request.respondedBy.fullName}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Admin Actions */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            עדכון סטטוס
                          </label>
                          <select
                            value={responseState.status}
                            onChange={(e) => setResponseData({
                              ...responseData,
                              [request._id]: { ...responseState, status: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="">בחר סטטוס חדש...</option>
                            <option value="pending">ממתין לטיפול</option>
                            <option value="in_progress">בטיפול</option>
                            <option value="answered">נענתה</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          תגובה למשתמש
                        </label>
                        <textarea
                          value={responseState.adminResponse}
                          onChange={(e) => setResponseData({
                            ...responseData,
                            [request._id]: { ...responseState, adminResponse: e.target.value }
                          })}
                          placeholder="הכנס תגובה למשתמש..."
                          rows={3}
                          maxLength={1000}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                        />
                        <div className="text-sm text-gray-500 mt-1 text-left">
                          {responseState.adminResponse.length}/1000
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleUpdateRequest(request._id)}
                          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Save className="w-4 h-4 ml-2" />
                          שמור עדכון
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-3xl">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg ml-3">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {deleteType === 'request' ? 'מחיקת פנייה' : 'מחיקת תגובה'}
                  </h2>
                  <p className="text-red-100 text-sm">פעולה זו אינה ניתנת לביטול</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-700 text-center">
                {deleteType === 'request' 
                  ? 'האם אתה בטוח שברצונך למחוק את הפנייה? כל המידע כולל תגובות יימחק.'
                  : 'האם אתה בטוח שברצונך למחוק את התגובה? הפנייה תחזור לסטטוס "ממתין לטיפול".'
                }
              </p>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-3xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setDeleteType('');
                  }}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
                >
                  ביטול
                </button>
                <button
                  onClick={() => {
                    if (deleteType === 'request') {
                      handleDeleteRequest(showDeleteConfirm);
                    } else {
                      handleDeleteResponse(showDeleteConfirm);
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      מוחק...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 ml-2" />
                      {deleteType === 'request' ? 'מחק פנייה' : 'מחק תגובה'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactRequestManagement;
