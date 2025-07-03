import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, X, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import CourseItem from "./CourseItem";
import CourseDetailsModal from "./CourseDetailsModal";

const AddCoursePopup = ({ onClose, onCourseAdded, user }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [trackedCourseIds, setTrackedCourseIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [error, setError] = useState("");
  const [detailsCourse, setDetailsCourse] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getLecturerName = (lecturers) => {
    if (!Array.isArray(lecturers) || lecturers.length === 0) return "";
    const first = lecturers[0];
    if (typeof first === "object" && first.name) return first.name;
    return "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch all courses
        const coursesRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`);
        
        // Fetch user's tracked courses
        const trackedRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const trackedIds = trackedRes.data.map(tc => tc.course._id || tc.course);
        
        setAllCourses(coursesRes.data);
        setTrackedCourseIds(trackedIds);
        
        // Filter out already tracked courses
        const availableCourses = coursesRes.data.filter(course => 
          !trackedIds.includes(course._id)
        );
        
        setFilteredCourses(availableCourses);
      } catch (err) {
        console.error(err);
        setError("שגיאה בטעינת הקורסים");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Filter available courses (not tracked) by search term
    const availableCourses = allCourses.filter(course => 
      !trackedCourseIds.includes(course._id)
    );

    if (searchTerm.length === 0) {
      setFilteredCourses(availableCourses);
      return;
    }

    const filtered = availableCourses.filter((course) => {
      const searchLower = searchTerm.toLowerCase();

      return (
        course.title?.toLowerCase().includes(searchLower) ||
        course.name?.toLowerCase().includes(searchLower) ||
        course.courseNumber?.toLowerCase().includes(searchLower) ||
        getLecturerName(course.lecturers).toLowerCase().includes(searchLower) ||
        course.department?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCourses(filtered);
  }, [searchTerm, allCourses, trackedCourseIds]);

  const handleAddCourse = async (course) => {
    setIsAdding(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      
      // Add course to tracked courses
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`,
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update tracked course IDs to remove this course from available list
      setTrackedCourseIds(prev => [...prev, course._id]);

      // Notify other tabs/components about tracked course addition
      const trackingEvent = new CustomEvent('trackedCourseAdded', {
        detail: { courseId: course._id, timestamp: Date.now() }
      });
      window.dispatchEvent(trackingEvent);

      // Update localStorage for cross-tab synchronization
      localStorage.setItem('trackedCourseChanged', JSON.stringify({
        courseId: course._id,
        action: 'added',
        timestamp: Date.now()
      }));

      // Update TrackedCourses cache
      try {
        const trackedCoursesCache = localStorage.getItem('tracked_courses_data');
        if (trackedCoursesCache) {
          const cacheData = JSON.parse(trackedCoursesCache);
          // Fetch latest course data to ensure we have complete information
          const token = localStorage.getItem("token");
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => null);
          
          if (res && res.data) {
            // Add the new course to cache
            cacheData.trackedCourses.push(res.data);
            cacheData.timestamp = Date.now();
            localStorage.setItem('tracked_courses_data', JSON.stringify(cacheData));
          } else {
            // If we couldn't get the specific course details, invalidate cache
            localStorage.removeItem('tracked_courses_data');
          }
        }
      } catch (error) {
        // If there's any error, invalidate the cache
        localStorage.removeItem('tracked_courses_data');
      }

      // Clear dashboard cache so it refreshes on next visit
      const dashboardCacheItem = localStorage.getItem('dashboard_tracked_courses');
      if (dashboardCacheItem) {
        localStorage.removeItem('dashboard_tracked_courses');
        localStorage.removeItem('dashboard_tracked_courses_timestamp');
      }
      
      // Refresh dashboard data if the global function is available
      if (window.refreshDashboardData) {
        window.refreshDashboardData();
      }
      
      // Call parent callback
      onCourseAdded();
      onClose();
    } catch (err) {
      console.error("Error adding course:", err);
      if (err.response?.status === 400 && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("שגיאה בהוספת הקורס");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isAdding) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        dir="rtl"
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative transform transition-all duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 relative">
            <button
              onClick={onClose}
              disabled={isAdding}
              className="absolute top-4 left-4 text-white hover:text-emerald-200 transition-colors duration-200 bg-white/20 rounded-full p-2 hover:bg-white/30 disabled:opacity-50"
              aria-label="סגור"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 ml-12">
              <div className="ml-3 bg-white/20 rounded-full p-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-right">
                <h2 className="text-2xl font-bold text-white mb-2">הוסף קורס למעקב</h2>
                <p className="text-emerald-100">חפש ובחר את הקורס שברצונך לעקוב אחריו</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-b">
            <div className="relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="חפש לפי שם קורס, מספר קורס, מרצה או מחלקה..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setError("");
                }}
                className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pr-12 pl-4 text-right text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all duration-300"
                autoFocus
                disabled={isAdding}
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">טוען קורסים...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            ) : filteredCourses.length === 0 && searchTerm ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">לא נמצאו קורסים התואמים לחיפוש</p>
                  <p className="text-gray-400 text-sm mt-2">נסה מילות חיפוש אחרות</p>
                </div>
              </div>
            ) : filteredCourses.length === 0 && !searchTerm ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="bg-emerald-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-gray-600 font-medium">אתה עוקב אחרי כל הקורסים!</p>
                  <p className="text-gray-400 text-sm mt-2">אין קורסים נוספים להוספה</p>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96 p-6">
                <div className="space-y-3">
                  {filteredCourses.map((course) => (
                    <CourseItem
                      key={course._id}
                      course={course}
                      onViewDetails={setDetailsCourse}
                      onAdd={handleAddCourse}
                      isAdding={isAdding}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isLoading && !error && (
            <div className="border-t bg-gray-50 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {filteredCourses.length} קורסים זמינים להוספה
                </div>
                <button
                  onClick={onClose}
                  disabled={isAdding}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? "מוסיף..." : "ביטול"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailsCourse && (
        <CourseDetailsModal
          course={detailsCourse}
          onClose={() => setDetailsCourse(null)}
        />
      )}
    </>
  );
};

export default AddCoursePopup;