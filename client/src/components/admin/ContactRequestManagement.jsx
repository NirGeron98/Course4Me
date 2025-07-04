import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Eye,
    MessageCircle,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User,
    Calendar,
    Filter,
    BookOpen,
    Users,
    HelpCircle,
    ArrowRight,
    ArrowLeft,
    Save,
    Trash2,
    X
} from "lucide-react";

const ContactRequestManagement = ({ onMessage, onError }) => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState({ status: "", type: "" });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [adminResponse, setAdminResponse] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const statusOptions = [
        { value: "pending", label: "ממתין לטיפול", color: "bg-yellow-100 text-yellow-800", icon: Clock },
        { value: "in_progress", label: "בטיפול", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
        { value: "resolved", label: "טופל", color: "bg-green-100 text-green-800", icon: CheckCircle },
        { value: "rejected", label: "נדחה", color: "bg-red-100 text-red-800", icon: XCircle }
    ];

  const typeOptions = [
    { value: "course_request", label: "הוספת/שיוך קורס", icon: BookOpen },
    { value: "lecturer_request", label: "הוספת/שיוך מרצה", icon: Users },
    { value: "general_request", label: "פניה כללית", icon: HelpCircle }
  ];

    const fetchRequests = async (page = 1) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                ...(filter.status && { status: filter.status }),
                ...(filter.type && { type: filter.type })
            });

            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequests(response.data.contactRequests);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching contact requests:", error);
            console.error("Error details:", error.response?.data);
            onError("שגיאה בטעינת הפניות");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/${requestId}/status`,
                { status: newStatus, adminResponse },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onMessage("סטטוס הפניה עודכן בהצלחה");
            fetchRequests(pagination.page);
            setIsModalOpen(false);
            setSelectedRequest(null);
            setAdminResponse("");
            setSelectedStatus("");
        } catch (error) {
            console.error("Error updating request status:", error);
            onError("שגיאה בעדכון סטטוס הפניה");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק את הפניה?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/${requestId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onMessage("הפניה נמחקה בהצלחה");
            fetchRequests(pagination.page);
            setIsModalOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Error deleting request:", error);
            onError("שגיאה במחיקת הפניה");
        }
    };

    const openRequestModal = (request) => {
        setSelectedRequest(request);
        setSelectedStatus(request.status);
        setAdminResponse(request.adminResponse || "");
        setIsModalOpen(true);
    };

    const getStatusDisplay = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        const Icon = statusOption?.icon || Clock;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOption?.color}`}>
                <Icon className="w-3 h-3 ml-1" />
                {statusOption?.label}
            </span>
        );
    };

    const getTypeDisplay = (type) => {
        const typeOption = typeOptions.find(opt => opt.value === type);
        const Icon = typeOption?.icon || HelpCircle;
        return (
            <span className="inline-flex items-center text-sm text-gray-600">
                <Icon className="w-4 h-4 ml-1" />
                {typeOption?.label}
            </span>
        );
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <MessageCircle className="w-6 h-6 ml-2 text-emerald-500" />
                    ניהול פניות
                </h2>
                <button
                    onClick={() => fetchRequests(pagination.page)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    רענן
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">כל הסטטוסים</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filter.type}
                        onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="">כל הסוגים</option>
                        {typeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow-sm border">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">טוען פניות...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>אין פניות להצגה</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {requests.map((request) => (
                            <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium text-gray-900">{request.subject}</h3>
                                            {getStatusDisplay(request.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                            <span className="flex items-center">
                                                <User className="w-4 h-4 ml-1" />
                                                {request.user?.fullName || "משתמש לא ידוע"}
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 ml-1" />
                                                {formatDate(request.createdAt)}
                                            </span>
                                            {getTypeDisplay(request.type)}
                                        </div>
                                        <p className="text-gray-600 text-sm overflow-hidden text-ellipsis">
                                            {request.message.length > 100
                                                ? request.message.substring(0, 100) + "..."
                                                : request.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => openRequestModal(request)}
                                        className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        צפה
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t">
                        <div className="text-sm text-gray-600">
                            {pagination.total} פניות סה"כ
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchRequests(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600">
                                עמוד {pagination.page} מתוך {pagination.pages}
                            </span>
                            <button
                                onClick={() => fetchRequests(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Details Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-4 sm:align-middle sm:max-w-lg sm:w-full md:max-w-xl border border-gray-100 max-h-[120vh] overflow-y-auto">
                            <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6" dir="rtl">

                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent mb-2">
                                        ניהול פניה
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">
                                        צפה בפרטי הפניה ועדכן את סטטוס הטיפול
                                    </p>
                                    <div className="mt-3 w-16 h-0.5 bg-gradient-to-r from-orange-500 to-rose-600 mx-auto rounded-full"></div>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                                נושא:
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border text-right">{selectedRequest.subject}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                                סוג הפניה:
                                            </label>
                                            <div className="bg-gray-50 p-3 rounded-xl border text-right">
                                                {getTypeDisplay(selectedRequest.type)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                                משתמש:
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border text-right">{selectedRequest.user?.fullName}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                                תאריך:
                                            </label>
                                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border text-right">{formatDate(selectedRequest.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                            תוכן הפניה:
                                        </label>
                                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed text-right">{selectedRequest.message}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                            סטטוס:
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-right"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                                            תגובת המנהל:
                                        </label>
                                        <textarea
                                            value={adminResponse}
                                            onChange={(e) => setAdminResponse(e.target.value)}
                                            placeholder="הוסף תגובה או הערה למשתמש..."
                                            rows={4}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white resize-none leading-relaxed text-right"
                                        />
                                        {selectedRequest.adminResponse && (
                                            <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                <p className="text-xs text-orange-600 font-medium mb-1 text-right">תגובה נוכחית:</p>
                                                <p className="text-sm text-gray-700 text-right">{selectedRequest.adminResponse}</p>
                                                {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                                                    <p className="text-xs text-orange-500 mt-1 text-right">
                                                        נענה ב-{formatDate(selectedRequest.updatedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => handleDeleteRequest(selectedRequest._id)}
                                            className="px-6 py-3 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            מחק פניה
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 min-w-[100px]"
                                            >
                                                ביטול
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(selectedRequest._id, selectedStatus)}
                                                disabled={isSaving}
                                                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl hover:from-orange-600 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl flex items-center gap-2 min-w-[140px] justify-center"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>שומר...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        <span>שמור שינויים</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactRequestManagement;
