import React, { useEffect, useState } from "react";
import axios from "axios";
import CourseDetailsModal from "../components/tracked-courses/CourseDetailsModal";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import TrackedCoursesList from "../components/dashboard/TrackedCoursesList";
import CourseCarousel from "../components/dashboard/CourseCarousel";
import LecturerCarousel from "../components/dashboard/LecturerCarousel";
import ElegantLoadingSpinner, { ElegantSecondaryLoading } from "../components/common/ElegantLoadingSpinner";
import StatsCards from "../components/dashboard/StatsCards";
import ContactRequestModal from "../components/common/ContactRequestModal";
import { dashboardCache, initializeCacheCleanup } from "../utils/cacheUtils";
import { MessageCircle } from "lucide-react";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSecondaryLoading, setIsSecondaryLoading] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);
  const [trackedCourses, setTrackedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    coursesCount: 0,
    reviewsCount: 0
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [courseCarouselIndex, setCourseCarouselIndex] = useState(0);
  const [lecturerCarouselIndex, setLecturerCarouselIndex] = useState(0);
  const [trackedCarouselIndex, setTrackedCarouselIndex] = useState(0);

  // Cache configuration
  const CACHE_KEYS = {
    TRACKED_COURSES: 'tracked_courses',
    ALL_COURSES: 'all_courses',
    LECTURERS: 'lecturers',
    STATS: 'stats'
  };

  // Initialize cache cleanup on component mount
  useEffect(() => {
    initializeCacheCleanup();
  }, []);

  const fetchFreshData = async (token, userId, isBackground = false) => {
    try {
      if (isBackground) {
        setIsSecondaryLoading(true);
      }

      // Load critical data first (tracked courses and stats)
      const trackedRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Load other data in parallel
      const [coursesRes, lecturersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      // Fetch review data
      let totalReviews = 0;
      
      try {
        const courseReviewsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userCourseReviews = filterReviewsByUser(courseReviewsRes.data, userId);
        totalReviews += userCourseReviews.length;
      } catch (error) {
        // No course reviews endpoint or error
      }

      try {
        const lecturerReviewsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userLecturerReviews = filterReviewsByUser(lecturerReviewsRes.data, userId);
        totalReviews += userLecturerReviews.length;
      } catch (error) {
        // No lecturer reviews endpoint or error
      }

      const newStats = {
        coursesCount: trackedRes.data.length,
        reviewsCount: totalReviews
      };

      // Update state
      setTrackedCourses(trackedRes.data);
      setAllCourses(coursesRes.data);
      setLecturers(lecturersRes.data);
      setStats(newStats);

      // Save to cache using cache manager
      dashboardCache.saveToCache(CACHE_KEYS.TRACKED_COURSES, trackedRes.data);
      dashboardCache.saveToCache(CACHE_KEYS.ALL_COURSES, coursesRes.data);
      dashboardCache.saveToCache(CACHE_KEYS.LECTURERS, lecturersRes.data);
      dashboardCache.saveToCache(CACHE_KEYS.STATS, newStats);

    } catch (error) {
      // Error fetching fresh data, keep cached data if available
    } finally {
      setIsLoading(false);
      setIsSecondaryLoading(false);
    }
  };

  // Function to refresh data manually (for example, after tracking/untracking courses)
  const refreshData = async () => {
    dashboardCache.clearAllCache();
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      await fetchFreshData(token, userId, false);
    }
  };

  // Expose refresh function globally for other components
  useEffect(() => {
    window.refreshDashboardData = refreshData;
    return () => {
      delete window.refreshDashboardData;
    };
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'דף הבית - Course4Me';
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  const formatLecturersDisplay = (lecturers, max = 3, badgeClassName = "bg-blue-200 text-blue-800") => {
    if (!Array.isArray(lecturers) || lecturers.length === 0) return "לא זמין";

    const lecturerNames = lecturers
      .map(l => typeof l === "string" ? l : l?.name || "")
      .filter(Boolean);

    const displayed = lecturerNames.slice(0, max).join(", ");
    const remaining = lecturerNames.length - max;

    return (
      <span className="flex items-center gap-2 flex-wrap">
        <span>{displayed}</span>
        {remaining > 0 && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${badgeClassName}`}>
            +{remaining} מרצים נוספים
          </span>
        )}
      </span>
    );
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleTrackedCourseClick = (trackedCourse) => {
    const course = trackedCourse?.course;
    if (course) {
      handleCourseClick(course);
    }
  };

  const filterReviewsByUser = (reviews, userId) => {

    const filtered = reviews.filter(review => {
      return (typeof review.user === "string" && review.user === userId) ||
        (typeof review.user === "object" && review.user._id === userId);
    });

    return filtered;
  };


  useEffect(() => {
    const loadDataWithCache = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token) return;

        const userFullName = localStorage.getItem("userFullName") || "User";
        setUserName(userFullName);

        // Check if we have valid cached data using cache manager
        if (dashboardCache.isCacheValid(CACHE_KEYS.TRACKED_COURSES)) {
          const cachedTrackedCourses = dashboardCache.getFromCache(CACHE_KEYS.TRACKED_COURSES);
          const cachedAllCourses = dashboardCache.getFromCache(CACHE_KEYS.ALL_COURSES);
          const cachedLecturers = dashboardCache.getFromCache(CACHE_KEYS.LECTURERS);
          const cachedStats = dashboardCache.getFromCache(CACHE_KEYS.STATS);

          if (cachedTrackedCourses && cachedAllCourses && cachedLecturers && cachedStats) {
            // Load from cache immediately
            setTrackedCourses(cachedTrackedCourses);
            setAllCourses(cachedAllCourses);
            setLecturers(cachedLecturers);
            setStats(cachedStats);
            setIsLoading(false);
            setIsLoadedFromCache(true);
            
            // Hide cache message after 2 seconds
            setTimeout(() => setIsLoadedFromCache(false), 2000);
            
            // Optionally fetch fresh data in background
            setTimeout(() => fetchFreshData(token, userId, true), 100);
            return;
          }
        }

        // No valid cache, fetch fresh data with loading indicator
        await fetchFreshData(token, userId, false);
        
      } catch (error) {
        setIsLoading(false);
      }
    };

    loadDataWithCache();
  }, []);

  // Listen for changes to tracked courses from other tabs/components
  useEffect(() => {
    const handleTrackedCourseAdded = () => {
      // Refresh data if a course was added
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        fetchFreshData(token, userId, true);
      }
    };

    const handleTrackedCourseRemoved = () => {
      // Refresh data if a course was removed
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (token && userId) {
        fetchFreshData(token, userId, true);
      }
    };

    // האזנה לאירוע טעינה מקדימה של קורסים במעקב
    const handleTrackedCoursesPreloaded = () => {
      // אם המטמון תקף, נטען מחדש את הנתונים
      if (dashboardCache.isCacheValid(CACHE_KEYS.TRACKED_COURSES)) {
        const cachedTrackedCourses = dashboardCache.getFromCache(CACHE_KEYS.TRACKED_COURSES);
        if (cachedTrackedCourses && Array.isArray(cachedTrackedCourses)) {
          setTrackedCourses(cachedTrackedCourses);
        }
      }
    };

    // Listen for localStorage changes from other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'trackedCourseChanged') {
        // A tracked course was changed in another tab
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (token && userId) {
          fetchFreshData(token, userId, true);
        }
      }
    };

    // Add event listeners
    window.addEventListener('trackedCourseAdded', handleTrackedCourseAdded);
    window.addEventListener('trackedCourseRemoved', handleTrackedCourseRemoved);
    window.addEventListener('trackedCoursesPreloaded', handleTrackedCoursesPreloaded);
    window.addEventListener('storage', handleStorageChange);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('trackedCourseAdded', handleTrackedCourseAdded);
      window.removeEventListener('trackedCourseRemoved', handleTrackedCourseRemoved);
      window.removeEventListener('trackedCoursesPreloaded', handleTrackedCoursesPreloaded);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (allCourses.length > 3) {
      const interval = setInterval(() => {
        setCourseCarouselIndex(prev =>
          prev >= allCourses.length - 3 ? 0 : prev + 1
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [allCourses.length]);

  useEffect(() => {
    if (lecturers.length > 3) {
      const interval = setInterval(() => {
        setLecturerCarouselIndex(prev =>
          prev >= lecturers.length - 3 ? 0 : prev + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [lecturers.length]);

  const handleCourseCarouselPrev = () => {
    setCourseCarouselIndex(prev =>
      prev <= 0 ? Math.max(0, allCourses.length - 3) : prev - 1
    );
  };

  const handleCourseCarouselNext = () => {
    setCourseCarouselIndex(prev =>
      prev >= allCourses.length - 3 ? 0 : prev + 1
    );
  };

  const handleLecturerCarouselPrev = () => {
    setLecturerCarouselIndex(prev =>
      prev <= 0 ? Math.max(0, lecturers.length - 3) : prev - 1
    );
  };

  const handleLecturerCarouselNext = () => {
    setLecturerCarouselIndex(prev =>
      prev >= lecturers.length - 3 ? 0 : prev + 1
    );
  };

  const visibleCourses = allCourses.slice(courseCarouselIndex, courseCarouselIndex + 3);
  const visibleLecturers = lecturers.slice(lecturerCarouselIndex, lecturerCarouselIndex + 3);
  const visibleTrackedCourses = trackedCourses.slice(trackedCarouselIndex, trackedCarouselIndex + 3);

  const handleTrackedPrev = () => {
    setTrackedCarouselIndex(prev =>
      prev <= 0 ? Math.max(0, trackedCourses.length - 3) : prev - 1
    );
  };

  const handleTrackedNext = () => {
    setTrackedCarouselIndex(prev =>
      prev >= trackedCourses.length - 3 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return <ElegantLoadingSpinner message="טוען נתונים" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50" dir="rtl">
      <WelcomeHeader userName={userName} />
      
      {/* Contact Request Button - Positioned at left side of screen, below header */}
      <div className="absolute left-4 top-72 z-30 hidden lg:block">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-72 xl:w-80">
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-100 to-pink-100 p-3 rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">יש לך בקשה?</h3>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              קורס, מרצה, שאלה או הצעה?
            </p>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm hover:gap-3"
            >
              <MessageCircle className="w-4 h-4" />
              <span>פתח פניה</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Contact Request Button - Appears only on mobile, positioned below header */}
      <div className="lg:hidden relative max-w-6xl mx-auto px-4 -mt-2 mb-4 z-30">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full max-w-xs sm:max-w-sm mt-3">
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-100 to-pink-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">יש לך בקשה?</h3>
              <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                קורס, מרצה, שאלה או הצעה?
              </p>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>פתח פניה</span>
              </button>
            </div>
          </div>
        </div>
      </div>
        
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <StatsCards
          coursesCount={stats.coursesCount}
          reviewsCount={stats.reviewsCount}
          refreshData={refreshData}
          isLoadedFromCache={isLoadedFromCache}
          allCoursesCount={allCourses.length}
          lecturersCount={lecturers.length}
        />

        <TrackedCoursesList
          trackedCourses={trackedCourses}
          visibleCourses={visibleTrackedCourses}
          carouselIndex={trackedCarouselIndex}
          setCarouselIndex={setTrackedCarouselIndex}
          onPrev={handleTrackedPrev}
          onNext={handleTrackedNext}
          onCourseClick={handleTrackedCourseClick}
          formatLecturersDisplay={formatLecturersDisplay}
        />

        <CourseCarousel
          courses={allCourses}
          visibleCourses={visibleCourses}
          carouselIndex={courseCarouselIndex}
          onPrev={handleCourseCarouselPrev}
          onNext={handleCourseCarouselNext}
          onCourseClick={handleCourseClick}
          formatLecturersDisplay={formatLecturersDisplay}
          setCarouselIndex={setCourseCarouselIndex}
        />
        <LecturerCarousel
          lecturers={lecturers}
          visibleLecturers={visibleLecturers}
          carouselIndex={lecturerCarouselIndex}
          onPrev={handleLecturerCarouselPrev}
          onNext={handleLecturerCarouselNext}
          setCarouselIndex={setLecturerCarouselIndex}
        />
      </div>
      {isModalOpen && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}
      
      {/* Contact Request Modal */}
      <ContactRequestModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
