import axios from 'axios';
import { dashboardCache} from './cacheUtils';

export const preloadUserData = async (token, userId) => {
  if (!token || !userId) return false;
  
  try {
    
    const requests = [
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ];

    const [
      trackedCoursesRes,
      allCoursesRes,
      lecturersRes,
      courseReviewsRes,
      lecturerReviewsRes,
      trackedLecturersRes
    ] = await Promise.all(requests);

    dashboardCache.saveToCache('tracked_courses', trackedCoursesRes.data);
    dashboardCache.saveToCache('all_courses', allCoursesRes.data);
    dashboardCache.saveToCache('lecturers', lecturersRes.data);

    const userCourseReviews = courseReviewsRes.data.filter(review =>
      (typeof review.user === "string" && review.user === userId) ||
      (typeof review.user === "object" && review.user._id === userId)
    );
    
    const userLecturerReviews = lecturerReviewsRes.data.filter(review =>
      (typeof review.user === "string" && review.user === userId) ||
      (typeof review.user === "object" && review.user._id === userId)
    );
    
    const stats = {
      coursesCount: trackedCoursesRes.data.length,
      reviewsCount: userCourseReviews.length + userLecturerReviews.length
    };
    
    dashboardCache.saveToCache('stats', stats);

    const myReviewsCacheKey = `my_reviews_${userId}`;
    const allMyReviews = [
      ...userCourseReviews.map(review => ({ ...review, reviewType: 'course' })),
      ...userLecturerReviews.map(review => ({ ...review, reviewType: 'lecturer' }))
    ];
    
    const myReviewsCache = {
      reviews: allMyReviews,
      timestamp: Date.now()
    };
    
    localStorage.setItem(myReviewsCacheKey, JSON.stringify(myReviewsCache));

    const validTrackedLecturers = trackedLecturersRes.data.filter(({ lecturer }) => lecturer && lecturer._id);
    const trackedLecturersCache = {
      trackedLecturers: validTrackedLecturers,
      timestamp: Date.now()
    };
    
    localStorage.setItem('tracked_lecturers_data', JSON.stringify(trackedLecturersCache));

    return true;
  } catch (error) {
    console.error("שגיאה בטעינה מקדימה:", error);
    return false;
  }
};
