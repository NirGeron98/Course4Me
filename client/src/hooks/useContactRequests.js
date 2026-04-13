import { useCallback } from "react";
import { apiFetch, useApi } from "./useApi";

// Contact requests hook for the authenticated user.
// Exposes list + update + delete mutations and keeps local state in sync
// after each successful call so the page never re-fetches the entire list.
export const useContactRequests = () => {
  const { data, loading, error, refetch, setData } = useApi(
    ({ signal }) => apiFetch("/api/contact-requests/my-requests", { signal }),
    []
  );

  const updateRequest = useCallback(
    async (requestId, payload) => {
      const updated = await apiFetch(
        `/api/contact-requests/my-requests/${requestId}`,
        { method: "PUT", body: payload }
      );
      setData((prev) =>
        Array.isArray(prev)
          ? prev.map((req) => (req._id === requestId ? updated : req))
          : prev
      );
      return updated;
    },
    [setData]
  );

  const deleteRequest = useCallback(
    async (requestId) => {
      await apiFetch(`/api/contact-requests/my-requests/${requestId}`, {
        method: "DELETE",
      });
      setData((prev) =>
        Array.isArray(prev) ? prev.filter((req) => req._id !== requestId) : []
      );
    },
    [setData]
  );

  return {
    requests: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
    updateRequest,
    deleteRequest,
  };
};
