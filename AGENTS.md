# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository shape
- Monorepo-style layout with separate apps:
  - `frontend/`: React + Vite client.
  - `backend/`: Express + Sequelize API.
  - `database/`: schema/migration assets (supplementary to backend runtime migration scripts).
- Root `package.json` is mainly an orchestration layer that delegates to frontend/backend scripts via `npm --prefix`.

## Development commands

### Root commands
- Install root deps:
  - `npm install`
- Run frontend dev server (delegated):
  - `npm run dev`
- Build frontend:
  - `npm run build`
- Preview frontend build:
  - `npm run preview`
- Run backend in dev mode:
  - `npm run backend`
- Run backend in start mode:
  - `npm run start`
- Run frontend + backend together:
  - `npm run demo`

### Frontend (`frontend/`)
- Install deps:
  - `npm install`
- Dev server:
  - `npm run dev`
- Build:
  - `npm run build`
- Preview:
  - `npm run preview`
- Demo-mode helpers:
  - `npm run demo:frontend`
  - `npm run demo:build`
  - `npm run demo:preview`

Notes:
- Vite dev server is configured for port `5173` in `frontend/vite.config.js`.
- API requests to `/api` are proxied to `http://localhost:5001` in dev (`frontend/vite.config.js`), while backend README states `5000` by default; align backend `PORT` or proxy target when running locally.
- No frontend lint/test scripts are currently defined in `frontend/package.json`.

### Backend (`backend/`)
- Install deps:
  - `npm install`
- Start in dev mode:
  - `npm run dev`
- Start in production-style mode:
  - `npm run start`
- Run migrations:
  - `npm run migrate`
- Seed sample data:
  - `npm run seed`
- Run full backend test suite:
  - `npm test`
- Run a single backend test file:
  - `npx jest tests/auth.test.js --runInBand`
- Run a single backend test case by name:
  - `npx jest tests/auth.test.js -t "rejects bad credentials" --runInBand`

Notes:
- Test framework is Jest + Supertest (`backend/package.json`, `backend/tests/*`).
- No backend lint script is currently defined.

## Environment and data flow
- Backend boot sequence:
  1. `backend/src/index.js` loads env and DB connection.
  2. `backend/src/config/server.js` builds middleware stack and mounts route modules.
  3. Sequelize associations are loaded centrally via `backend/src/models/associations.js`.
- DB config (`backend/src/config/db.js`) supports sqlite (default) and mysql; development mode calls `sequelize.sync({ alter: true })`.
- Migration/seed scripts are runnable entrypoints in `backend/src/database/migrations/run.js` and `backend/src/database/seeders/run.js`.

## Backend architecture (high level)
- Request path pattern is:
  `route -> auth/role/validation/audit middleware -> controller -> model/service -> JSON response`.
- Route modules are feature-scoped (`driverRoutes`, `taskRoutes`, `pricingRoutes`, etc.) and mounted under `/api/*` in `backend/src/config/server.js`.
- Controllers hold HTTP-level orchestration and response shaping (e.g., pagination/filtering in `driverController`, status transitions in `taskController`).
- Services hold reusable domain logic where needed (e.g., `pricingService`, `earningsService`, `taskAssignmentService`, `reportService`).
- Cross-cutting middleware:
  - Auth/JWT guard: `backend/src/middleware/authMiddleware.js`.
  - Role authorization: `roleMiddleware`.
  - Request validation: `validationMiddleware` + Joi validators in `backend/src/validators`.
  - Audit logging and error handling middleware wired globally in server setup.

## Frontend architecture (high level)
- Entrypoint (`frontend/src/main.jsx`) composes providers and router:
  `BrowserRouter -> ThemeProvider -> AuthProvider -> ToastProvider -> App`.
- `frontend/src/App.jsx` owns route tree, route protection, and role-to-layout selection:
  - `ProtectedRoute` gates auth + role permissions.
  - `RoleLayout` switches between `AdminLayout`, `PartnerLayout`, and `DriverLayout`.
- API layer is centralized:
  - `frontend/src/api/axiosInstance.js` injects JWT from `localStorage` and handles global 401 redirect to `/login`.
  - Endpoint constants live in `frontend/src/constants/apiRoutes.js`.
  - Feature API modules (`driverApi`, `taskApi`, etc.) call those endpoints.
- Pages consume hooks + API modules and render shared UI primitives from `components/`.

## Repository-specific gotchas to keep in mind
- Several tracked files currently include accidental raw diff text (`diff --git`, `@@`) at file top, including:
  - `README.md`
  - `backend/src/routes/authRoutes.js`
  - `backend/src/controllers/pricingController.js`
  - `backend/src/controllers/reportController.js`
  - `frontend/src/components/forms/DriverForm.jsx`
  - `frontend/src/pages/Pricing.jsx`
- If runtime or parsing errors appear unexpectedly, check for and clean these artifacts first before deeper refactors.
