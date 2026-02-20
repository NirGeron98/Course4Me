import React from "react";

/**
 * Skeleton loader to avoid layout shift and improve perceived performance.
 * CSS-only; no extra libraries.
 */
export const SkeletonLine = ({ className = "", width = "100%" }) => (
  <div
    className={`h-4 rounded bg-gray-200 animate-pulse ${className}`}
    style={{ width }}
    aria-hidden="true"
  />
);

export const SkeletonCard = () => (
  <div
    className="rounded-xl border border-gray-100 bg-white p-4 space-y-3"
    aria-hidden="true"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
      <SkeletonLine width="60%" />
    </div>
    <SkeletonLine width="100%" />
    <SkeletonLine width="80%" />
    <div className="flex gap-2 pt-1">
      <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
      <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
    </div>
  </div>
);

/** Grid of skeleton cards for list/carousel loading */
export const SkeletonCardGrid = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonLine;
