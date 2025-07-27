import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useContactRequestsWithSync = (token) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load from cache
  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem('contact_requests_data');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsedData.timestamp;
        // Cache is valid for 5 minutes
        if (cacheAge < 5 * 60 * 1000 && Array.isArray(parsedData.contactRequests)) {
          setRequests(parsedData.contactRequests);
          return true;
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת פניות מהמטמון:', error);
    }
    return false;
  }, []);

  // Fetch from server
  const fetchRequests = useCallback(async (filters = {}) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(Array.isArray(response.data) ? response.data : []);

      // Save to cache only when loading without filters
      const hasFilters = filters.status !== 'all' || filters.startDate || filters.endDate || filters.search;
      if (!hasFilters) {
        try {
          const contactRequestsCache = {
            contactRequests: Array.isArray(response.data) ? response.data : [],
            timestamp: Date.now()
          };
          localStorage.setItem('contact_requests_data', JSON.stringify(contactRequestsCache));
        } catch (cacheError) {
          console.error('שגיאה בשמירת פניות במטמון:', cacheError);
        }
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה בטעינת הפניות');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Refresh from server and update cache
  const refreshRequests = useCallback(async () => {
    return fetchRequests({});
  }, [fetchRequests]);

  // Update user's own contact request
  const updateUserRequest = useCallback(async (id, updateData) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the request in the local state
      setRequests(prev => 
        Array.isArray(prev) ? prev.map(req => req._id === id ? response.data : req) : []
      );

      // Update cache
      try {
        const cachedData = localStorage.getItem('contact_requests_data');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData.contactRequests)) {
            const updatedRequests = parsedData.contactRequests.map(req => 
              req._id === id ? response.data : req
            );
            const contactRequestsCache = {
              contactRequests: updatedRequests,
              timestamp: Date.now()
            };
            localStorage.setItem('contact_requests_data', JSON.stringify(contactRequestsCache));
          }
        }
      } catch (cacheError) {
        console.error('שגיאה בעדכון מטמון:', cacheError);
      }

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה בעדכון הפנייה');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete user's own contact request
  const deleteUserRequest = useCallback(async (id) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the request from local state
      setRequests(prev => Array.isArray(prev) ? prev.filter(req => req._id !== id) : []);

      // Update cache
      try {
        const cachedData = localStorage.getItem('contact_requests_data');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData.contactRequests)) {
            const updatedRequests = parsedData.contactRequests.filter(req => req._id !== id);
            const contactRequestsCache = {
              contactRequests: updatedRequests,
              timestamp: Date.now()
            };
            localStorage.setItem('contact_requests_data', JSON.stringify(contactRequestsCache));
          }
        }
      } catch (cacheError) {
        console.error('שגיאה בעדכון מטמון:', cacheError);
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה במחיקת הפנייה');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load initial data
  useEffect(() => {
    if (token) {
      const cachedDataLoaded = loadFromCache();
      if (!cachedDataLoaded) {
        fetchRequests({});
      }
    }
  }, [token, loadFromCache, fetchRequests]);

  // Listen for preloaded data events
  useEffect(() => {
    const handleContactRequestsPreloaded = () => {
      loadFromCache();
    };

    window.addEventListener('contactRequestsPreloaded', handleContactRequestsPreloaded);
    
    return () => {
      window.removeEventListener('contactRequestsPreloaded', handleContactRequestsPreloaded);
    };
  }, [loadFromCache]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    refreshRequests,
    loadFromCache,
    updateUserRequest,
    deleteUserRequest
  };
};
