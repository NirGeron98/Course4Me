import React, { useState, useEffect } from "react";
import { Star, BookMarked, Loader2 } from "lucide-react";

// Elegant loading spinner component
const ElegantLoadingSpinner = ({ message = "טוען...", size = "large" }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center p-8 rounded-xl bg-white shadow-xl animate-fadeIn">
        <div className="animate-spin mb-4">
          {size === "large" ? (
            <Loader2 className="w-16 h-16 text-gray-700" />
          ) : (
            <Loader2 className="w-10 h-10 text-gray-700" />
          )}
        </div>
        <p className="text-lg font-medium text-gray-700 animate-fadeIn">
          {message}
        </p>
      </div>
    </div>
  );
};

// Secondary loading indicator for background operations
export const ElegantSecondaryLoading = ({ message = "מרענן נתונים..." }) => {
  return (
    <div className="fixed bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg flex items-center space-x-3 z-50 rtl:space-x-reverse">
      <div className="animate-spin">
        <Loader2 className="w-5 h-5 text-gray-600" />
      </div>
      <span className="text-sm font-medium text-gray-700">{message}</span>
    </div>
  );
};

// Stats cards component with animation
export const StatsCards = ({ 
  coursesCount, 
  reviewsCount, 
  refreshData, 
  isLoadedFromCache = false
}) => {
  const [showCacheMessage, setShowCacheMessage] = useState(isLoadedFromCache);

  useEffect(() => {
    setShowCacheMessage(isLoadedFromCache);
    if (isLoadedFromCache) {
      const timer = setTimeout(() => setShowCacheMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoadedFromCache]);

  // Listen for changes to tracked courses or reviews that should update stats
  useEffect(() => {
    const handleTrackedCourseChanged = () => {
      // When a tracked course is added/removed, refresh stats data
      if (refreshData) {
        refreshData();
      }
    };

    const handleReviewChanged = () => {
      // When a review is added/updated/deleted, refresh stats data
      if (refreshData) {
        refreshData();
      }
    };

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'trackedCourseChanged' || 
          event.key === 'reviewAdded' || 
          event.key === 'reviewUpdated') {
        // Changes that should trigger stats update
        if (refreshData) {
          refreshData();
        }
      }
    };

    // Add event listeners
    window.addEventListener('trackedCourseAdded', handleTrackedCourseChanged);
    window.addEventListener('trackedCourseRemoved', handleTrackedCourseChanged);
    window.addEventListener('reviewAdded', handleReviewChanged);
    window.addEventListener('reviewUpdated', handleReviewChanged);
    window.addEventListener('storage', handleStorageChange);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('trackedCourseAdded', handleTrackedCourseChanged);
      window.removeEventListener('trackedCourseRemoved', handleTrackedCourseChanged);
      window.removeEventListener('reviewAdded', handleReviewChanged);
      window.removeEventListener('reviewUpdated', handleReviewChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {showCacheMessage && (
        <div className="col-span-1 sm:col-span-2 bg-blue-50 p-2 rounded-lg text-center text-sm text-blue-700">
          נטען מהמטמון ומתרענן ברקע...
        </div>
      )}

      {/* Tracked Courses Stats Card */}
      <div
        className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-5 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-emerald-800">קורסים במעקב</h3>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{coursesCount}</p>
          </div>
          <div className="bg-emerald-200 p-3 rounded-full">
            <BookMarked className="w-7 h-7 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Reviews Stats Card */}
      <div
        className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-5 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800">ביקורות שכתבתי</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">{reviewsCount}</p>
          </div>
          <div className="bg-blue-200 p-3 rounded-full">
            <Star className="w-7 h-7 text-blue-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantLoadingSpinner;