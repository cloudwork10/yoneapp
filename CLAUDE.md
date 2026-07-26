# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

YONE / ELNADY is a React Native (Expo) learning platform with a separate Node.js/Express + MongoDB backend. The app serves courses, video podcasts, roadmaps, articles, career advice, reels, jobs, tech news, and a subscription/club system, mostly targeted at Egyptian/Arab developers.

The repo has two independently run halves:
- **Frontend**: root directory (`app/`, `components/`, `contexts/`, `utils/`, `config/`), Expo Router app.
- **Backend**: `backend/`, a standalone Express API deployed to Railway with MongoDB Atlas.

## Common commands

Frontend (run from repo root):
```bash
npm start          # expo start
npm run ios        # expo start --ios
npm run android    # expo start --android
npm run web        # expo start --web
npm run lint       # expo lint
```

Backend (run from `backend/`):
```bash
npm run dev        # nodemon server.js
npm start          # node server.js
```

There is no automated test suite for either half (`npm test` is a stub). Verify changes by running the app in a simulator/Expo Go and hitting the relevant screen, and by exercising API routes manually (e.g. curl/Postman) against the local backend.

Backend env vars come from `backend/config.env` or `backend/.env` (see `backend/config.env.example`); the frontend reads `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_USE_LOCAL_API` from a root `.env` (see `.env.example`).

## Frontend architecture

- **Routing**: Expo Router, file-based under `app/`. `app/(tabs)/` holds the 8 bottom-tab screens (index/home, courses, podcasts, roadmaps, articles, advices, programming-terms, top-cv, more, reels, scholarship). Everything else (`login`, `register`, `profile`, `dashboard`, `subscription*`, `payment`, admin/management screens, etc.) is a stack screen at the `app/` root. `app/_layout.tsx` is the root layout — it wires up `UserProvider`, theming, splash screen, push notifications (`NotificationService`), and a `PresenceHeartbeat` component that pings the backend every 45s while a user is logged in and the app is foregrounded.
- **API base URL resolution**: `config/api.js` always points at the production Railway URL unless `EXPO_PUBLIC_API_URL` is set explicitly, or `__DEV__` + `EXPO_PUBLIC_USE_LOCAL_API=true`, in which case it tries to infer the LAN host from the Expo manifest (falls back to `10.0.2.2` for Android emulator / `127.0.0.1` for iOS). Don't hardcode API URLs in screens — import `API_BASE_URL` from `config/api`.
- **Auth/session state**: `contexts/UserContext.tsx` is the global user/auth provider. Tokens live in `AsyncStorage`; `utils/tokenRefresh.js` centralizes token refresh (`refreshAuthToken`) and `makeAuthenticatedRequest` — it dedupes concurrent refresh calls so parallel 401s don't trigger multiple refreshes. Prefer `makeAuthenticatedRequest` over raw `fetch` for any authenticated API call.
- **Content access / subscription gating**: `utils/contentAccess.js` determines whether a piece of content (course, lesson, article, etc.) is free or premium (`accessType`, legacy `isPremium`/`isFree`/`price` fields are all normalized here — missing/legacy values default to free). `utils/subscriptionAccess.js` fetches the user's current subscription/pending-request status from the backend and defines the manual-transfer subscribe flow (`SUBSCRIBE_ROUTE = '/subscription-2'`, plan definitions in `PLAN_LABELS`). Use these helpers rather than re-deriving access logic per screen.
- **Media**: `utils/mediaUrl.js` resolves relative upload paths to full URLs; `utils/videoPlayback.js` has shared reel/video playback helpers (see recent work on reel playback fit, dimming, seek bar).
- User-facing content/UI is in English; some in-app strings (subscription plan labels, a couple of doc scripts) are bilingual (see `PLAN_LABELS` `en`/`ar`).

## Backend architecture

- **Entry point**: `backend/server.js` — Express app, security middleware (helmet, rate limiters, mongo-sanitize, xss-clean, hpp) applied per-route rather than globally, static `/uploads` serving with content-type/content-disposition handling for streamed media, MongoDB connection (env var `DB_CONNECTION_STRING` or `MONGODB_URI`), and Winston logging (`backend/logs/`).
- **Routes** (`backend/routes/`): one file per resource — `auth`, `users`, `courses`, `content` (articles/roadmaps/advices/etc. generic content), `club` (cohorts/enrollment), `jobs`, `payments`, `subscriptionRequests`, `reels`, `techNews`, `notifications`, `storage` (uploads), `admin`, `public` (unauthenticated endpoints). Mount points are defined in `server.js`.
- **Models** (`backend/models/`): Mongoose schemas — one per route resource, plus `Subscription`/`SubscriptionRequest`/`Payment` for the billing flow, `ClubCohort`/`ClubEnrollment` for the club system.
- **Auth**: JWT-based. `backend/middleware/auth.js` issues/verifies access + refresh tokens (`requireAuth`), scoped with `issuer: 'yone-app'` / `audience: 'yone-users'`. `backend/middleware/adminAuth.js` layers admin (`requireAdmin`) and super-admin (`requireSuperAdmin`, checks `user.adminLevel === 'super'`) checks on top — most admin-only routes need one of these rather than rolling custom checks.
- **Payments**: `backend/services/paymob.js` wraps the Paymob integration; there's also a manual bank-transfer subscription flow (`subscriptionRequests` route/model) used as the primary subscribe path (`/subscription-2` on the frontend) alongside/instead of live Paymob checkout — check `isPaymobConfigured()` / `NODE_ENV === 'development'` test-mode branches in `backend/routes/payments.js` before assuming Paymob is always live.
- **Background/scheduled logic**: `backend/services/subscriptionLifecycle.js` (subscription expiry/renewal), `backend/services/techNewsFetcher.js` + `techNewsExplainer.js` (pulls and summarizes tech news, has explicit logic to reject Google News logo thumbnails and always guarantee a cover image), `backend/services/pushNotifications.js` (Expo push).
- **Uploads**: persisted via `backend/utils/uploadDirs.js` (`ensureUploadDirs`) to a Railway-mounted volume in production; keep any new file-upload route going through this helper rather than writing to an ad hoc path.

## Notes on repo hygiene

- The root directory has many historical one-off `*.md` status/fix-log files (e.g. `SCREENSHOT_*`, `PAYMENT_FIX.md`, `PRODUCTION_READINESS_REPORT.md`). These are point-in-time notes, not living documentation — don't treat them as current source of truth; check the actual code.
- `app/content-management.tsx.backup` is a stray backup file, not part of the active routing.
