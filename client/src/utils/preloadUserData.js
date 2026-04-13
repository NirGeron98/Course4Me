import { apiFetch } from '../hooks/useApi';
import { dashboardCache } from './cacheUtils';

const REQUEST_TIMEOUT_MS = 5000;
const MAX_RETRIES = 1;

// Module-level controller so logout (or a subsequent login) can cancel an
// in-flight preload. Exported via `abortPreload` below.
let currentController = null;

export const abortPreload = () => {
  if (currentController) {
    try {
      currentController.abort();
    } catch (error) {
      console.error('Failed to abort in-flight preload:', error);
    }
    currentController = null;
  }
};

const emitProgress = (completed, total, message) => {
  try {
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    window.dispatchEvent(
      new CustomEvent('userDataPreloadProgress', {
        detail: { completed, total, progress, message },
      })
    );
    // Legacy event retained so existing listeners keep working.
    window.dispatchEvent(
      new CustomEvent('userDataLoadingProgress', {
        detail: { message, progress },
      })
    );
  } catch (error) {
    console.error('Failed to dispatch preload progress event:', error);
  }
};

// Fetch helper with a 5s timeout and one retry on failure. Honors an
// external AbortSignal so callers can cancel mid-flight without triggering
// a retry. Returns `null` when the request ultimately fails.
const safeFetch = async (path, { token, signal, attempt = 0 } = {}) => {
  if (signal && signal.aborted) {
    throw new DOMException('Preload aborted', 'AbortError');
  }

  try {
    const data = await apiFetch(path, {
      token,
      auth: Boolean(token),
      signal,
      timeout: REQUEST_TIMEOUT_MS,
    });
    return data;
  } catch (error) {
    // Do not retry if the caller explicitly aborted — surface the abort.
    if (signal && signal.aborted) {
      throw error;
    }
    if (attempt < MAX_RETRIES) {
      return safeFetch(path, { token, signal, attempt: attempt + 1 });
    }
    console.error(
      `safeFetch gave up on ${path}:`,
      (error && error.message) || error
    );
    return null;
  }
};

const buildEndpoints = () => [
  { key: 'trackedCourses', url: `/api/tracked-courses`, auth: true },
  { key: 'trackedLecturers', url: `/api/tracked-lecturers`, auth: true },
  { key: 'allCourses', url: `/api/courses`, auth: false },
  { key: 'allLecturers', url: `/api/lecturers`, auth: false },
  { key: 'courseReviews', url: `/api/reviews`, auth: true },
  { key: 'lecturerReviews', url: `/api/lecturer-reviews`, auth: true },
  { key: 'contactRequests', url: `/api/contact-requests/my-requests`, auth: true },
];

const filterReviewsByUser = (reviews, userId) => {
  if (!Array.isArray(reviews)) return [];
  return reviews.filter(
    (review) =>
      (typeof review.user === 'string' && review.user === userId) ||
      (typeof review.user === 'object' &&
        review.user &&
        review.user._id === userId)
  );
};

export const preloadUserData = async (token, userId) => {
  const userData = {
    trackedCourses: [],
    trackedLecturers: [],
    reviews: { courseReviews: [], lecturerReviews: [] },
    stats: { coursesCount: 0, reviewsCount: 0 },
    allCourses: [],
    allLecturers: [],
    contactRequests: [],
  };

  if (!token || !userId) return userData;

  // Cancel any previous in-flight preload before starting a new one so two
  // concurrent logins cannot race each other.
  abortPreload();
  currentController = new AbortController();
  const { signal } = currentController;
  const localController = currentController;

  const endpoints = buildEndpoints();
  const total = endpoints.length;
  let completed = 0;

  emitProgress(0, total, 'starting preload');

  // Fire all requests in parallel. Each one updates progress as soon as it
  // settles so the UI reflects real completion, not fixed checkpoints.
  const results = await Promise.allSettled(
    endpoints.map((endpoint) =>
      safeFetch(endpoint.url, {
        token: endpoint.auth ? token : undefined,
        signal,
      }).then(
        (data) => {
          completed += 1;
          emitProgress(completed, total, `loaded ${endpoint.key}`);
          return { key: endpoint.key, data };
        },
        (error) => {
          completed += 1;
          emitProgress(completed, total, `failed ${endpoint.key}`);
          throw error;
        }
      )
    )
  );

  // If the preload was aborted (e.g. logout) bail out without touching caches
  // — we do not want to persist data that belongs to a session the user just
  // ended.
  if (signal.aborted) {
    if (currentController === localController) currentController = null;
    return userData;
  }

  const resultMap = {};
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value && result.value.data) {
      resultMap[result.value.key] = result.value.data;
    }
  }

  userData.trackedCourses = resultMap.trackedCourses || [];
  userData.trackedLecturers = resultMap.trackedLecturers || [];
  userData.allCourses = resultMap.allCourses || [];
  userData.allLecturers = resultMap.allLecturers || [];
  userData.contactRequests = resultMap.contactRequests || [];

  const userCourseReviews = filterReviewsByUser(
    resultMap.courseReviews || [],
    userId
  );
  const userLecturerReviews = filterReviewsByUser(
    resultMap.lecturerReviews || [],
    userId
  );
  userData.reviews.courseReviews = userCourseReviews;
  userData.reviews.lecturerReviews = userLecturerReviews;

  userData.stats = {
    coursesCount: userData.trackedCourses.length,
    reviewsCount: userCourseReviews.length + userLecturerReviews.length,
  };

  try {
    saveToCache(userData);
  } catch (error) {
    console.error('Failed to persist preloaded data to cache:', error);
  }

  emitProgress(total, total, 'preload complete');
  if (currentController === localController) currentController = null;

  return userData;
};

const saveToCache = (userData) => {
  dashboardCache.saveToCache('tracked_courses', userData.trackedCourses);
  dashboardCache.saveToCache('all_courses', userData.allCourses);
  dashboardCache.saveToCache('lecturers', userData.allLecturers);
  dashboardCache.saveToCache('stats', userData.stats);

  const timestamp = Date.now();

  localStorage.setItem(
    'my_reviews_data',
    JSON.stringify({
      courseReviews: userData.reviews.courseReviews,
      lecturerReviews: userData.reviews.lecturerReviews,
      timestamp,
    })
  );

  localStorage.setItem(
    'tracked_courses_data',
    JSON.stringify({
      trackedCourses: userData.trackedCourses,
      timestamp,
    })
  );

  localStorage.setItem(
    'tracked_lecturers_data',
    JSON.stringify({
      trackedLecturers: userData.trackedLecturers,
      timestamp,
    })
  );

  localStorage.setItem(
    'contact_requests_data',
    JSON.stringify({
      contactRequests: userData.contactRequests,
      timestamp,
    })
  );

  sendDataLoadedEvents(userData);
};

const sendDataLoadedEvents = (userData) => {
  try {
    window.dispatchEvent(
      new CustomEvent('trackedCoursesPreloaded', {
        detail: {
          count: userData.trackedCourses.length,
          timestamp: Date.now(),
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('trackedLecturersPreloaded', {
        detail: {
          count: userData.trackedLecturers.length,
          timestamp: Date.now(),
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('reviewsPreloaded', {
        detail: {
          count:
            userData.reviews.courseReviews.length +
            userData.reviews.lecturerReviews.length,
          timestamp: Date.now(),
        },
      })
    );
    window.dispatchEvent(
      new CustomEvent('contactRequestsPreloaded', {
        detail: {
          count: userData.contactRequests.length,
          timestamp: Date.now(),
        },
      })
    );
  } catch (error) {
    console.error('Failed to dispatch data-loaded events:', error);
  }
};

export default preloadUserData;
