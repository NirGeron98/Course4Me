# Performance Optimizations – Course4Me

This document describes the performance-focused refactoring applied to the project: what was slow, what was changed, and optional next steps.

---

## 1. What Was Slow

### Backend

- **N+1 queries in course list APIs**  
  `getAllCourses`, `searchCourses`, and `getCoursesByLecturer` loaded all courses and then, for **each** course, ran a separate `CourseReview.find({ course })` to compute ratings. With hundreds of courses this meant hundreds of extra DB round-trips and high latency.

- **Lecturer-by-slug loading all lecturers**  
  `getLecturerBySlug` first tried `findOne({ slug })` (no slug on model), then fell back to `Lecturer.find()` and iterated in memory to match slug. That loaded every lecturer document on every slug request.

- **No indexes for common queries**  
  List and filter operations (e.g. by `createdAt`, `course`, `lecturer`, `department`, `name`) had no supporting indexes, causing full collection scans as data grew.

- **Unbounded list endpoints**  
  `getAllCourses`, `getAllLecturers`, and review list endpoints returned full result sets with no limit or pagination, increasing response size and memory use.

- **No caching**  
  Heavy, mostly read-only list endpoints (courses, lecturers, departments) hit the database on every request.

### Frontend

- **Context re-renders**  
  `CourseDataContext` passed a new object to `value` every render, so all consumers re-rendered even when the context logic hadn’t changed.

- **Large initial bundle**  
  Admin and Advanced Search were in the main bundle, delaying first contentful paint and time-to-interactive.

- **Duplicate cache cleanup**  
  Cache cleanup ran both in `App.js` and in `Dashboard`, adding redundant work and timers.

---

## 2. Optimizations and Impact

### 2.1 Backend: Eliminate N+1 (Course Ratings)

**Change:**  
A single `CourseReview.aggregate()` groups by `course` and computes `$avg(recommendation)` and `$sum(1)`. The result is merged with the course list in memory.

**Files:** `server/controllers/courseController.js`  
**Helper:** `getCourseRatingsMap(courseIds)`  
**Used in:** `getAllCourses`, `searchCourses`, `getCoursesByLecturer`

**Impact:**  
- Before: 1 query for courses + N queries for reviews.  
- After: 1 query for courses + 1 aggregation.  
- Large reduction in DB round-trips and faster list/search and by-lecturer responses.

---

### 2.2 Backend: Lecturer-by-Slug Without Loading All

**Change:**  
- Try `findOne({ slug })` (for when a `slug` field is added later).  
- Else use a single `findOne` with a `name` regex derived from the slug (hyphens → `[\s-]+`), so one query replaces “load all + loop”.

**Files:** `server/controllers/lecturerController.js` – `findLecturerBySlug`

**Impact:**  
- Before: One query returning all lecturers, then JS loop.  
- After: One or two indexed/regex queries.  
- Lecturer page by slug stays fast as the lecturer set grows.

---

### 2.3 Backend: Database Indexes

**Change:**  
Indexes added for common filters and sorts.

**Course** (`server/models/Course.js`):  
- `createdAt: -1` (list sort)  
- `lecturers: 1` (by-lecturer)  
- `department: 1` (filter)

**CourseReview** (`server/models/CourseReview.js`):  
- `course: 1` (aggregation and “reviews by course”)

**Lecturer** (`server/models/Lecturer.js`):  
- `name: 1` (slug-by-name, search)  
- `createdAt: -1` (list sort)

**LecturerReview** (`server/models/LecturerReview.js`):  
- `lecturer: 1, createdAt: -1` (reviews by lecturer, sorted)

**Impact:**  
- List, search, and by-lecturer/course queries use indexes instead of full scans.  
- Better scalability as collections grow.

---

### 2.4 Backend: Pagination and Optional Limit

**Change:**  
- **Course reviews (getAllReviews):** Optional `?page` and `?limit`. If either is set, response is `{ data, pagination }`. If omitted, response remains the full array (backward compatible).  
- **Lecturer reviews (getAllLecturerReviews):** Same pattern.  
- **Courses (getAllCourses):** Optional `?limit` (max 2000).  
- **Lecturers (getAllLecturers):** Optional `?limit` (max 2000).

**Files:**  
- `server/controllers/courseReviewController.js`  
- `server/controllers/lecturerReviewController.js`  
- `server/controllers/courseController.js`  
- `server/controllers/lecturerController.js`

**Impact:**  
- Clients can request smaller pages or caps, reducing payload size and memory.  
- Existing clients that don’t send `page`/`limit` still get the same array response.

---

### 2.5 Backend: Caching

#### In-memory list cache

- **What is cached:** Full JSON response of `GET /api/courses` and `GET /api/lecturers` (per `limit`).  
- **Where:** Process memory (`server/utils/listCache.js`, a `Map`).  
- **TTL:** 2 minutes.  
- **Invalidation:** On any create/update/delete for courses or lecturers, the corresponding cache prefix is cleared (`courses:*` or `lecturers:*`).

**Impact:**  
- Repeated list requests within 2 minutes are served from memory.  
- For multiple server instances, consider Redis with the same key/prefix and TTL and invalidate on write (see “Further improvements” below).

#### HTTP cache headers

- **Where:** Response headers only (no separate cache store).  
- **Endpoints:**  
  - `GET /api/courses` – `Cache-Control: public, max-age=60`  
  - `GET /api/lecturers` – `Cache-Control: public, max-age=60`  
  - `GET /api/departments` – `Cache-Control: public, max-age=300`  
- **TTL:** 60 s for courses/lecturers, 300 s for departments.

**Impact:**  
- Browsers and CDNs can cache responses and reduce repeat requests to the origin.

---

### 2.6 Frontend: Context and Bundle

**CourseDataContext**  
- Context value is wrapped in `useMemo` so the value reference only changes when the provided callbacks/data actually change.  
- **Impact:** Fewer unnecessary re-renders of components that only consume context.

**Lazy-loaded routes**  
- `AdminPanel` and `AdvancedSearch` are loaded with `React.lazy()` and rendered inside `<Suspense>`.  
- **Impact:** Smaller initial JS bundle and faster TTI; admin and search code load when needed.

**Cache cleanup**  
- `initializeCacheCleanup()` is only called in `App.js`; duplicate call in `Dashboard` was removed.  
- **Impact:** Single cleanup interval and less redundant work.

---

## 3. Cache Summary

| Cache            | What is cached              | Where        | TTL   | Invalidation                          |
|-----------------|-----------------------------|-------------|-------|--------------------------------------|
| List (courses)  | GET /api/courses response   | In-memory   | 2 min | On course create/update/delete       |
| List (lecturers)| GET /api/lecturers response | In-memory   | 2 min | On lecturer create/update/delete     |
| HTTP (courses)  | Same response               | Browser/CDN | 60 s  | By client when max-age expires       |
| HTTP (lecturers)| Same response               | Browser/CDN | 60 s  | By client when max-age expires       |
| HTTP (departments) | GET /api/departments      | Browser/CDN | 300 s | By client when max-age expires       |

---

## 4. Optional Further Improvements

- **Redis for list cache:** Use Redis with the same key pattern and TTL so all server instances share cache; invalidate on create/update/delete (e.g. pub/sub or delete key).  
- **Stats endpoint:** Add something like `GET /api/users/me/stats` that returns only counts (e.g. tracked courses, reviews, contact requests) so the dashboard doesn’t need to fetch full review lists just for counts.  
- **Server-side search:** Move Advanced Search filtering to the backend (query params) and return only matching courses/lecturers with pagination instead of loading full lists and filtering on the client.  
- **Review list pagination in UI:** When calling `GET /api/reviews` or `GET /api/lecturer-reviews` with `?page=&limit=`, update admin (or other) UI to use `response.data` and `response.pagination` and add next/prev controls.  
- **Lecturer slug field:** Add a `slug` field to the Lecturer model and populate it (e.g. from `name`). Then `findOne({ slug })` becomes a single indexed lookup and the regex fallback is only for legacy data.

---

## 5. What Was Not Changed

- **Business logic:** Rating calculation, permissions, and validation are unchanged.  
- **UI/UX:** No visual or flow redesign; only performance-related code and loading behavior.  
- **API contracts:** Existing clients that don’t use `page`/`limit` still receive the same response shapes (array for reviews when no pagination).
