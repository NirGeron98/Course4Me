import React from "react";
import { Search, X, RefreshCw } from "lucide-react";
import Input from "../Input";
import Button from "../Button";

// FilterBar — modular search + filters row for admin list pages.
// Props:
//  - searchValue: controlled value of the search input
//  - onSearchChange: (nextValue) => void
//  - searchPlaceholder: Hebrew placeholder for the search box
//  - onClearSearch: optional handler that clears the search field
//  - onRefresh: optional refresh callback; renders a secondary refresh button
//  - refreshing: shows spinner state on the refresh button
//  - primaryAction: optional { label, icon, onClick, disabled } for the main CTA
//  - children: arbitrary extra filter controls (selects, toggles) rendered before actions
//  - className: extra classes for the outer wrapper
const FilterBar = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "חיפוש...",
  onClearSearch,
  onRefresh,
  refreshing = false,
  primaryAction,
  children,
  className = "",
}) => {
  const handleSearchChange = (event) => {
    onSearchChange?.(event.target.value);
  };

  const handleClear = () => {
    if (onClearSearch) {
      onClearSearch();
      return;
    }
    onSearchChange?.("");
  };

  const showClear = typeof onSearchChange === "function" && searchValue.length > 0;

  return (
    <div
      dir="rtl"
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-card bg-surface-raised border border-slate-200 shadow-card p-3 ${className}`.trim()}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            leftIcon={Search}
            aria-label={searchPlaceholder}
          />
          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="ניקוי חיפוש"
              className="absolute inset-y-0 left-2 my-auto flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-ui ease-ui"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={RefreshCw}
            loading={refreshing}
            onClick={onRefresh}
          >
            רענון
          </Button>
        )}
        {primaryAction && (
          <Button
            variant="primary"
            size="md"
            leftIcon={primaryAction.icon}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            loading={primaryAction.loading}
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
