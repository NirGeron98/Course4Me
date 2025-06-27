import React, { useEffect, useState } from "react";
import axios from "axios";
import CourseDetailsModal from "../components/tracked-courses/CourseDetailsModal";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import StatsCards from "../components/dashboard/StatsCards";
import TrackedCoursesList from "../components/dashboard/TrackedCoursesList";
import CourseCarousel from "../components/dashboard/CourseCarousel";
import LecturerCarousel from "../components/dashboard/LecturerCarousel";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
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
  const [courseCarouselIndex, setCourseCarouselIndex] = useState(0);
  const [lecturerCarouselIndex, setLecturerCarouselIndex] = useState(0);

  const getLecturerName = (lecturer) => {
    if (!lecturer) return "לא זמין";
    if (typeof lecturer === 'string') return lecturer;
    if (typeof lecturer === 'object') return lecturer.name || "לא זמין";
    return "לא זמין";
  };

  const formatLecturersDisplay = (lecturers) => {
    if (!Array.isArray(lecturers) || lecturers.length === 0) return "לא זמין";
    const lecturerNames = lecturers.map(getLecturerName);
    const displayedLecturers = lecturerNames.slice(0, 3);
    const remainingCount = lecturerNames.length - 3;
    let displayText = displayedLecturers.join(", ");
    if (remainingCount > 0) {
      displayText += ` +${remainingCount}`;
    }
    return displayText;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userFullName = localStorage.getItem("userFullName") || "User";
        setUserName(userFullName);

        const trackedRes = await axios.get("http://localhost:5000/api/tracked-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrackedCourses(trackedRes.data);

        const coursesRes = await axios.get("http://localhost:5000/api/courses");
        setAllCourses(coursesRes.data);

        const lecturersRes = await axios.get("http://localhost:5000/api/lecturers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturers(lecturersRes.data);

        let totalReviews = 0;
        
        try {
          const courseReviewsRes = await axios.get("http://localhost:5000/api/course-reviews", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userCourseReviews = courseReviewsRes.data.filter(review => review.user === localStorage.getItem("userId"));
          totalReviews += userCourseReviews.length;
        } catch (error) {
          console.log("No course reviews endpoint or error:", error);
        }

        try {
          const lecturerReviewsRes = await axios.get("http://localhost:5000/api/lecturer-reviews", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userLecturerReviews = lecturerReviewsRes.data.filter(review => review.user === localStorage.getItem("userId"));
          totalReviews += userLecturerReviews.length;
        } catch (error) {
          console.log("No lecturer reviews endpoint or error:", error);
        }

        setStats({
          coursesCount: trackedRes.data.length,
          reviewsCount: totalReviews
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  if (isLoading) {
    return <LoadingSpinner message="טוען נתונים" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50" dir="rtl">
      <WelcomeHeader userName={userName} />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <StatsCards 
          stats={stats}
          allCoursesCount={allCourses.length}
          lecturersCount={lecturers.length}
        />
        <TrackedCoursesList
          trackedCourses={trackedCourses}
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
    </div>
  );
};

export default Dashboard;
