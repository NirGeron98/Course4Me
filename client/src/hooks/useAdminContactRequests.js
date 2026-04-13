import { useCallback, useState } from "react";
import { apiFetch } from "./useApi";

// useAdminContactRequests — admin-only contact request list + mutations.
// Backed by apiFetch so all requests share Hebrew error
// normalization, abort/timeout handling, and the shared auth header.
// Local state is patched after each mutation so the panel never refetches
// the entire list for a single update.
const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.search) params.append("search", filters.search);
  const q = params.toString();
  return q ? `?${q}` : "";
};

export const useAdminContactRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/api/contact-requests${buildQuery(filters)}`);
      const next = Array.isArray(data) ? data : [];
      setRequests(next);
      return next;
    } catch (err) {
      setError(err?.message || "שגיאה בטעינת הפניות");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const patchLocal = useCallback((id, updated) => {
    setRequests((prev) =>
      Array.isArray(prev) ? prev.map((r) => (r._id === id ? updated : r)) : []
    );
  }, []);

  const updateRequestStatus = useCallback(
    async (id, status, adminResponse = "") => {
      setMutating(true);
      setError("");
      try {
        const updated = await apiFetch(`/api/contact-requests/${id}`, {
          method: "PUT",
          body: { status, adminResponse },
        });
        patchLocal(id, updated);
        return updated;
      } catch (err) {
        setError(err?.message || "שגיאה בעדכון הפנייה");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [patchLocal]
  );

  const updateAdminResponse = useCallback(
    async (id, adminResponse) => {
      setMutating(true);
      setError("");
      try {
        const updated = await apiFetch(
          `/api/contact-requests/${id}/response`,
          { method: "PUT", body: { adminResponse } }
        );
        patchLocal(id, updated);
        return updated;
      } catch (err) {
        setError(err?.message || "שגיאה בעדכון התגובה");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [patchLocal]
  );

  const deleteAdminResponse = useCallback(
    async (id) => {
      setMutating(true);
      setError("");
      try {
        const updated = await apiFetch(
          `/api/contact-requests/${id}/response`,
          { method: "DELETE" }
        );
        patchLocal(id, updated);
        return updated;
      } catch (err) {
        setError(err?.message || "שגיאה במחיקת התגובה");
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [patchLocal]
  );

  const deleteRequest = useCallback(async (id) => {
    setMutating(true);
    setError("");
    try {
      await apiFetch(`/api/contact-requests/${id}`, { method: "DELETE" });
      setRequests((prev) =>
        Array.isArray(prev) ? prev.filter((r) => r._id !== id) : []
      );
    } catch (err) {
      setError(err?.message || "שגיאה במחיקת הפנייה");
      throw err;
    } finally {
      setMutating(false);
    }
  }, []);

  return {
    requests,
    loading,
    mutating,
    error,
    setError,
    fetchRequests,
    updateRequestStatus,
    updateAdminResponse,
    deleteAdminResponse,
    deleteRequest,
  };
};

export default useAdminContactRequests;
