import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useAdminContactRequests = (token) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all contact requests (admin only)
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
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(Array.isArray(response.data) ? response.data : []);
      return Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה בטעינת הפניות');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update admin response
  const updateAdminResponse = useCallback(async (id, adminResponse) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/${id}/response`,
        { adminResponse },
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

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה בעדכון התגובה');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete admin response
  const deleteAdminResponse = useCallback(async (id) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/${id}/response`,
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

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה במחיקת התגובה');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update contact request status
  const updateRequestStatus = useCallback(async (id, status, adminResponse = '') => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/${id}`,
        { status, adminResponse },
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

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'שגיאה בעדכון הפנייה');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete contact request (admin only)
  const deleteRequest = useCallback(async (id) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the request from local state
      setRequests(prev => Array.isArray(prev) ? prev.filter(req => req._id !== id) : []);

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
      fetchRequests({});
    }
  }, [token, fetchRequests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    updateAdminResponse,
    deleteAdminResponse,
    updateRequestStatus,
    deleteRequest
  };
};
