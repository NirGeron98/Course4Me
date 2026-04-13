import React, { useEffect, useMemo, useState } from "react";
import { Trash2, MessageSquare } from "lucide-react";
import FilterBar from "../../common/admin/FilterBar";
import ListTable from "../../common/admin/ListTable";
import RowActions from "../../common/admin/RowActions";
import Card from "../../common/Card";
import Modal, { ModalFooter } from "../../common/Modal";
import Button from "../../common/Button";
import useAdminContactRequests from "../../../hooks/useAdminContactRequests";
import { getSubjectLabel } from "./StatusBadge";
import {
  STAT_CARDS,
  contactRequestColumns,
} from "./ContactRequestRow";
import ContactRequestDetailsModal from "./ContactRequestDetailsModal";

// ContactRequestManagement — admin panel for reviewing and responding to
// contact requests. All data access is delegated to useAdminContactRequests
// (apiFetch under the hood). The "view message" + update flow opens a
// dedicated modal so the list view stays compact.

const ContactRequestManagement = ({ onMessage, onError }) => {
  const {
    requests,
    loading,
    mutating,
    error,
    fetchRequests,
    updateRequestStatus,
    updateAdminResponse,
    deleteAdminResponse,
    deleteRequest,
  } = useAdminContactRequests();

  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [activeRequest, setActiveRequest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchRequests({ status: filters.status });
  }, [filters.status, fetchRequests]);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const filteredRequests = useMemo(() => {
    if (!filters.search.trim()) return requests;
    const needle = filters.search.trim().toLowerCase();
    return requests.filter((r) =>
      [r.description, r.user?.fullName, r.user?.email, getSubjectLabel(r.subject)]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle))
    );
  }, [requests, filters.search]);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      answered: requests.filter((r) => r.status === "answered").length,
    }),
    [requests]
  );

  const handleUpdateStatus = async (id, status, adminResponse) => {
    try {
      const updated = await updateRequestStatus(
        id,
        status || activeRequest?.status,
        adminResponse
      );
      onMessage?.("הפנייה עודכנה בהצלחה");
      setActiveRequest(updated);
    } catch (err) {
      onError?.(err?.message || "שגיאה בעדכון הפנייה");
    }
  };

  const handleUpdateResponse = async (id, response) => {
    try {
      const updated = await updateAdminResponse(id, response);
      onMessage?.("התגובה עודכנה בהצלחה");
      setActiveRequest(updated);
    } catch (err) {
      onError?.(err?.message || "שגיאה בעדכון התגובה");
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      const updated = await deleteAdminResponse(id);
      onMessage?.("התגובה נמחקה בהצלחה");
      setActiveRequest(updated);
    } catch (err) {
      onError?.(err?.message || "שגיאה במחיקת התגובה");
    }
  };

  const confirmDeleteRequest = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRequest(deleteTarget._id);
      onMessage?.("הפנייה נמחקה בהצלחה");
      if (activeRequest?._id === deleteTarget._id) setActiveRequest(null);
    } catch (err) {
      onError?.(err?.message || "שגיאה במחיקת הפנייה");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.key} padding="sm" className={stat.tone}>
            <p className="text-xs font-medium opacity-80">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{counts[stat.key]}</p>
          </Card>
        ))}
      </div>

      <FilterBar
        searchValue={filters.search}
        onSearchChange={(next) => setFilters((prev) => ({ ...prev, search: next }))}
        searchPlaceholder="חפש לפי נושא, פונה או תוכן..."
        onRefresh={() => fetchRequests({ status: filters.status })}
        refreshing={loading}
      >
        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, status: event.target.value }))
          }
          className="rounded-button bg-surface-raised border border-slate-300 text-sm px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="pending">ממתין לטיפול</option>
          <option value="in_progress">בטיפול</option>
          <option value="answered">נענתה</option>
        </select>
      </FilterBar>

      <ListTable
        columns={contactRequestColumns}
        rows={filteredRequests}
        loading={loading}
        emptyTitle="אין פניות להצגה"
        emptyDescription="לא נמצאו פניות התואמות את הסינון שנבחר"
        emptyIcon={MessageSquare}
        renderRowActions={(row) => (
          <RowActions
            onView={() => setActiveRequest(row)}
            onDelete={() => setDeleteTarget(row)}
            disabled={mutating}
            viewLabel="פתח לטיפול"
          />
        )}
      />

      {activeRequest && (
        <ContactRequestDetailsModal
          request={activeRequest}
          mutating={mutating}
          error={error}
          onClose={() => setActiveRequest(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateResponse={handleUpdateResponse}
          onDeleteResponse={handleDeleteResponse}
          onRequestDelete={(req) => setDeleteTarget(req)}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת פנייה"
        description="כל המידע לרבות התגובות יימחק. פעולה זו אינה ניתנת לביטול."
        size="sm"
      >
        <p className="text-sm text-slate-700" dir="rtl">
          {`האם אתה בטוח שברצונך למחוק את הפנייה בנושא "${getSubjectLabel(
            deleteTarget?.subject
          )}"?`}
        </p>
        <ModalFooter className="-mx-6 -mb-5 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={mutating}
          >
            ביטול
          </Button>
          <Button
            type="button"
            variant="danger"
            leftIcon={Trash2}
            loading={mutating}
            onClick={confirmDeleteRequest}
          >
            מחק פנייה
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ContactRequestManagement;
