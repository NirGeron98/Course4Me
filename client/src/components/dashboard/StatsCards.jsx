import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, TrendingUp, Users, HelpCircle } from 'lucide-react';

const StatsCards = ({ 
  coursesCount, 
  reviewsCount,
  refreshData,
  isLoadedFromCache = false,
  allCoursesCount, 
  lecturersCount,
  contactRequestsCount = 0
}) => {
  const navigate = useNavigate();
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
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Tracked Courses */}
      <div
        onClick={() => navigate('/tracked-courses')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 rounded-full p-3">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{coursesCount}</h3>
            <p className="text-gray-600">הקורסים שלי</p>
          </div>
        </div>
      </div>

      {/* My Reviews */}
      <div
        onClick={() => navigate('/my-reviews')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-full p-3">
            <MessageSquare className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{reviewsCount}</h3>
            <p className="text-gray-600">ביקורות שכתבתי</p>
          </div>
        </div>
      </div>

      {/* Total Courses */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{allCoursesCount}</h3>
            <p className="text-gray-600">קורסים במערכת</p>
          </div>
        </div>
      </div>

      {/* My Contact Requests */}
      <div
        onClick={() => navigate('/my-contact-requests')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 rounded-full p-3">
            <HelpCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{contactRequestsCount}</h3>
            <p className="text-gray-600">הפניות שלי</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsCards;
