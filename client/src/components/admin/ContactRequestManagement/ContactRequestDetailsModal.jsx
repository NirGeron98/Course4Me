import React, { useEffect, useState } from "react";
import { Save, User, Mail, Calendar, Trash2, Edit3 } from "lucide-react";
import Modal, { ModalFooter } from "../../common/Modal";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Alert from "../../common/Alert";
import StatusBadge, { getSubjectLabel } from "./StatusBadge";

// ContactRequestDetailsModal — view + mutate a single contact request.
// Embeds the original message, any prior admin response (with inline edit /
// delete), and the admin actions form (status + new response). All mutations
// flow back to the parent via the onXxx callbacks so this component stays
// free of network calls.

const STATUS_OPTIONS = [
  { value: "pending", label: "ממתין לטיפול" },
  { value: "in_progress", label: "בטיפול" },
  { value: "answered", label: "נענתה" },
];

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ContactRequestDetailsModal = ({
  request,
  mutating,
  error,
  onClose,
  onUpdateStatus,
  onUpdateResponse,
  onDeleteResponse,
  onRequestDelete,
}) => {
  const [statusDraft, setStatusDraft] = useState("");
  const [responseDraft, setResponseDraft] = useState("");
  const [editingResponse, setEditingResponse] = useState(false);
  const [responseEditDraft, setResponseEditDraft] = useState("");

  useEffect(() => {
    if (request) {
      setStatusDraft("");
      setResponseDraft("");
      setEditingResponse(false);
      setResponseEditDraft(request.adminResponse || "");
    }
  }, [request]);

  if (!request) return null;

  const handleSaveUpdate = () => {
    if (!statusDraft && !responseDraft.trim()) return;
    onUpdateStatus?.(request._id, statusDraft, responseDraft.trim());
  };

  const handleSaveResponseEdit = () => {
    if (!responseEditDraft.trim()) return;
    onUpdateResponse?.(request._id, responseEditDraft.trim());
    setEditingResponse(false);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={getSubjectLabel(request.subject)}
      description={formatDate(request.createdAt)}
      size="lg"
    >
      <div className="flex flex-col gap-5" dir="rtl">
        {error && <Alert type="error" message={error} />}

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={request.status} />
          <span className="inline-flex items-center text-sm text-muted gap-1">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {formatDate(request.createdAt)}
          </span>
        </div>

        <div className="bg-surface-sunken rounded-card p-3 text-sm text-slate-700 border border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted mb-2">
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              {request.user?.fullName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              {request.user?.email}
            </span>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{request.description}</p>
        </div>

        {request.adminResponse && (
          <div className="border border-emerald-100 bg-emerald-50/40 rounded-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-emerald-700">תגובה קיימת</h5>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingResponse((prev) => !prev)}
                  className="p-1.5 text-slate-500 hover:text-brand hover:bg-brand/10 rounded-button transition-colors duration-ui ease-ui"
                  title="ערוך תגובה"
                >
                  <Edit3 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteResponse?.(request._id)}
                  className="p-1.5 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-button transition-colors duration-ui ease-ui"
                  title="מחק תגובה"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {editingResponse ? (
              <div className="space-y-2">
                <Input
                  as="textarea"
                  rows={4}
                  value={responseEditDraft}
                  onChange={(event) => setResponseEditDraft(event.target.value)}
                  maxLength={1000}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Save}
                    loading={mutating}
                    onClick={handleSaveResponseEdit}
                  >
                    שמור
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {request.adminResponse}
              </p>
            )}
            {request.respondedBy && (
              <p className="text-xs text-muted mt-2">
                נענה על ידי: {request.respondedBy.fullName}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h5 className="text-sm font-semibold text-slate-800">עדכון הפנייה</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                סטטוס חדש
              </label>
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value)}
                className="w-full rounded-button bg-surface-raised border border-slate-300 text-sm px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:border-brand"
              >
                <option value="">בחר סטטוס...</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            as="textarea"
            rows={3}
            label="תגובה למשתמש"
            value={responseDraft}
            onChange={(event) => setResponseDraft(event.target.value)}
            placeholder="הכנס תגובה למשתמש..."
            maxLength={1000}
            hint={`${responseDraft.length}/1000`}
          />
        </div>
      </div>

      <ModalFooter className="-mx-6 -mb-5 mt-6">
        <Button
          type="button"
          variant="danger"
          leftIcon={Trash2}
          onClick={() => onRequestDelete?.(request)}
          disabled={mutating}
        >
          מחק פנייה
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={mutating}
        >
          סגור
        </Button>
        <Button
          type="button"
          variant="primary"
          leftIcon={Save}
          loading={mutating}
          onClick={handleSaveUpdate}
          disabled={!statusDraft && !responseDraft.trim()}
        >
          שמור עדכון
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ContactRequestDetailsModal;
