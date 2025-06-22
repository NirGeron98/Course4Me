import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import AddCoursePopup from "../components/tracked-courses/AddCoursePopup";
import TrackedCourseCard from "../components/tracked-courses/TrackedCourseCard";
import CourseDetailsModal from "../components/tracked-courses/CourseDetailsModal";

const TrackedCourses = () => {
  const [trackedCourses, setTrackedCourses] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tracked courses from API
  const fetchTrackedCourses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/tracked-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackedCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch tracked courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize component and fetch data on mount
  useEffect(() => {
    fetchTrackedCourses();
  }, []);

  // Popup handlers
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  // Callback for when a new course is added
  const onCourseAdded = () => {
    fetchTrackedCourses();
    closePopup();
  };

  // Remove course from tracking list
  const handleRemoveCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      // Send DELETE request to API
      await axios.delete(`http://localhost:5000/api/tracked-courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state to remove the course immediately
      setTrackedCourses(prevCourses =>
        prevCourses.filter(({ course }) => course._id !== courseId)
      );
    } catch (err) {
      console.error("Failed to remove course from tracking:", err);
    }
  };

  // Open course details modal
  const handleViewCourseDetails = (course) => {
    console.log("Opening modal for course:", course);
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // Close course details modal and reset selected course
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50/40" dir="rtl">
      {/* Header Section with gradient background */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white py-10 px-6">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-4 right-12 w-20 h-20 bg-white/8 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-12 w-16 h-16 bg-white/8 rounded-full blur-xl"></div>
        </div>

        {/* Add Course Button - positioned at top left */}
        <button
          onClick={openPopup}
          className="absolute top-4 left-4 bg-white text-emerald-600 hover:text-emerald-700 py-2.5 px-5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group text-sm border-2 border-white hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          הוספת קורס
        </button>

        {/* Centered header content with title and description */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-white">
            הקורסים שלי
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-medium max-w-xl mx-auto leading-relaxed">
            נהל את רשימת הקורסים שלך ועקוב אחר עדכונים
          </p>

          {/* Stats or additional info */}
          {!isLoading && trackedCourses.length > 0 && trackedCourses.some(({ course }) => course) && (
            <div className="mt-4">
              <div className="inline-flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 text-sm">
                <span className="font-semibold">
                  עוקב אחר {trackedCourses.filter(({ course }) => course).length} קורסים
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
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">טוען קורסים...</p>
          </div>
        ) : (
          <>
            {/* Empty state - shown when no courses or all courses are null */}
            {trackedCourses.length === 0 || trackedCourses.every(({ course }) => !course) ? (
              <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
                {/* Animated icon with gradient background */}
                <div className="relative mx-auto mb-8 w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full animate-pulse"></div>
                  {/* Book/courses icon SVG */}
                  <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100">
                    <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                {/* Empty state title and description */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  עדיין לא עוקבים אחר קורסים
                </h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  התחילו לעקוב אחר הקורסים שמעניינים אתכם כדי לקבל עדכונים ותזכורות בזמן אמת
                </p>

                {/* Primary call-to-action button */}
                <button
                  onClick={openPopup}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 mx-auto group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  הוסיפו את הקורס הראשון
                </button>

                {/* Additional helpful information */}
                <div className="mt-12 text-center">
                  <p className="text-sm text-gray-500 bg-gray-50 px-6 py-3 rounded-full inline-block border">
                    💡 עקבו אחר קורסים וקבלו התראות על עדכונים חדשים
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Grid layout for course cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {trackedCourses
                    .filter(({ course }) => course) // Filter out null/undefined courses
                    .map(({ course }) => (
                      <TrackedCourseCard
                        key={course._id}
                        course={course}
                        onRemove={handleRemoveCourse}
                        onViewDetails={handleViewCourseDetails}
                      />
                    ))
                  }
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal for adding new courses */}
      {isPopupOpen && (
        <AddCoursePopup onClose={closePopup} onCourseAdded={onCourseAdded} />
      )}

      {/* Modal for viewing course details */}
      {isModalOpen && selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TrackedCourses;