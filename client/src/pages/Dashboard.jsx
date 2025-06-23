import React, { useEffect, useState } from "react";
import axios from "axios";
import { BookOpen, Users, MessageSquare, TrendingUp, ChevronLeft, ChevronRight, User, Building } from "lucide-react";
import CourseDetailsModal from "../components/tracked-courses/CourseDetailsModal";

const Dashboard = () => {
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

  // Carousel states
  const [courseCarouselIndex, setCourseCarouselIndex] = useState(0);
  const [lecturerCarouselIndex, setLecturerCarouselIndex] = useState(0);

  // Helper function to get lecturer name
  const getLecturerName = (lecturer) => {
    if (!lecturer) return "לא זמין";
    if (typeof lecturer === 'string') return lecturer;
    if (typeof lecturer === 'object') return lecturer.name || "לא זמין";
    return "לא זמין";
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userFullName = localStorage.getItem("userFullName") || "User";
        setUserName(userFullName);

        // Fetch tracked courses
        const trackedRes = await axios.get("http://localhost:5000/api/tracked-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrackedCourses(trackedRes.data);

        // Fetch all courses for carousel
        const coursesRes = await axios.get("http://localhost:5000/api/courses");
        setAllCourses(coursesRes.data);

        // Fetch lecturers for carousel
        const lecturersRes = await axios.get("http://localhost:5000/api/lecturers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturers(lecturersRes.data);

        // Fetch user's reviews count
        let totalReviews = 0;
        
        try {
          // Get course reviews by user
          const courseReviewsRes = await axios.get("http://localhost:5000/api/course-reviews", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Filter reviews by current user (assuming the API returns all reviews)
          const userCourseReviews = courseReviewsRes.data.filter(review => review.user === localStorage.getItem("userId"));
          totalReviews += userCourseReviews.length;
        } catch (error) {
          console.log("No course reviews endpoint or error:", error);
        }

        try {
          // Get lecturer reviews by user
          const lecturerReviewsRes = await axios.get("http://localhost:5000/api/lecturer-reviews", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Filter reviews by current user
          const userLecturerReviews = lecturerReviewsRes.data.filter(review => review.user === localStorage.getItem("userId"));
          totalReviews += userLecturerReviews.length;
        } catch (error) {
          console.log("No lecturer reviews endpoint or error:", error);
        }

        // Set stats
        setStats({
          coursesCount: trackedRes.data.length,
          reviewsCount: totalReviews
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Auto-carousel for courses
  useEffect(() => {
    if (allCourses.length > 3) {
      const interval = setInterval(() => {
        setCourseCarouselIndex(prev =>
          prev >= allCourses.length - 3 ? 0 : prev + 1
        );
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [allCourses.length]);

  // Auto-carousel for lecturers
  useEffect(() => {
    if (lecturers.length > 3) {
      const interval = setInterval(() => {
        setLecturerCarouselIndex(prev =>
          prev >= lecturers.length - 3 ? 0 : prev + 1
        );
      }, 5000); // Change every 5 seconds

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50" dir="rtl">

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">שלום, {userName}! 👋</h1>
                <p className="text-emerald-100 text-lg">איזה כיף שחזרת!</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{new Date().toLocaleDateString('he-IL')}</div>
                  <div className="text-emerald-200 text-sm">היום</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Personal Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 rounded-full p-3">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.coursesCount}</h3>
                <p className="text-gray-600">קורסים במעקב</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 rounded-full p-3">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.reviewsCount}</h3>
                <p className="text-gray-600">ביקורות שכתבתי</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{allCourses.length}</h3>
                <p className="text-gray-600">קורסים במערכת</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{lecturers.length}</h3>
                <p className="text-gray-600">מרצים במערכת</p>
              </div>
            </div>
          </div>
        </section>

        {/* My Tracked Courses - Compact List */}
        {trackedCourses.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              הקורסים שלי
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackedCourses.slice(0, 6).map((tracked, index) => {
                const course = tracked?.course;
                if (!course) return null;

                return (
                  <div
                    key={course._id || index}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-800 mb-1 truncate">{course.title}</h3>
                    {Array.isArray(course.lecturers) && course.lecturers.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2">
                        מרצים: {course.lecturers.map(getLecturerName).join(", ")}
                      </p>
                    )}

                    {course.credits && (
                      <span className="inline-block bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full">
                        {course.credits} נק״ז
                      </span>
                    )}
                  </div>
                );
              })}

            </div>
            {trackedCourses.length > 6 && (
              <div className="mt-4 text-center">
                <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                  הצג עוד +{trackedCourses.length - 6}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Courses Carousel */}
        {allCourses.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                קורסים במערכת
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCourseCarouselPrev}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={allCourses.length <= 3}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleCourseCarouselNext}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={allCourses.length <= 3}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleCourseClick(course)}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">{course.title}</h3>
                  {Array.isArray(course.lecturers) && course.lecturers.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      מרצים: {course.lecturers.map(getLecturerName).join(", ")}
                    </p>
                  )}

                  {course.credits && (
                    <span className="inline-block bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {course.credits} נק״ז
                    </span>
                  )}
                </div>
              ))}
            </div>

            {allCourses.length > 3 && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 max-w-full overflow-hidden px-4">
                  {(() => {
                    const totalPages = Math.ceil(allCourses.length / 3);
                    const currentPage = Math.floor(courseCarouselIndex / 3);
                    
                    // If less than 8 pages, show all dots
                    if (totalPages <= 8) {
                      return Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCourseCarouselIndex(index * 3)}
                          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                            currentPage === index ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ));
                    }
                    
                    // If more than 8 pages, show pagination with ellipsis
                    const dots = [];
                    const maxVisibleDots = 5;
                    let startPage = Math.max(0, currentPage - Math.floor(maxVisibleDots / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxVisibleDots - 1);
                    
                    // Adjust start if we're near the end
                    if (endPage - startPage < maxVisibleDots - 1) {
                      startPage = Math.max(0, endPage - maxVisibleDots + 1);
                    }
                    
                    // First page dot if not showing it
                    if (startPage > 0) {
                      dots.push(
                        <button
                          key={0}
                          onClick={() => setCourseCarouselIndex(0)}
                          className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"
                        />
                      );
                      // Add ellipsis if there's a gap
                      if (startPage > 1) {
                        dots.push(
                          <span key="start-ellipsis" className="text-gray-400 text-xs px-1 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Current range dots
                    for (let i = startPage; i <= endPage; i++) {
                      dots.push(
                        <button
                          key={i}
                          onClick={() => setCourseCarouselIndex(i * 3)}
                          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                            currentPage === i ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      );
                    }
                    
                    // Last page dot if not showing it
                    if (endPage < totalPages - 1) {
                      // Add ellipsis if there's a gap
                      if (endPage < totalPages - 2) {
                        dots.push(
                          <span key="end-ellipsis" className="text-gray-400 text-xs px-1 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                      dots.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => setCourseCarouselIndex((totalPages - 1) * 3)}
                          className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"
                        />
                      );
                    }
                    
                    return dots;
                  })()}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Lecturers Carousel */}
        {lecturers.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                מרצים במערכת
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleLecturerCarouselPrev}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={lecturers.length <= 3}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleLecturerCarouselNext}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  disabled={lecturers.length <= 3}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleLecturers.map((lecturer) => (
                <div
                  key={lecturer._id}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-200 rounded-full p-2">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                      {lecturer.name}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-purple-500" />
                      <span>{lecturer.department}</span>
                    </div>
                    <p className="truncate">{lecturer.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {lecturers.length > 3 && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2 max-w-full overflow-hidden px-4">
                  {(() => {
                    const totalPages = Math.ceil(lecturers.length / 3);
                    const currentPage = Math.floor(lecturerCarouselIndex / 3);
                    
                    // If less than 8 pages, show all dots
                    if (totalPages <= 8) {
                      return Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setLecturerCarouselIndex(index * 3)}
                          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                            currentPage === index ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        />
                      ));
                    }
                    
                    // If more than 8 pages, show pagination with ellipsis
                    const dots = [];
                    const maxVisibleDots = 5;
                    let startPage = Math.max(0, currentPage - Math.floor(maxVisibleDots / 2));
                    let endPage = Math.min(totalPages - 1, startPage + maxVisibleDots - 1);
                    
                    // Adjust start if we're near the end
                    if (endPage - startPage < maxVisibleDots - 1) {
                      startPage = Math.max(0, endPage - maxVisibleDots + 1);
                    }
                    
                    // First page dot if not showing it
                    if (startPage > 0) {
                      dots.push(
                        <button
                          key={0}
                          onClick={() => setLecturerCarouselIndex(0)}
                          className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"
                        />
                      );
                      // Add ellipsis if there's a gap
                      if (startPage > 1) {
                        dots.push(
                          <span key="start-ellipsis" className="text-gray-400 text-xs px-1 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Current range dots
                    for (let i = startPage; i <= endPage; i++) {
                      dots.push(
                        <button
                          key={i}
                          onClick={() => setLecturerCarouselIndex(i * 3)}
                          className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${
                            currentPage === i ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        />
                      );
                    }
                    
                    // Last page dot if not showing it
                    if (endPage < totalPages - 1) {
                      // Add ellipsis if there's a gap
                      if (endPage < totalPages - 2) {
                        dots.push(
                          <span key="end-ellipsis" className="text-gray-400 text-xs px-1 flex-shrink-0">
                            ...
                          </span>
                        );
                      }
                      dots.push(
                        <button
                          key={totalPages - 1}
                          onClick={() => setLecturerCarouselIndex((totalPages - 1) * 3)}
                          className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"
                        />
                      );
                    }
                    
                    return dots;
                  })()}
                </div>
              </div>
            )}
          </section>
        )}

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

    </div>
  );
};

export default Dashboard;