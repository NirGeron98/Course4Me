import React from "react";
import EmptyState from "../EmptyState";

// ListTable — generic responsive table primitive for admin panels.
// Props:
//  - columns: array of { key, header, width?, align?, className?, render?(row, index) }
//      * render defaults to row[key]
//      * align: "start" | "center" | "end" (defaults to "start")
//  - rows: array of record objects
//  - rowKey: (row, index) => string | number  (defaults to row.id || row._id || index)
//  - loading: when true, renders a skeleton body
//  - skeletonRows: number of skeleton rows to show (default 5)
//  - emptyTitle / emptyDescription / emptyIcon: EmptyState props for zero-row state
//  - onRowClick: optional click handler; when set, rows become interactive
//  - actionsColumn: optional node rendered in the rightmost header cell (e.g., actions label)
//  - renderRowActions: optional (row, index) => node shown in rightmost body cell
//  - className: additional classes on the outer Card container
const ALIGN_CLASS = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const ListTable = ({
  columns = [],
  rows = [],
  rowKey,
  loading = false,
  skeletonRows = 5,
  emptyTitle = "לא נמצאו תוצאות",
  emptyDescription,
  emptyIcon,
  onRowClick,
  actionsHeader,
  renderRowActions,
  className = "",
}) => {
  const getKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row?.id ?? row?._id ?? index;
  };

  const hasActions = typeof renderRowActions === "function";
  const totalCols = columns.length + (hasActions ? 1 : 0);

  return (
    <div
      dir="rtl"
      className={`bg-surface-raised border border-slate-200 rounded-card shadow-card overflow-hidden ${className}`.trim()}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-surface-sunken border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3 font-semibold text-slate-700 ${
                    ALIGN_CLASS[col.align] || ALIGN_CLASS.start
                  } ${col.className || ""}`.trim()}
                >
                  {col.header}
                </th>
              ))}
              {hasActions && (
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold text-slate-700 text-end w-px whitespace-nowrap"
                >
                  {actionsHeader || "פעולות"}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <tr
                  key={`skeleton-${rowIdx}`}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  {Array.from({ length: totalCols }).map((__, colIdx) => (
                    <td key={colIdx} className="px-4 py-3">
                      <div className="h-4 rounded bg-slate-200 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-10">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const key = getKey(row, index);
                const interactive = typeof onRowClick === "function";
                return (
                  <tr
                    key={key}
                    onClick={interactive ? () => onRowClick(row, index) : undefined}
                    className={`border-b border-slate-100 last:border-b-0 transition-colors duration-ui ease-ui ${
                      interactive ? "cursor-pointer hover:bg-slate-50" : ""
                    }`}
                  >
                    {columns.map((col) => {
                      const content = col.render
                        ? col.render(row, index)
                        : row?.[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-slate-800 align-middle ${
                            ALIGN_CLASS[col.align] || ALIGN_CLASS.start
                          } ${col.className || ""}`.trim()}
                        >
                          {content}
                        </td>
                      );
                    })}
                    {hasActions && (
                      <td
                        className="px-4 py-3 text-end align-middle whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {renderRowActions(row, index)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListTable;
