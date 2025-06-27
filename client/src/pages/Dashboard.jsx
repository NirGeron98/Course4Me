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
  const [trackedCarouselIndex, setTrackedCarouselIndex] = useState(0);

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
    console.log("Reviews received:", reviews);
    console.log("UserId for filtering:", userId, typeof userId);

    const filtered = reviews.filter(review => {
      console.log("Review user:", review.user, typeof review.user);
      return (typeof review.user === "string" && review.user === userId) ||
        (typeof review.user === "object" && review.user._id === userId);
    });

    console.log("Filtered reviews:", filtered);
    return filtered;
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        console.log("userId from localStorage:", userId);
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
          const courseReviewsRes = await axios.get("http://localhost:5000/api/reviews", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userCourseReviews = filterReviewsByUser(courseReviewsRes.data, userId);

          totalReviews += userCourseReviews.length;
        } catch (error) {
          console.log("No course reviews endpoint or error:", error);
        }


        try {
          const lecturerReviewsRes = await axios.get("http://localhost:5000/api/lecturer-reviews", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userLecturerReviews = filterReviewsByUser(lecturerReviewsRes.data, userId);

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
    </div>
  );
};

export default Dashboard;
