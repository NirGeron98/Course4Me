import React from "react";

// Card — elevated content container built on top of the design tokens.
// Props:
//  - as: HTML tag to render (default: "div").
//  - variant: "default" | "raised" | "sunken" | "flat".
//  - padding: "none" | "sm" | "md" | "lg".
//  - interactive: when true, applies hover elevation + cursor pointer.
//  - className: extra utility classes appended after the token defaults.
const VARIANT_CLASSES = {
  default: "bg-surface-raised border border-slate-200 shadow-card",
  raised: "bg-surface-raised border border-slate-100 shadow-elevated",
  sunken: "bg-surface-sunken border border-slate-200",
  flat: "bg-surface-raised border border-slate-200",
};

const PADDING_CLASSES = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-8",
};

const Card = React.forwardRef(function Card(
  {
    as: Tag = "div",
    variant = "default",
    padding = "md",
    interactive = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;
  const paddingClass = PADDING_CLASSES[padding] ?? PADDING_CLASSES.md;
  const interactiveClass = interactive
    ? "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-ui ease-ui"
    : "transition-shadow duration-ui ease-ui";

  return (
    <Tag
      ref={ref}
      className={`rounded-card ${variantClass} ${paddingClass} ${interactiveClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
});

export default Card;
