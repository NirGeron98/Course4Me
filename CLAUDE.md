# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a two-package monorepo-style layout with no root `package.json`. Each side installs and runs independently:

- `client/` — Create React App (React 19, react-router v7, Tailwind CSS 3). UI is in Hebrew/RTL.
- `server/` — Express 4 + Mongoose 8 REST API backed by MongoDB. CommonJS.

## Common commands

All commands must be run from either `client/` or `server/` — there is no root-level script runner.

### Server (`cd server`)
- `npm run dev` — start API with `nodemon` (auto-reload).
- `npm start` — start API with `node server.js`.
- `npm run create-admin` — seed an admin user via [server/scripts/createAdmin.js](server/scripts/createAdmin.js).
- Other one-off migration scripts live in [server/scripts/](server/scripts/) and are run with `node scripts/<file>.js`.
- No automated test suite (`npm test` is a stub).
- Required env vars (loaded via `dotenv` from `server/.env`): `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (comma-separated allow-list for CORS), `PORT` (default 5000), `EMAIL_USER`, `EMAIL_PASSWORD`, `NODE_ENV`.

### Client (`cd client`)
- `npm start` — CRA dev server on http://localhost:3000.
- `npm run build` — production build to `client/build/`.
- `npm test` — CRA Jest runner in watch mode. Run a single test with `npm test -- --testPathPattern=<name>` or press `p` in the watcher.
- Required env var: `REACT_APP_API_BASE_URL` (points to the server, e.g. `http://localhost:5000`). Read throughout the client as `process.env.REACT_APP_API_BASE_URL`.

## Architecture

### Backend (Express, layered by resource)

[server/server.js](server/server.js) is the entry point. It wires CORS (origin allow-list from `CLIENT_URL`), JSON body parsing (10mb limit), mounts routers under `/api/*`, registers a 404 handler and a global error handler, and connects to MongoDB before testing the email service.

Each resource follows the same 4-layer pattern — when adding a feature, mirror all four:
1. `models/<Name>.js` — Mongoose schema.
2. `controllers/<name>Controller.js` — request handlers, business logic.
3. `routes/<name>Routes.js` — Express router; applies middleware and maps endpoints to controllers.
4. Mounted in [server/server.js](server/server.js) under `/api/<resource>`.

Resources: `auth`, `user`, `courses`, `reviews` (course reviews), `lecturer-reviews`, `tracked-courses`, `lecturers`, `tracked-lecturers`, `departments`, `contact-requests`.

**Middleware** ([server/middleware/](server/middleware/)):
- `authMiddleware.protect` — verifies JWT `Bearer` token, loads `User` by `decoded.id`, attaches to `req.user`. Use on any route requiring auth.
- `adminMiddleware` — role gate; stack after `protect`.
- `cacheMiddleware.addCacheHeaders(ttl)` — sets `Cache-Control: public, max-age=...` on GET responses for browser/CDN caching.

**Two-tier caching** — important context for perf work:
- Browser/CDN HTTP caching via `cacheMiddleware` (short TTL, ~60s).
- In-process `listCache` ([server/utils/listCache.js](server/utils/listCache.js)) — a `Map`-backed TTL cache (2 min default) for heavy list endpoints (courses, lecturers). **Mutations must call `clearByPrefix` / `clearAll` to invalidate**, otherwise stale reads will leak. This cache is process-local, so a multi-instance deploy would need Redis.

**Email** ([server/services/emailService.js](server/services/emailService.js)) — nodemailer via `EMAIL_USER`/`EMAIL_PASSWORD`; connection is tested at boot but startup does not fail if email is misconfigured.

**Localization** — user-facing error messages (404, 500) in [server/server.js](server/server.js) are Hebrew. Keep that convention when adding new error responses.

### Frontend (CRA + React 19)

[client/src/App.js](client/src/App.js) owns auth state and routing. Key patterns:

- **Auth is stored in `localStorage`** (`token`, `userFullName`, `userRole`, `userId`, `requiresPasswordReset`) and rehydrated on mount. `handleLogin` / `handleLogout` are the single source of truth for mutating it. The `requiresPasswordReset` flag forces a redirect to `/reset-password` via the `ProtectedRoute` wrapper — preserve this gate when adding new protected routes.
- **Routes** are centralized in `App.js`. `/admin` additionally checks `user.user.role === "admin"`. `AdminPanel` and `AdvancedSearch` are `React.lazy`-loaded behind a `Suspense` fallback to shrink the initial bundle — follow this pattern for any new heavy page.
- **Data preloading** — on login, [client/src/utils/preloadUserData.js](client/src/utils/preloadUserData.js) is awaited and dispatches `userDataPreloading` / `userDataPreloaded` `CustomEvent`s on `window`. Pages that want to show a loading state during post-login hydration subscribe to those events rather than re-fetching.
- **Client-side caching** — [client/src/contexts/CourseDataContext.js](client/src/contexts/CourseDataContext.js) provides a `Map`-based course cache that is persisted to `localStorage` (`courseCache` key) and exposes `updateCourseData` / `getCourseData` / `triggerCourseRefresh`. `CourseDataProvider` wraps the entire app in `App.js`, so any course page can read/write through it. [client/src/utils/cacheUtils.js](client/src/utils/cacheUtils.js) handles cache cleanup/clearing; `clearAllUserCache()` is called on logout.
- **Components** are grouped by feature under [client/src/components/](client/src/components/) (`admin/`, `common/`, `course-page/`, `dashboard/`, `lecturer-page/`, `my-reviews/`, `profile/`, `search/`, `tracked-courses/`, `tracked-lecturers/`). New feature UI should go in an existing or new feature folder, with shared primitives in `common/`.
- **RTL / Hebrew** — all copy is Hebrew. [client/UI_REFINEMENTS.md](client/UI_REFINEMENTS.md) is the living design-system reference: Tailwind tokens (`rounded-card`, `rounded-card-lg`, `rounded-button`, `shadow-card`, `shadow-card-hover`, `shadow-elevated`, `duration-ui`, `ease-ui`), the shared primitives (`Card`, `Button`, `Input`, `Modal`/`ModalFooter`, `Alert`, `EmptyState`, `Skeleton`) under [client/src/components/common/](client/src/components/common/), and a11y rules (`focus-visible:ring-2 focus-visible:ring-brand`, `role="dialog"` with `aria-modal`). Match these conventions when adding UI rather than introducing new shadow/radius/ring/duration values.

### Refactoring conventions (Phases 2–6)

These patterns were introduced during the Phase 2–6 refactor and are now the default for any new client code:

- **Data fetching goes through `apiFetch` / `useApi`** ([client/src/hooks/useApi.js](client/src/hooks/useApi.js)). It owns the `Authorization` header (pulled from `localStorage.token`), `AbortController` wiring, timeouts, and Hebrew error normalization. Never import `axios` in a component or page — ESLint's `no-restricted-imports` rule will block it. A handful of legacy files still import axios directly; migrate them opportunistically to `apiFetch`.
- **Feature hooks wrap `apiFetch`** ([client/src/hooks/](client/src/hooks/)) — `useCourses`, `useCourse`, `useLecturers`, `useMyReviews`, `useTrackedCourses`, `useContactRequests`, `useAdminContactRequests`. Hooks own list state, `loading`/`mutating`/`error`, and local state patching after mutations so panels never refetch the whole list for one update. New resources should follow the same shape.
- **Admin panels are thin shells over admin primitives** — [client/src/components/common/admin/](client/src/components/common/admin/) exposes `FilterBar`, `ListTable`, and `RowActions`. Each admin panel lives in its own folder (`LecturerManagement/`, `ContactRequestManagement/`, etc.) with a shell component, row-config helper (`*Row.jsx`), sub-modals (`*FormModal.jsx`, `*DetailsModal.jsx`), and an `index.js` re-export so the parent import path stays flat. Keep every file under ~250 LOC; extract helpers when you cross that line.
- **Icons: Lucide React only.** FontAwesome was removed in Phase 4 and must not come back. Pass icon component references to primitives (`<Button leftIcon={Save}>`) rather than pre-rendered JSX.
- **Abort on logout** — `handleLogout` in [client/src/App.js](client/src/App.js) calls `abortPreload()` from [client/src/utils/preloadUserData.js](client/src/utils/preloadUserData.js) before clearing localStorage. If you add a new long-running background task tied to the session, expose an abort hook and call it here too.
- **ESLint guardrails** (Phase 6, configured inline in [client/package.json](client/package.json)):
  - `no-restricted-imports` (**error**) — blocks raw `axios`. Use `apiFetch` / `useApi` from [client/src/hooks/useApi.js](client/src/hooks/useApi.js).
  - `no-restricted-syntax` (**error**) — blocks deprecated Tailwind utilities (`rounded-lg`/`xl`/`2xl`, `shadow-lg`/`xl`/`2xl`, `duration-150`/`200`/`300`/`500`) in string literals and template literals; use Phase 4 tokens (`rounded-card`/`rounded-card-lg`/`rounded-button`, `shadow-card`/`shadow-card-hover`/`shadow-elevated`, `duration-ui`/`ease-ui`). The same rule also blocks hardcoded English JSX text runs of 4+ letters — user-facing copy must be Hebrew; wrap non-translatable tokens (brand names, emails, codes) in `{'...'}` to suppress.
  - `no-warning-comments` (**error**) — blocks Hebrew characters in code comments so grep, diffs, and CI logs stay machine-readable. Code comments must be in English; user-facing JSX copy remains Hebrew. Also blocks `todo` / `fixme` / `xxx` markers.
  - `no-console` (**warn**) — only `console.warn` / `console.error` may ship.
  - These rules surface in the CRA dev-server overlay and in `npm run build`. Fix them — do not paper over with `eslint-disable`.
- **CRA boilerplate removed** — `App.css`, `App.test.js`, `logo.svg`, and `reportWebVitals.js` are gone. [client/src/index.js](client/src/index.js) no longer wires `reportWebVitals`. The legacy [client/src/utils/preloadData.js](client/src/utils/preloadData.js) axios-based preloader was deleted; [client/src/utils/preloadUserData.js](client/src/utils/preloadUserData.js) (with `abortPreload`) is the only preload path.

### End-to-end flow for a new resource

To add a new resource end-to-end, expect to touch: `server/models/*.js`, `server/controllers/*.js`, `server/routes/*.js`, `server/server.js` (mount), then on the client a page in `src/pages/`, feature components in `src/components/<feature>/`, a route in `src/App.js`, and — if the resource is read often — entries in `preloadUserData.js` and/or a new context similar to `CourseDataContext` if caching is needed. Don't forget to invalidate `listCache` on mutations.
