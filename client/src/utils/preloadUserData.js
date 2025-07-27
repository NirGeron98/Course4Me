import axios from 'axios';
import { dashboardCache } from './cacheUtils';

const updateLoadingProgress = (message, progress) => {
  try {
    const progressEvent = new CustomEvent('userDataLoadingProgress', {
      detail: { message, progress }
    });
    window.dispatchEvent(progressEvent);
  } catch (error) {
    console.error('שגיאה בעדכון התקדמות הטעינה:', error);
  }
};

export const preloadUserData = async (token, userId) => {
  const userData = {
    trackedCourses: [],
    trackedLecturers: [],
    reviews: {
      courseReviews: [],
      lecturerReviews: []
    },
    stats: {
      coursesCount: 0,
      reviewsCount: 0
    },
    allCourses: [],
    allLecturers: [],
    contactRequests: []
  };

  try {
    updateLoadingProgress('טוען קורסים ומרצים במעקב', 10);
    
    const [trackedCoursesRes, trackedLecturersRes] = await Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => ({ data: [] })),
      
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-lecturers`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => ({ data: [] })),
    ]);
    
    userData.trackedCourses = trackedCoursesRes.data || [];
    userData.trackedLecturers = trackedLecturersRes.data || [];
    
    updateLoadingProgress('טוען את כל הקורסים והמרצים במערכת', 30);
    
    const [coursesRes, lecturersRes] = await Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`)
        .catch(err => ({ data: [] })),
      
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`)
        .catch(err => ({ data: [] })),
    ]);
    
    userData.allCourses = coursesRes.data || [];
    userData.allLecturers = lecturersRes.data || [];
    
    updateLoadingProgress('טוען ביקורות ופניות', 60);
    
    const [courseReviewsRes, lecturerReviewsRes, contactRequestsRes] = await Promise.all([
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => ({ data: [] })),
      
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturer-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => ({ data: [] })),
      
      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/contact-requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => ({ data: [] })),
    ]);

    userData.trackedCourses = trackedCoursesRes.data || [];
    userData.trackedLecturers = trackedLecturersRes.data || [];
    userData.allCourses = coursesRes.data || [];
    userData.allLecturers = lecturersRes.data || [];
    userData.contactRequests = contactRequestsRes.data || [];
    
    const userCourseReviews = filterReviewsByUser(courseReviewsRes.data || [], userId);
    const userLecturerReviews = filterReviewsByUser(lecturerReviewsRes.data || [], userId);
    
    userData.reviews.courseReviews = userCourseReviews;
    userData.reviews.lecturerReviews = userLecturerReviews;
    
    updateLoadingProgress('מחשב סטטיסטיקות', 80);
    
    userData.stats = {
      coursesCount: userData.trackedCourses.length,
      reviewsCount: userCourseReviews.length + userLecturerReviews.length
    };

    updateLoadingProgress('שומר נתונים במטמון', 90);
    
    saveToCache(userData);
    
    updateLoadingProgress('הטעינה הושלמה', 100);

    return userData;
  } catch (error) {
    console.error('שגיאה בטעינה מקדימה של נתוני המשתמש:', error);
    return userData;
  }
};

const filterReviewsByUser = (reviews, userId) => {
  if (!Array.isArray(reviews)) return [];
  
  return reviews.filter(review => {
    return (typeof review.user === "string" && review.user === userId) ||
      (typeof review.user === "object" && review.user._id === userId);
  });
};

const saveToCache = (userData) => {
  try {
    dashboardCache.saveToCache('tracked_courses', userData.trackedCourses);
    dashboardCache.saveToCache('all_courses', userData.allCourses);
    dashboardCache.saveToCache('lecturers', userData.allLecturers);
    dashboardCache.saveToCache('stats', userData.stats);
    
    const reviewsCache = {
      courseReviews: userData.reviews.courseReviews,
      lecturerReviews: userData.reviews.lecturerReviews,
      timestamp: Date.now()
    };
    localStorage.setItem('my_reviews_data', JSON.stringify(reviewsCache));
    
    const trackedCoursesCache = {
      trackedCourses: userData.trackedCourses,
      timestamp: Date.now()
    };
    localStorage.setItem('tracked_courses_data', JSON.stringify(trackedCoursesCache));
    
    const trackedLecturersCache = {
      trackedLecturers: userData.trackedLecturers,
      timestamp: Date.now()
    };
    localStorage.setItem('tracked_lecturers_data', JSON.stringify(trackedLecturersCache));
    
    const contactRequestsCache = {
      contactRequests: userData.contactRequests,
      timestamp: Date.now()
    };
    localStorage.setItem('contact_requests_data', JSON.stringify(contactRequestsCache));
    
    sendDataLoadedEvents(userData);
  } catch (error) {
    console.error('שגיאה בשמירת הנתונים במטמון:', error);
  }
}

const sendDataLoadedEvents = (userData) => {
  try {
    const coursesEvent = new CustomEvent('trackedCoursesPreloaded', {
      detail: { count: userData.trackedCourses.length, timestamp: Date.now() }
    });
    window.dispatchEvent(coursesEvent);
    
    const lecturersEvent = new CustomEvent('trackedLecturersPreloaded', {
      detail: { count: userData.trackedLecturers.length, timestamp: Date.now() }
    });
    window.dispatchEvent(lecturersEvent);
    
    const reviewsEvent = new CustomEvent('reviewsPreloaded', {
      detail: { 
        count: userData.reviews.courseReviews.length + userData.reviews.lecturerReviews.length, 
        timestamp: Date.now() 
      }
    });
    window.dispatchEvent(reviewsEvent);
    
    const contactRequestsEvent = new CustomEvent('contactRequestsPreloaded', {
      detail: { 
        count: userData.contactRequests.length, 
        timestamp: Date.now() 
      }
    });
    window.dispatchEvent(contactRequestsEvent);
  } catch (error) {
    console.error('שגיאה בשליחת אירועי טעינת נתונים:', error);
  }
}

export default preloadUserData;
