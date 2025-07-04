import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  BookOpen,
  Users,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Eye,
  X,
  Mail,
  RefreshCw
} from "lucide-react";
import ContactRequestModal from "../components/common/ContactRequestModal";

const MyContactRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  // Cache configuration
  const CACHE_KEY = 'my_contact_requests_data';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache helper functions
  const isCacheValid = () => {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return false;
    
    const { timestamp } = JSON.parse(cacheData);
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const saveToCache = (data, paginationData) => {
    try {
      const cacheData = {
        requests: data,
        pagination: paginationData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('שגיאה בשמירת נתונים במטמון:', error);
    }
  };

  const getFromCache = () => {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;
      
      const { requests, pagination } = JSON.parse(cacheData);
      return { requests, pagination };
    } catch (error) {
      console.error('שגיאה בקריאת נתונים מהמטמון:', error);
      return null;
    }
  };

  // Set page title
  useEffect(() => {
    document.title = 'הפניות שלי - Course4Me';
    
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  const statusOptions = [
    { value: "pending", label: "ממתין לטיפול", color: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
    { value: "in_progress", label: "בטיפול", color: "bg-blue-100 text-blue-800 border-blue-300", icon: AlertCircle },
    { value: "resolved", label: "טופל", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle },
    { value: "rejected", label: "נדחה", color: "bg-red-100 text-red-800 border-red-300", icon: XCircle }
  ];

  const typeOptions = [
    { value: "course_request", label: "הוספת/שיוך קורס", icon: BookOpen },
    { value: "lecturer_request", label: "הוספת/שיוך מרצה", icon: Users },
    { value: "general_request", label: "פניה כללית", icon: HelpCircle }
  ];

  const fetchRequests = async (page = 1, forceRefresh = false) => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh && isCacheValid()) {
        setIsLoadingFromCache(true);
        const cachedData = getFromCache();
        if (cachedData) {
          setRequests(cachedData.requests);
          setPagination(cachedData.pagination);
          setIsLoading(false);
          setIsLoadingFromCache(false);
          return;
        }
      }

      setIsLoading(true);
      setIsLoadingFromCache(false);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests?page=${page}&limit=${pagination.limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(response.data.contactRequests);
      setPagination(response.data.pagination);
      
      // Save to cache
      saveToCache(response.data.contactRequests, response.data.pagination);
    } catch (error) {
      console.error("Error fetching contact requests:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingFromCache(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusDisplay = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    const Icon = statusOption?.icon || Clock;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${statusOption?.color}`}>
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

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleNewRequestCreated = () => {
    setIsNewRequestModalOpen(false);
    // Clear cache and force refresh when new request is created
    localStorage.removeItem(CACHE_KEY);
    fetchRequests(pagination.page, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50" dir="rtl">
      <div className="bg-gradient-to-r from-orange-500 to-rose-600 text-white py-10 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-4 right-12 w-20 h-20 bg-white/8 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-12 w-16 h-16 bg-white/8 rounded-full blur-xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">
            הפניות שלי
          </h1>
          <p className="text-orange-100 text-center text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            נהל את רשימת הפניות שלך ועקוב אחר עדכונים
          </p>
          {pagination.total > 0 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 text-sm">
                <span className="font-semibold">
                  {pagination.total} פניות במעקב
                </span>
                {isLoadingFromCache && (
                  <span className="mr-2 text-xs text-orange-200">
                    • נטען מהמטמון
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-3 rounded-xl">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {pagination.total > 0 ? `${pagination.total} פניות` : "אין פניות"}
              </h2>
              <p className="text-gray-600 text-sm">
                {pagination.total > 0 ? "רשימת הפניות שיצרת" : "לא יצרת עדיין פניות"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRequests(pagination.page, true)}
              disabled={isLoading || isLoadingFromCache}
              className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-sm hover:shadow-md disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || isLoadingFromCache ? 'animate-spin' : ''}`} />
              רענן
            </button>
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              פניה חדשה
            </button>
          </div>
        </div>

        {isLoading || isLoadingFromCache ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              {isLoadingFromCache ? "טוען מהמטמון..." : "טוען פניות..."}
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">אין פניות</h3>
            <p className="text-gray-600 mb-6 text-lg">לא יצרת עדיין פניות למערכת</p>
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              צור פניה ראשונה
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request._id} className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${
                  request.adminResponse && request.status !== 'pending' ? 'border-orange-200 bg-gradient-to-r from-white to-orange-50' : ''
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-2 rounded-lg">
                          {(() => {
                            const typeOption = typeOptions.find(opt => opt.value === request.type);
                            const TypeIcon = typeOption?.icon || HelpCircle;
                            return <TypeIcon className="w-4 h-4 text-white" />;
                          })()}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{request.subject}</h3>
                        {request.adminResponse && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 border border-orange-300 animate-pulse">
                            <MessageCircle className="ml-1 w-3 h-3 mr-1" />
                            יש תגובה
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          {(() => {
                            const typeOption = typeOptions.find(opt => opt.value === request.type);
                            const TypeIcon = typeOption?.icon || HelpCircle;
                            return <TypeIcon className="w-4 h-4" />;
                          })()}
                          {(() => {
                            const typeOption = typeOptions.find(opt => opt.value === request.type);
                            return typeOption?.label || 'לא ידוע';
                          })()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {request.message.length > 150 
                          ? request.message.substring(0, 150) + "..." 
                          : request.message}
                      </p>
                      <div className="flex items-center gap-3">
                        {getStatusDisplay(request.status)}
                        {request.adminResponse && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                            <MessageCircle className="w-3 h-3 mr-1 ml-1" />
                            יש תגובה
                          </span>
                        )}
                        {request.updatedAt !== request.createdAt && (
                          <span className="text-xs text-gray-500">
                            עודכן: {formatDate(request.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openRequestModal(request)}
                      className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      צפה
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-4">
                <button
                  onClick={() => fetchRequests(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </button>
                <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-700">
                    עמוד {pagination.page} מתוך {pagination.pages}
                  </span>
                </div>
                <button
                  onClick={() => fetchRequests(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Request Details Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-4 sm:align-middle sm:max-w-lg sm:w-full md:max-w-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-gray-50 via-white to-orange-50 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6" dir="rtl">
                
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent mb-2">
                    פרטי הפניה
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    פרטי הפניה שלך וסטטוס הטיפול
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
                        תאריך יצירה:
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border text-right">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                        סטטוס:
                      </label>
                      <div className="bg-gray-50 p-3 rounded-xl border text-right">
                        {getStatusDisplay(selectedRequest.status)}
                      </div>
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

                  {selectedRequest.adminResponse && (
                    <div>
                      <label className="text-right block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 justify-start">
                        <span>תגובת המנהל:</span>
                      </label>
                      <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl border border-orange-200">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed text-right">{selectedRequest.adminResponse}</p>
                        {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                          <p className="text-xs text-orange-600 mt-2 font-medium text-right">
                            נענה ב-{formatDate(selectedRequest.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2 text-right">
                        עודכן לאחרונה:
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-xl border text-right">{formatDate(selectedRequest.updatedAt)}</p>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="flex justify-center pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl hover:from-orange-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[140px]"
                    >
                      סגור
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <ContactRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={handleNewRequestCreated}
      />
    </div>
  );
};

export default MyContactRequests;
