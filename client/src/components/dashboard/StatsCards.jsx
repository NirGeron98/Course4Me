import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, TrendingUp, Users, HelpCircle } from 'lucide-react';

const StatsCards = ({ 
  coursesCount, 
  trackedLecturersCount,
  contactRequestsCount,
  refreshData,
  isLoadedFromCache = false,
  allCoursesCount, 
  lecturersCount
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

    const handleTrackedLecturerChanged = () => {
      // When a lecturer is added/removed from tracking, refresh stats data
      if (refreshData) {
        refreshData();
      }
    };

    const handleContactRequestChanged = () => {
      // When a contact request is added/updated/deleted, refresh stats data
      if (refreshData) {
        refreshData();
      }
    };

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'trackedCourseChanged' || 
          event.key === 'trackedLecturerChanged' ||
          event.key === 'contactRequestChanged') {
        // Changes that should trigger stats update
        if (refreshData) {
          refreshData();
        }
      }
    };

    // Add event listeners
    window.addEventListener('trackedCourseAdded', handleTrackedCourseChanged);
    window.addEventListener('trackedCourseRemoved', handleTrackedCourseChanged);
    window.addEventListener('trackedLecturerAdded', handleTrackedLecturerChanged);
    window.addEventListener('trackedLecturerRemoved', handleTrackedLecturerChanged);
    window.addEventListener('contactRequestAdded', handleContactRequestChanged);
    window.addEventListener('contactRequestUpdated', handleContactRequestChanged);
    window.addEventListener('storage', handleStorageChange);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('trackedCourseAdded', handleTrackedCourseChanged);
      window.removeEventListener('trackedCourseRemoved', handleTrackedCourseChanged);
      window.removeEventListener('trackedLecturerAdded', handleTrackedLecturerChanged);
      window.removeEventListener('trackedLecturerRemoved', handleTrackedLecturerChanged);
      window.removeEventListener('contactRequestAdded', handleContactRequestChanged);
      window.removeEventListener('contactRequestUpdated', handleContactRequestChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshData]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* Tracked Courses */}
      <div
        onClick={() => navigate('/tracked-courses')}
        className="bg-white rounded-2xl p-4 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-emerald-100 rounded-full p-3">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{coursesCount}</h3>
            <p className="text-sm text-gray-600">הקורסים שלי</p>
          </div>
        </div>
      </div>


      {/* My Lecturers */}
      <div
        onClick={() => navigate('/lecturers')}
        className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-purple-100 rounded-full p-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{trackedLecturersCount}</h3>
            <p className="text-sm text-gray-600">המרצים שלי</p>
          </div>
        </div>
      </div>

      {/* My Contact Requests */}
      <div
        onClick={() => navigate('/my-contact-requests')}
        className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-orange-100 rounded-full p-3">
            <HelpCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{contactRequestsCount}</h3>
            <p className="text-sm text-gray-600">הפניות שלי</p>
          </div>
        </div>
      </div>

      {/* Total Courses */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-blue-100 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{allCoursesCount}</h3>
            <p className="text-sm text-gray-600">קורסים במערכת</p>
          </div>
        </div>
      </div>

      {/* Total Lecturers */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-purple-100 rounded-full p-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{lecturersCount}</h3>
            <p className="text-sm text-gray-600">מרצים במערכת</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsCards;
