import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    Calendar,
    User,
    Edit3,
    Save,
    X,
    Loader2,
    RefreshCw,
    AlertTriangle,
    Trash2,
    Eye,
    Headphones
} from 'lucide-react';
import ElegantLoadingSpinner from '../components/common/ElegantLoadingSpinner';

const MyContactRequests = ({ user }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [editingRequest, setEditingRequest] = useState(null);
    const [editForm, setEditForm] = useState({ subject: '', description: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = 'הפניות שלי - Course4Me';

        return () => {
            document.title = 'Course4Me';
        };
    }, []);

    const fetchRequests = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('שגיאה בטעינת הפניות');
            }

            const data = await response.json();
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshRequests = async () => {
        setRefreshing(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('שגיאה בטעינת הפניות');
            }

            const data = await response.json();
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchRequests();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]);

    const getSubjectDisplay = (subject) => {
        const subjectMap = {
            add_lecturer_to_course: 'הוספת מרצה לקורס',
            add_course_to_lecturer: 'הוספת קורס למרצה',
            add_course_to_system: 'הוספת קורס למערכת',
            add_lecturer_to_system: 'הוספת מרצה למערכת',
            general_inquiry: 'פנייה כללית'
        };
        return subjectMap[subject] || subject;
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            pending: { text: 'ממתין לטיפול', icon: Clock, color: 'text-amber-700 bg-amber-100 border-amber-200', dotColor: 'bg-amber-500' },
            in_progress: { text: 'בטיפול', icon: RefreshCw, color: 'text-blue-700 bg-blue-100 border-blue-200', dotColor: 'bg-blue-500' },
            answered: { text: 'נענתה', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-100 border-emerald-200', dotColor: 'bg-emerald-500' }
        };
        return statusMap[status] || statusMap.pending;
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

    const handleEditClick = (request) => {
        setEditingRequest(request);
        setEditForm({
            subject: request.subject,
            description: request.description
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editingRequest) return;

        if (!editForm.subject?.trim() || !editForm.description?.trim()) {
            alert('נושא ותיאור הם שדות חובה');
            return;
        }
        setSaving(true);
        try {
            const requestData = {
                subject: editForm.subject.trim(),
                description: editForm.description.trim()
            };

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests/${editingRequest._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`שגיאה בעדכון הפנייה: ${response.status} - ${errorText}`);
            }

            const updatedRequest = await response.json();

            // Update the requests array
            const newRequests = requests.map(r => r._id === editingRequest._id ? updatedRequest : r);
            setRequests(newRequests);

            // Update selected request if it's the same one
            if (selectedRequest && selectedRequest._id === editingRequest._id) {
                setSelectedRequest(updatedRequest);
            }

            // Close the edit modal
            setEditingRequest(null);
            setEditForm({ subject: '', description: '' });
            
            // Show success modal instead of alert
            setShowSuccessModal(true);
            
            // Auto close success modal after 3 seconds
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 3000);

        } catch (err) {
            console.error('Error during edit:', err);
            alert('שגיאה בעדכון הפנייה: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (requestId) => {
        setDeleting(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('שגיאה במחיקת הפנייה');
            }

            setRequests(requests.filter(r => r._id !== requestId));
            setShowDeleteConfirm(null);

            if (selectedRequest && selectedRequest._id === requestId) {
                setSelectedRequest(null);
            }
        } catch (err) {
            alert('שגיאה במחיקת הפנייה: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const openRequestDetails = (request) => {
        setSelectedRequest(request);
    };

    const closeRequestDetails = () => {
        setSelectedRequest(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
            {/* Header with Elegant Design */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="mb-6 sm:mb-8 text-center">
                    <div className="inline-flex flex-col items-center">
                        {/* Icon with gradient background */}
                        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg">
                            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-2 sm:mb-3">
                            הפניות שלי
                        </h1>

                        {/* Subtitle with decorative elements */}
                        <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
                            <div className="h-px w-4 sm:w-6 md:w-8 bg-gradient-to-r from-transparent to-indigo-300"></div>
                            <p className="text-sm sm:text-base lg:text-lg font-medium">
                                נמצאו <span className="text-indigo-600 font-bold">{requests.length}</span> פניות
                            </p>
                            <div className="h-px w-4 sm:w-6 md:w-8 bg-gradient-to-l from-transparent to-indigo-300"></div>
                        </div>

                        {/* Decorative underline */}
                        <div className="mt-3 sm:mt-4 w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-center hover:shadow-md transition-shadow duration-200 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center">
                            <span className="text-xl sm:text-2xl font-bold text-indigo-600 ml-2">{requests.length}</span>
                            <div className="flex items-center">
                                <div className="bg-indigo-100 p-1.5 rounded-lg ml-2">
                                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                                </div>
                                <span className="text-xs sm:text-sm text-slate-600">הפניות שלי</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-center hover:shadow-md transition-shadow duration-200 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center">
                            <span className="text-xl sm:text-2xl font-bold text-emerald-600 ml-2">{requests.filter(r => r.status === 'answered').length}</span>
                            <div className="flex items-center">
                                <div className="bg-emerald-100 p-1.5 rounded-lg ml-2">
                                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                                </div>
                                <span className="text-xs sm:text-sm text-slate-600">נענו</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-center hover:shadow-md transition-shadow duration-200 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center">
                            <span className="text-xl sm:text-2xl font-bold text-amber-500 ml-2">{requests.filter(r => r.status === 'pending').length}</span>
                            <div className="flex items-center">
                                <div className="bg-amber-100 p-1.5 rounded-lg ml-2">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                                </div>
                                <span className="text-xs sm:text-sm text-slate-600">ממתינות</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-center hover:shadow-md transition-shadow duration-200 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center">
                            <span className="text-xl sm:text-2xl font-bold text-blue-500 ml-2">{requests.filter(r => r.status === 'in_progress').length}</span>
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-1.5 rounded-lg ml-2">
                                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                                </div>
                                <span className="text-xs sm:text-sm text-slate-600">בטיפול</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={refreshRequests}
                        disabled={refreshing}
                        className="col-span-2 lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center px-3 sm:px-4 py-3 text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 animate-fadeIn" style={{ animationDelay: '0.5s' }}
                    >
                        <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="text-xs sm:text-sm">{refreshing ? 'מרענן...' : 'רענן'}</span>
                    </button>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                            הפניות שלך ({requests.length})
                        </h2>
                    </div>

                    {loading && requests.length === 0 ? (
                        <ElegantLoadingSpinner message="טוען את הפניות שלך..." size="large" />
                    ) : requests.length === 0 ? (
                        <div className="p-8 sm:p-12 lg:p-16 text-center animate-fadeIn">
                            <div className="bg-slate-100 p-3 sm:p-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center animate-fadeIn">
                                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">אין פניות עדיין</h3>
                            <p className="text-sm sm:text-base text-slate-600 mb-4">לא יצרת עדיין פניות למערכת</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 animate-fadeIn">
                            {requests.map((request, index) => {
                                const statusDisplay = getStatusDisplay(request.status);

                                return (
                                    <div 
                                        key={request._id} 
                                        className="p-4 sm:p-6 hover:bg-slate-50 transition-all duration-200 animate-fadeIn"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 mb-3">
                                                    <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${statusDisplay.color} w-fit`}>
                                                        <div className={`w-2 h-2 rounded-full ${statusDisplay.dotColor} ml-2`} />
                                                        {statusDisplay.text}
                                                    </span>
                                                    <div className="flex items-center text-xs sm:text-sm text-slate-500 sm:mr-4">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                                        {formatDate(request.createdAt)}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <span className="text-xs sm:text-sm font-semibold text-slate-700">כותרת: </span>
                                                    <span className="text-base sm:text-lg font-bold text-slate-800 break-words">{getSubjectDisplay(request.subject)}</span>
                                                </div>

                                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3 line-clamp-2 break-words">
                                                    {request.description}
                                                </p>

                                                {request.adminResponse && (
                                                    <div className="flex items-center text-xs sm:text-sm text-emerald-600 font-medium">
                                                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 flex-shrink-0" />
                                                        <span className="break-words">קיבלת תגובה מהצוות</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 justify-end sm:justify-start">
                                                {request.status !== 'answered' && (
                                                    <button
                                                        onClick={() => handleEditClick(request)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
                                                        title="ערוך פנייה"
                                                    >
                                                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setShowDeleteConfirm(request._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                                                    title="מחק פנייה"
                                                >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openRequestDetails(request)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="הצג פרטים"
                                                >
                                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeRequestDetails}>
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="bg-white/20 p-2 rounded-lg ml-2 sm:ml-3 flex-shrink-0">
                                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-lg sm:text-xl font-bold truncate">{getSubjectDisplay(selectedRequest.subject)}</h2>
                                        <p className="text-indigo-100 text-xs sm:text-sm truncate">פנייה מתאריך {formatDate(selectedRequest.createdAt)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeRequestDetails}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4 sm:space-y-6">
                                {/* User Message */}
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="bg-indigo-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                            <span className="font-semibold text-slate-800 text-sm sm:text-base">{user?.fullName || 'את/ה'}</span>
                                            <div className="flex items-center text-slate-500">
                                                <span className="hidden sm:inline text-sm">•</span>
                                                <span className="text-xs sm:text-sm sm:mr-2">{formatDate(selectedRequest.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-50 rounded-xl sm:rounded-2xl rounded-tr-sm sm:rounded-tr-lg p-3 sm:p-4 border border-indigo-100">
                                            <p className="text-slate-800 leading-relaxed text-sm sm:text-base break-words">{selectedRequest.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Response */}
                                {selectedRequest.adminResponse ? (
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="bg-emerald-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                                            <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                                                <span className="font-semibold text-slate-800 text-sm sm:text-base">
                                                    {selectedRequest.respondedBy?.fullName || 'צוות התמיכה'}
                                                </span>
                                                <div className="flex items-center text-slate-500">
                                                    <span className="hidden sm:inline text-sm">•</span>
                                                    <span className="text-xs sm:text-sm sm:mr-2">
                                                        {formatDate(selectedRequest.respondedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 rounded-xl sm:rounded-2xl rounded-tr-sm sm:rounded-tr-lg p-3 sm:p-4 border border-emerald-100">
                                                <p className="text-slate-800 leading-relaxed text-sm sm:text-base break-words">{selectedRequest.adminResponse}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 sm:py-8">
                                        <div className="bg-slate-100 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 font-medium text-sm sm:text-base">ממתין לתגובת הצוות</p>
                                        <p className="text-slate-500 text-xs sm:text-sm mt-1">נחזור אליך בהקדם האפשרי</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                                <div className="order-2 sm:order-1">
                                    {(() => {
                                        const statusDisplay = getStatusDisplay(selectedRequest.status);
                                        const StatusIcon = statusDisplay.icon;
                                        return (
                                            <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border ${statusDisplay.color}`}>
                                                <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                                                {statusDisplay.text}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <button
                                    onClick={closeRequestDetails}
                                    className="order-1 sm:order-2 w-full sm:w-auto px-4 sm:px-6 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium text-sm sm:text-base"
                                >
                                    סגור
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="bg-white/20 p-2 rounded-lg ml-2 sm:ml-3 flex-shrink-0">
                                        <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg sm:text-xl font-bold">עריכת פנייה</h2>
                                        <p className="text-blue-100 text-xs sm:text-sm">ערוך את פרטי הפנייה שלך</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditingRequest(null)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                    נושא הפנייה *
                                </label>
                                <select
                                    value={editForm.subject}
                                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                    required
                                >
                                    <option value="">בחר נושא...</option>
                                    <option value="add_lecturer_to_course">הוספת מרצה לקורס</option>
                                    <option value="add_course_to_lecturer">הוספת קורס למרצה</option>
                                    <option value="add_course_to_system">הוספת קורס למערכת</option>
                                    <option value="add_lecturer_to_system">הוספת מרצה למערכת</option>
                                    <option value="general_inquiry">פנייה כללית</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                                    תיאור הפנייה *
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="פרט את בקשתך או שאלתך..."
                                    rows={5}
                                    maxLength={1000}
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base leading-relaxed"
                                    required
                                />
                                <div className="text-xs sm:text-sm text-gray-500 mt-2 text-left">
                                    {editForm.description.length}/1000 תווים
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingRequest(null)}
                                    className="w-full sm:w-auto order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={handleEditSubmit}
                                    disabled={saving}
                                    className="w-full sm:w-auto order-1 sm:order-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg text-sm sm:text-base"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                            שומר...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 ml-2" />
                                            שמור שינויים
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
                            <div className="flex items-center justify-center">
                                <div className="bg-white/20 p-2 rounded-lg ml-2 sm:ml-3">
                                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold">מחיקת פנייה</h2>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6 text-center">
                            <div className="bg-red-50 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                                <Trash2 className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
                                <p className="text-slate-700 font-medium mb-2 text-sm sm:text-base">
                                    האם אתה בטוח שברצונך למחוק את הפנייה?
                                </p>
                                <p className="text-red-600 text-xs sm:text-sm font-semibold">
                                    ⚠️ לא ניתן יהיה לשחזר אותה לאחר המחיקה!
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50 rounded-b-2xl sm:rounded-b-3xl">
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="w-full sm:w-auto order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl hover:bg-slate-300 transition-colors font-medium text-sm sm:text-base"
                                >
                                    ביטול
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    disabled={deleting}
                                    className="w-full sm:w-auto order-1 sm:order-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg text-sm sm:text-base"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                            מוחק...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4 ml-2" />
                                            מחק סופית
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
                            <div className="flex items-center justify-center">
                                <div className="bg-white/20 p-2 rounded-lg ml-2 sm:ml-3">
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold">הפנייה עודכנה בהצלחה!</h2>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6 text-center">
                            <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-2 sm:mb-3" />
                                <p className="text-slate-700 font-medium mb-2 text-sm sm:text-base">
                                    השינויים נשמרו בהצלחה
                                </p>
                                <p className="text-emerald-600 text-xs sm:text-sm font-semibold">
                                    ✅ הפנייה שלך עודכנה במערכת
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50 rounded-b-2xl sm:rounded-b-3xl">
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
                                >
                                    סגור
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyContactRequests;