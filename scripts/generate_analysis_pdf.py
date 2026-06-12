#!/usr/bin/env python3
"""Generate a simple text PDF without external dependencies."""

import textwrap
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "DMS-Code-Analysis.pdf"

CONTENT = """
CODE ANALYSIS: DMS CLIENT (FLEETHQ)

Generated: June 2026

================================================================================
1. OVERVIEW
================================================================================

This is a Driver Management System (DMS) — a full-stack monorepo with a React
frontend and a Node.js/Express backend. The frontend works standalone in demo/
mock mode and can connect to the live API when configured.

Stack:
  Frontend — React 18, Vite 8, React Router 6, Axios, CSS Modules (/src)
  Backend  — Express, Sequelize, JWT, Joi, Winston (/backend/src)
  Dev proxy — /api -> localhost:5000 (vite.config.js)

Run modes:
  Demo       — VITE_USE_MOCK=true (default in .env.example), no backend required
  Full stack — npm run demo runs frontend + backend together

================================================================================
2. ARCHITECTURE
================================================================================

Frontend layers:
  pages/       Route-level screens (Dashboard, Drivers, Tasks, etc.)
  layouts/     Role-specific shells (AdminLayout, PartnerLayout, DriverLayout)
  hooks/       Data fetching with mock/API toggle
  api/         Axios wrappers + centralized route constants
  context/     Auth, theme, toast
  components/  Reusable UI (tables, forms, charts, modals)

Backend layers:
  config/       server, db, jwt, multer
  controllers/  request handlers
  middleware/   auth, roles, validation, audit, errors
  models/       Sequelize entities
  routes/       REST endpoints
  services/     business logic (pricing, reports, earnings)
  validators/   Joi schemas
  utils/        logger, distance, currency, etc.

Routing & auth (App.jsx):
  - Public /login route
  - Protected routes with nested ProtectedRoute + role checks
  - Layout chosen by role: admin -> partner -> driver

Security (backend):
  - Helmet, CORS, rate limiting (100 req/15 min)
  - JWT auth via protect middleware
  - Role-based access via authorize('admin','manager')
  - Password hashing with bcrypt (cost 12)
  - Audit logging middleware on mutating routes

Database:
  - SQLite by default for local dev; MySQL supported
  - Migrations + seeders available
  - sequelize.sync({ alter: true }) in development (auto-alters schema)

================================================================================
3. DOMAIN MODEL
================================================================================

The app manages:
  Users     — login accounts (admin/manager/viewer on backend)
  Drivers   — fleet operators with documents, zones, partner links
  Partners  — logistics companies with commission rates
  Tasks     — delivery/trip jobs with pickup/dropoff, pricing, status
  Areas     — operational zones
  Reports   — generated analytics
  AuditLog  — change tracking (model exists; read API missing)

================================================================================
4. FRONTEND STRENGTHS
================================================================================

  - Clear separation of concerns (pages vs hooks vs API)
  - CSS Modules for scoped styling
  - Centralized API routes in constants/apiRoutes.js
  - JWT interceptor in axiosInstance.js handles 401 globally
  - Mock layer allows UI development without backend
  - Role-based layouts for admin, partner, and driver personas

================================================================================
5. CRITICAL INTEGRATION GAPS
================================================================================

The frontend and backend were built with different domain assumptions. Demo mode
hides this; live API mode will break in several places.

5.1 Role mismatch
  Frontend (roles.js):     admin, partner, driver
  Backend (User.js):       admin, manager, viewer

  Frontend role-based layouts expect partner and driver. Backend only knows
  manager and viewer. Real login as admin@fleethq.co.za works for admin routes,
  but partner/driver UX has no backend equivalent.

5.2 Data shape mismatch (Drivers)
  Frontend mock expects:
    { name, licenseNumber, availabilityStatus, vehicleType, area: { name } }

  Backend returns:
    { firstName, lastName, licenceNumber, status: 'active'|'inactive', zone }

  Fields like name, availabilityStatus, and nested area objects do not match.

5.3 Task model mismatch
  Frontend mock categories:  parcel_delivery, vehicle_towing, furniture_moving
  Backend Task types:        food, parcels, grocery, other

  Frontend statuses:         in_progress, completed
  Backend statuses:          in-transit, delivered

  Frontend field:            deliveryAddress
  Backend field:             dropoffAddress

5.4 Missing or mismatched API endpoints
  Frontend expects              Backend provides
  -------------------------     ---------------------------
  POST /auth/logout             Not implemented
  GET /audit                    Not implemented (model exists, no route)
  GET /pricing/rules            GET /pricing/config
  GET /reports/tasks            GET /reports, POST /reports/generate
  GET /reports/earnings         (no dedicated endpoint)
  PATCH /drivers/:id/suspend    DELETE /drivers/:id (soft deactivate)

5.5 Auth bug in live mode
  In AuthContext.jsx, session restore uses the wrong response shape:
    getMe().then((res) => setUser(res.data))

  Backend /auth/me returns { success: true, user: {...} }, so user becomes the
  whole payload instead of the user object. Should be res.data.user.

5.6 Dashboard still hardcoded
  Dashboard.jsx uses static chart/activity data with TODO comments. Other pages
  use hooks with mock/API toggle, but the dashboard does not.

================================================================================
6. CODE QUALITY OBSERVATIONS
================================================================================

Good:
  - Consistent error middleware and structured JSON responses
  - Validation via Joi + middleware
  - Audit trail on create/update/delete
  - Backend tests exist (auth, drivers, tasks, pricing)
  - Sensible defaults (SQLite, seed data, demo credentials)

Needs attention:
  - Branding inconsistency: FleetHQ (backend) vs DMS (frontend)
  - Misleading log: db.js logs "MySQL connected" even for SQLite
  - sequelize.sync({ alter: true }) risky if used against shared DBs
  - No frontend tests
  - Refresh tokens issued by backend but never used by frontend
  - CORS default * — fine for dev, tighten for production
  - backend/.env may contain secrets — should be gitignored

================================================================================
7. CURRENT STATE SUMMARY
================================================================================

  UI / demo mode                  Works well with mock data
  Backend API                     Solid foundation, tested, documented
  Frontend <-> backend integration  Incomplete — schema, roles, routes diverge
  Production readiness            Not yet — integration layer needs alignment

================================================================================
8. RECOMMENDED NEXT STEPS (PRIORITY ORDER)
================================================================================

  1. Align roles — extend backend with partner/driver OR map frontend roles to
     manager/viewer.

  2. Fix AuthContext — use res.data.user from /auth/me.

  3. Add missing routes — /audit, /auth/logout, or update frontend to match
     existing endpoints.

  4. Normalize API contracts — shared TypeScript types or OpenAPI spec for
     driver/task/pricing shapes.

  5. Wire Dashboard to real report/task endpoints.

  6. Set VITE_USE_MOCK=false and run end-to-end against the backend to surface
     remaining gaps.

================================================================================
END OF REPORT
================================================================================
"""


def escape_pdf_text(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def wrap_lines(text: str, width: int = 92) -> list[str]:
    lines: list[str] = []
    for paragraph in text.strip().split("\n"):
        if not paragraph.strip():
            lines.append("")
            continue
        wrapped = textwrap.wrap(paragraph, width=width, break_long_words=False, break_on_hyphens=False)
        lines.extend(wrapped if wrapped else [""])
    return lines


def build_pdf(lines: list[str]) -> bytes:
    font_size = 10
    leading = 14
    left = 54
    top = 770
    lines_per_page = 48

    pages: list[list[str]] = []
    for i in range(0, len(lines), lines_per_page):
        pages.append(lines[i : i + lines_per_page])

    objects: list[bytes] = []
    page_obj_nums: list[int] = []

    def add_obj(content: str) -> int:
        objects.append(content.encode("latin-1", errors="replace"))
        return len(objects)

    font_obj = add_obj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    for page_lines in pages:
        y = top
        stream_parts = ["BT", f"/F1 {font_size} Tf"]
        for line in page_lines:
            stream_parts.append(f"{left} {y} Td ({escape_pdf_text(line)}) Tj")
            stream_parts.append(f"0 -{leading} Td")
            y -= leading
        stream_parts.append("ET")
        stream = "\n".join(stream_parts)
        content_obj = add_obj(f"<< /Length {len(stream)} >>\nstream\n{stream}\nendstream")
        page_obj = add_obj(
            f"<< /Type /Page /Parent PAGES_PLACEHOLDER /MediaBox [0 0 612 792] "
            f"/Resources << /Font << /F1 {font_obj} 0 R >> >> /Contents {content_obj} 0 R >>"
        )
        page_obj_nums.append(page_obj)

    kids = " ".join(f"{num} 0 R" for num in page_obj_nums)
    pages_obj = add_obj(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_obj_nums)} >>")

    for idx, obj_num in enumerate(page_obj_nums):
        objects[obj_num - 1] = objects[obj_num - 1].decode("latin-1").replace("PAGES_PLACEHOLDER", f"{pages_obj} 0 R").encode("latin-1")

    catalog_obj = add_obj(f"<< /Type /Catalog /Pages {pages_obj} 0 R >>")

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("ascii"))

    pdf.extend(f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_obj} 0 R >>\n".encode("ascii"))
    pdf.extend(f"startxref\n{xref_pos}\n%%EOF\n".encode("ascii"))
    return bytes(pdf)


def main() -> None:
    lines = wrap_lines(CONTENT)
    pdf_bytes = build_pdf(lines)
    OUTPUT.write_bytes(pdf_bytes)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
