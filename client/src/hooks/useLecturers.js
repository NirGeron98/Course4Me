import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./useApi";

// useLecturers — owns the admin lecturer list + department catalog and exposes
// CRUD mutations via apiFetch. Keeps local state in sync after each call so the
// LecturerManagement panel never has to refetch the whole list.
const useLecturers = ({ onLecturersUpdate } = {}) => {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  const broadcast = useCallback(
    (next) => {
      onLecturersUpdate?.(next);
    },
    [onLecturersUpdate]
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [lecturerData, departmentData] = await Promise.all([
        apiFetch("/api/lecturers"),
        apiFetch("/api/departments", { auth: false }).catch(() => []),
      ]);
      const nextLecturers = Array.isArray(lecturerData) ? lecturerData : [];
      setLecturers(nextLecturers);
      setDepartments(Array.isArray(departmentData) ? departmentData : []);
      broadcast(nextLecturers);
    } catch (err) {
      setError(err?.message || "שגיאה בטעינת המרצים");
      setLecturers([]);
      broadcast([]);
    } finally {
      setLoading(false);
    }
  }, [broadcast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createLecturer = useCallback(
    async (payload) => {
      setMutating(true);
      setError("");
      try {
        const created = await apiFetch("/api/lecturers", {
          method: "POST",
          body: payload,
        });
        setLecturers((prev) => {
          const next = [...prev, created];
          broadcast(next);
          return next;
        });
        return created;
      } finally {
        setMutating(false);
      }
    },
    [broadcast]
  );

  const updateLecturer = useCallback(
    async (id, payload) => {
      setMutating(true);
      setError("");
      try {
        const updated = await apiFetch(`/api/lecturers/${id}`, {
          method: "PUT",
          body: payload,
        });
        setLecturers((prev) => {
          const next = prev.map((l) => (l._id === id ? updated : l));
          broadcast(next);
          return next;
        });
        return updated;
      } finally {
        setMutating(false);
      }
    },
    [broadcast]
  );

  const deleteLecturer = useCallback(
    async (id) => {
      setMutating(true);
      setError("");
      try {
        await apiFetch(`/api/lecturers/${id}`, { method: "DELETE" });
        setLecturers((prev) => {
          const next = prev.filter((l) => l._id !== id);
          broadcast(next);
          return next;
        });
      } finally {
        setMutating(false);
      }
    },
    [broadcast]
  );

  return {
    lecturers,
    departments,
    loading,
    mutating,
    error,
    setError,
    refetch: fetchAll,
    createLecturer,
    updateLecturer,
    deleteLecturer,
  };
};

export default useLecturers;
