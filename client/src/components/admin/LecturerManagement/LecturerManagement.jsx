import React, { useEffect, useMemo, useState } from "react";
import { Plus, Users, Trash2 } from "lucide-react";
import FilterBar from "../../common/admin/FilterBar";
import ListTable from "../../common/admin/ListTable";
import Modal, { ModalFooter } from "../../common/Modal";
import Button from "../../common/Button";
import useLecturers from "../../../hooks/useLecturers";
import { lecturerColumns, renderLecturerRowActions } from "./LecturerRow";
import LecturerFormModal from "./LecturerFormModal";

// LecturerManagement — thin shell for the admin panel. All data access lives
// in useLecturers, all row presentation in LecturerRow, and the edit form in
// LecturerFormModal. This component is only responsible for wiring filter +
// list + modals together.

const LecturerManagement = ({ onMessage, onError, onLecturersUpdate }) => {
  const {
    lecturers,
    departments,
    loading,
    mutating,
    error,
    refetch,
    createLecturer,
    updateLecturer,
    deleteLecturer,
  } = useLecturers({ onLecturersUpdate });

  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState(null); // "create" | "edit" | null
  const [activeLecturer, setActiveLecturer] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredLecturers = useMemo(() => {
    if (!search.trim()) return lecturers;
    const needle = search.trim().toLowerCase();
    return lecturers.filter((l) => l.name?.toLowerCase().includes(needle));
  }, [lecturers, search]);

  useEffect(() => {
    if (error) onError?.(error);
  }, [error, onError]);

  const openCreate = () => {
    setActiveLecturer(null);
    setFormError("");
    setFormMode("create");
  };

  const openEdit = (lecturer) => {
    setActiveLecturer(lecturer);
    setFormError("");
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setActiveLecturer(null);
    setFormError("");
  };

  const handleSubmit = async (payload) => {
    try {
      if (formMode === "edit" && activeLecturer) {
        await updateLecturer(activeLecturer._id, payload);
        onMessage?.("המרצה עודכן בהצלחה");
      } else {
        await createLecturer(payload);
        onMessage?.("המרצה נוסף בהצלחה");
      }
      closeForm();
    } catch (err) {
      setFormError(err?.message || "שגיאה בשמירת המרצה");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLecturer(deleteTarget._id);
      onMessage?.("המרצה נמחק בהצלחה");
    } catch (err) {
      onError?.(err?.message || "שגיאה במחיקת המרצה");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="חיפוש לפי שם מרצה..."
        onRefresh={refetch}
        refreshing={loading}
        primaryAction={{
          label: "הוסף מרצה",
          icon: Plus,
          onClick: openCreate,
        }}
      />

      <ListTable
        columns={lecturerColumns}
        rows={filteredLecturers}
        loading={loading}
        emptyTitle="לא נמצאו מרצים"
        emptyDescription={
          search
            ? "נסה להתאים את החיפוש או לנקות את הסינון"
            : "טרם הוזנו מרצים למערכת"
        }
        emptyIcon={Users}
        renderRowActions={renderLecturerRowActions({
          onEdit: openEdit,
          onDelete: setDeleteTarget,
          disabled: mutating,
        })}
      />

      {formMode && (
        <LecturerFormModal
          isOpen
          mode={formMode}
          lecturer={activeLecturer}
          departments={departments}
          submitting={mutating}
          error={formError}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת מרצה"
        description="הפעולה אינה ניתנת לביטול"
        size="sm"
      >
        <p className="text-sm text-slate-700" dir="rtl">
          {`האם אתה בטוח שברצונך למחוק את ${deleteTarget?.name || "המרצה"}?`}
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
            loading={mutating}
            leftIcon={Trash2}
            onClick={confirmDelete}
          >
            מחק מרצה
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LecturerManagement;
