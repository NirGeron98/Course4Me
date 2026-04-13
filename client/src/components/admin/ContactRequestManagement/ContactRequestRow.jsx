import React from "react";
import { Calendar } from "lucide-react";
import StatusBadge, { getSubjectLabel } from "./StatusBadge";

// ContactRequestRow — table config + summary cards shared by the panel.
// Kept separate so ContactRequestManagement stays a thin shell.

export const formatRequestDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const STAT_CARDS = [
  { key: "total", label: "סה״כ פניות", tone: "bg-slate-100 text-slate-700" },
  { key: "pending", label: "ממתינות לטיפול", tone: "bg-orange-50 text-orange-700" },
  { key: "in_progress", label: "בטיפול", tone: "bg-blue-50 text-blue-700" },
  { key: "answered", label: "נענו", tone: "bg-emerald-50 text-emerald-700" },
];

export const contactRequestColumns = [
  {
    key: "subject",
    header: "נושא",
    render: (row) => (
      <div className="font-semibold text-slate-800">{getSubjectLabel(row.subject)}</div>
    ),
  },
  {
    key: "user",
    header: "פונה",
    render: (row) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-800">{row.user?.fullName}</span>
        <span className="text-xs text-muted">{row.user?.email}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "סטטוס",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "createdAt",
    header: "נשלחה",
    render: (row) => (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
        {formatRequestDate(row.createdAt)}
      </span>
    ),
  },
];
