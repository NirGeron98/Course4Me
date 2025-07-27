import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import AddLecturerPopup from "../components/tracked-lecturers/AddLecturerPopup";
import TrackedLecturerCard from "../components/tracked-lecturers/TrackedLecturerCard";
import { getLecturerSlug } from '../utils/slugUtils';
import ElegantLoadingSpinner from '../components/common/ElegantLoadingSpinner';

const TrackedLecturers = () => {
  const [trackedLecturers, setTrackedLecturers] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cache configuration
  const CACHE_KEY = 'tracked_lecturers_data';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache helper functions
  const isCacheValid = () => {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return false;
    
    const { timestamp } = JSON.parse(cacheData);
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const saveToCache = (data) => {
    try {
      const cacheData = {
        trackedLecturers: data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      // Storage full or disabled, ignore
    }
  };

  const getFromCache = () => {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;
      
      const { trackedLecturers } = JSON.parse(cacheData);
      return trackedLecturers;
    } catch (error) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  // Set page title
  useEffect(() => {
    document.title = 'המרצים שלי - Course4Me';

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  // Fetch tracked lecturers from API
  const fetchTrackedLecturers = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh && isCacheValid()) {
        const cachedData = getFromCache();
        if (cachedData && Array.isArray(cachedData)) {
          setTrackedLecturers(cachedData);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter out any tracked lecturers with null/undefined lecturer objects
      const validTrackedLecturers = res.data.filter(({ lecturer }) => lecturer && lecturer._id);
      setTrackedLecturers(validTrackedLecturers);
      
      // Save to cache
      saveToCache(validTrackedLecturers);
    } catch (err) {
      console.error("Failed to fetch tracked lecturers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for tracked lecturer changes from other components/tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'trackedLecturerChanged') {
        // Force refresh when a lecturer is added/removed/updated from tracking
        fetchTrackedLecturers(true);
        // Clean up the flag
        localStorage.removeItem(e.key);
      }
    };

    // Listen for custom events for lecturer tracking changes within the same tab
    const handleTrackedLecturerChange = () => {
      fetchTrackedLecturers(true);
    };

    // Listen for review events that should update the lecturer data
    const handleReviewEvent = async (event) => {
      try {
        // Check if we have valid lecturer data in the event
        const lecturerId = event.detail?.lecturerId;
        
        // If we have a lecturer ID, fetch the specific lecturer's updated data
        if (lecturerId) {
          
          const token = localStorage.getItem("token");
          
          // First get the lecturer's updated data directly from the API to ensure accurate ratings
          const lecturerRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${lecturerId}`, 
            {headers: { Authorization: `Bearer ${token}` }}
          );
          
          // Now update the specific lecturer in our tracked list
          if (lecturerRes.status === 200) {
            const updatedLecturerData = lecturerRes.data;

            // Update in the state
            setTrackedLecturers(prev => prev.map(item => {
              if (item.lecturer && item.lecturer._id === lecturerId) {
                return { ...item, lecturer: updatedLecturerData };
              }
              return item;
            }));
            
            // Update in cache - this is critical to fix the display issue
            const cachedData = getFromCache();
            if (cachedData && Array.isArray(cachedData)) {
              const updatedCache = cachedData.map(item => {
                if (item.lecturer && item.lecturer._id === lecturerId) {
                  return { ...item, lecturer: updatedLecturerData };
                }
                return item;
              });
              
              // Clear the old cache and save new data
              localStorage.removeItem(CACHE_KEY);
              saveToCache(updatedCache);
              
              // Also force a cross-tab sync
              localStorage.setItem('trackedLecturerChanged', JSON.stringify({
                lecturerId: lecturerId,
                action: 'updated',
                timestamp: Date.now()
              }));
            }
          } else {
            // If we couldn't get specific lecturer data, refresh everything
            fetchTrackedLecturers(true);
          }
        } else {
          // If no specific lecturer ID was provided, refresh everything
          fetchTrackedLecturers(true);
        }
      } catch (err) {
        console.error("Error updating lecturer after review event:", err);
        // In case of error, fall back to refreshing everything
        fetchTrackedLecturers(true);
      }
    };

    // Handle specific lecturer data updates directly
    const handleLecturerDataUpdated = (event) => {
      if (event.detail && event.detail.lecturerId && event.detail.data) {

        // For review deletions, we need to be extra careful to update completely
        const isReviewDeleted = event.detail.action === 'reviewDeleted';
        
        if (isReviewDeleted) {
          // Force a full refresh instead of just updating the cache
          fetchTrackedLecturers(true);
          return;
        }
        
        // For other updates, update the specific lecturer in our state
        setTrackedLecturers(prev => prev.map(item => {
          if (item.lecturer && item.lecturer._id === event.detail.lecturerId) {
            // Create a fresh object to ensure React detects the change
            return { 
              ...item, 
              lecturer: {
                ...event.detail.data,
                // Make absolutely sure rating data is updated correctly
                averageRating: event.detail.data.ratingsCount > 0 ? event.detail.data.averageRating : null,
                ratingsCount: event.detail.data.ratingsCount || 0
              } 
            };
          }
          return item;
        }));
        
        // Also update the cache - completely replacing it to ensure freshness
        clearCache();
        
        // Get fresh data from the API
        const token = localStorage.getItem("token");
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => res.json())
        .then(data => {
          // Filter out any tracked lecturers with null/undefined lecturer objects
          const validTrackedLecturers = data.filter(({ lecturer }) => lecturer && lecturer._id);
          
          // Save to cache
          saveToCache(validTrackedLecturers);
          
          // Update the state
          setTrackedLecturers(validTrackedLecturers);
        })
        .catch(err => {
          console.error("Failed to fetch updated tracked lecturers:", err);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('trackedLecturerAdded', handleTrackedLecturerChange);
    window.addEventListener('trackedLecturerRemoved', handleTrackedLecturerChange);
    window.addEventListener('trackedLecturerUpdated', handleTrackedLecturerChange);
    window.addEventListener('reviewAdded', handleReviewEvent);
    window.addEventListener('reviewUpdated', handleReviewEvent);
    window.addEventListener('reviewDeleted', handleReviewEvent);
    window.addEventListener('lecturerDataUpdated', handleLecturerDataUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('trackedLecturerAdded', handleTrackedLecturerChange);
      window.removeEventListener('trackedLecturerRemoved', handleTrackedLecturerChange);
      window.removeEventListener('trackedLecturerUpdated', handleTrackedLecturerChange);
      window.removeEventListener('reviewAdded', handleReviewEvent);
      window.removeEventListener('reviewUpdated', handleReviewEvent);
      window.removeEventListener('reviewDeleted', handleReviewEvent);
      window.removeEventListener('lecturerDataUpdated', handleLecturerDataUpdated);
    };
  }, [fetchTrackedLecturers]);

  // Initialize component and fetch data on mount
  useEffect(() => {
    fetchTrackedLecturers();
  }, [fetchTrackedLecturers]);

  // Popup handlers
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  // Callback for when a new lecturer is added
  const onLecturerAdded = () => {
    fetchTrackedLecturers();
    closePopup();
  };

  // Remove lecturer from tracking list
  const handleRemoveLecturer = async (lecturerId) => {
    try {
      const token = localStorage.getItem("token");
      // Send DELETE request to API
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers/${lecturerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state to remove the lecturer immediately
      setTrackedLecturers(prevLecturers =>
        prevLecturers.filter(({ lecturer }) => lecturer._id !== lecturerId)
      );

      // Update cache
      const updatedLecturers = trackedLecturers.filter(({ lecturer }) => lecturer._id !== lecturerId);
      saveToCache(updatedLecturers);

      // Notify other tabs/components about tracked lecturer removal
      const trackingEvent = new CustomEvent('trackedLecturerRemoved', {
        detail: { lecturerId, timestamp: Date.now() }
      });
      window.dispatchEvent(trackingEvent);

      // Update localStorage for cross-tab synchronization
      localStorage.setItem('trackedLecturerChanged', JSON.stringify({
        lecturerId,
        action: 'removed',
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error("Failed to remove lecturer from tracking:", err);
    }
  };

  // Navigate to lecturer details page
  const handleViewLecturerDetails = (lecturer) => {
    navigate(`/lecturer/${getLecturerSlug(lecturer)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/40" dir="rtl">
      {/* Header Section with gradient background */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 text-white py-10 px-6">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-4 right-12 w-20 h-20 bg-white/8 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-12 w-16 h-16 bg-white/8 rounded-full blur-xl"></div>
        </div>

        {/* Add Lecturer Button - positioned at top left */}
        <button
          onClick={openPopup}
          className="absolute top-4 left-4 bg-white text-purple-600 hover:text-purple-700 py-2.5 px-5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group text-sm border-2 border-white hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden sm:inline">הוספת מרצה</span>
        </button>

        {/* Centered header content with title and description */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-white">
            המרצים שלי
          </h1>
          <p className="text-base md:text-lg text-purple-50 font-medium max-w-xl mx-auto leading-relaxed">
            נהל את רשימת המרצים שלך ועקוב אחר עדכונים
          </p>

          {/* Stats or additional info */}
          {!isLoading && trackedLecturers.length > 0 && trackedLecturers.some(({ lecturer }) => lecturer) && (
            <div className="mt-4">
              <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 text-sm">
                <span className="font-semibold">
                 {trackedLecturers.filter(({ lecturer }) => lecturer).length} מרצים במעקב
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto p-6 pb-12">
        {/* Loading spinner and message */}
        {isLoading ? (
          <ElegantLoadingSpinner message="טוען מרצים..." />
        ) : (
          <>
            {/* Empty state - shown when no lecturers or all lecturers are null */}
            {trackedLecturers.length === 0 || trackedLecturers.every(({ lecturer }) => !lecturer) ? (
              <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
                {/* Animated icon with gradient background */}
                <div className="relative mx-auto mb-8 w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full animate-pulse"></div>
                  {/* User/lecturer icon SVG */}
                  <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
                    <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                {/* Empty state title and description */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  עדיין לא עוקבים אחר מרצים
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  התחילו לעקוב אחר המרצים שמעניינים אתכם כדי לקבל גישה מהירה לביקורות ודירוגים
                </p>

                {/* Primary call-to-action button */}
                <button
                  onClick={openPopup}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  הוסיפו את המרצה הראשון
                </button>

                {/* Additional helpful information */}
                <div className="mt-12 text-center">
                  <p className="text-sm text-gray-500 bg-gray-50 px-6 py-3 rounded-full inline-block border">
                    👨‍🏫 עקבו אחר מרצים וקבלו התראות על ביקורות חדשות
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Grid layout for lecturer cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {trackedLecturers
                    .filter(({ lecturer }) => lecturer) // Filter out null/undefined lecturers
                    .map(({ lecturer }) => (
                      <TrackedLecturerCard
                        key={lecturer._id}
                        lecturer={lecturer}
                        onRemove={handleRemoveLecturer}
                        onViewDetails={handleViewLecturerDetails}
                      />
                    ))
                  }
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal for adding new lecturers */}
      {isPopupOpen && (
        <AddLecturerPopup onClose={closePopup} onLecturerAdded={onLecturerAdded} />
      )}
    </div>
  );
};

export default TrackedLecturers;