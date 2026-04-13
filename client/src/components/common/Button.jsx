import React from "react";
import { Loader2 } from "lucide-react";

// Button — the single source of truth for all actionable buttons in the app.
// Variants:
//  - primary: filled brand action
//  - secondary: outlined neutral action
//  - ghost: borderless tonal action
//  - danger: destructive action
// Sizes: sm | md | lg
// Props:
//  - loading: shows a spinner, disables clicks, keeps layout stable
//  - leftIcon / rightIcon: pass a lucide-react icon component (not an element)
//  - fullWidth: stretches to the parent width
const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-button " +
  "transition-all duration-ui ease-ui select-none " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const VARIANTS = {
  primary:
    "bg-brand text-white shadow-card hover:bg-brand-strong hover:shadow-card-hover focus-visible:ring-brand",
  secondary:
    "bg-surface-raised text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
  danger:
    "bg-danger text-white shadow-card hover:bg-danger-strong hover:shadow-card-hover focus-visible:ring-danger",
};

// Sizes are tuned so md/lg meet the ~44px touch target on mobile.
const SIZES = {
  sm: "text-sm px-3 min-h-[36px]",
  md: "text-sm px-4 min-h-[44px] sm:min-h-[40px]",
  lg: "text-base px-5 min-h-[48px] sm:min-h-[44px]",
};

const ICON_SIZES = {
  sm: "w-4 h-4",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const Button = React.forwardRef(function Button(
  {
    as: Tag = "button",
    variant = "primary",
    size = "md",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    loading = false,
    fullWidth = false,
    className = "",
    disabled,
    type,
    children,
    ...rest
  },
  ref
) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const iconClass = ICON_SIZES[size] || ICON_SIZES.md;
  const widthClass = fullWidth ? "w-full" : "";
  const isDisabled = disabled || loading;

  const buttonType = Tag === "button" ? type || "button" : type;

  return (
    <Tag
      ref={ref}
      type={buttonType}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={`${BASE} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...rest}
    >
      {loading ? (
        <Loader2 className={`${iconClass} animate-spin`} aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon className={iconClass} aria-hidden="true" />
      )}
      {children}
      {!loading && RightIcon && (
        <RightIcon className={iconClass} aria-hidden="true" />
      )}
    </Tag>
  );
});

export default Button;
