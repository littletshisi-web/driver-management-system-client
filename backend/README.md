# FleetHQ — Backend API

Node.js + Express + Sequelize

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your values
cp .env .env.local

# 3. For local development, use SQLite:
#    DB_DIALECT=sqlite
#    DB_STORAGE=./database.sqlite
#
#    If you want MySQL instead, configure DB_DIALECT=mysql and the MySQL settings.

# 4. Run migrations
npm run migrate

# 5. Seed sample data
npm run seed

# 6. Start dev server
npm run dev
```

Server starts on **http://localhost:5000**

---

## API Reference

| Method | Endpoint                        | Description              | Auth |
|--------|---------------------------------|--------------------------|------|
| POST   | /api/auth/register              | Register user            | ❌   |
| POST   | /api/auth/login                 | Login                    | ❌   |
| POST   | /api/auth/refresh               | Refresh token            | ❌   |
| GET    | /api/auth/me                    | Current user             | ✅   |
| GET    | /api/drivers                    | List drivers             | ✅   |
| POST   | /api/drivers                    | Add driver               | ✅   |
| GET    | /api/drivers/:id                | Get driver               | ✅   |
| PUT    | /api/drivers/:id                | Update driver            | ✅   |
| DELETE | /api/drivers/:id                | Deactivate driver        | ✅   |
| POST   | /api/drivers/:id/docs/:field    | Upload document          | ✅   |
| GET    | /api/partners                   | List partners            | ✅   |
| POST   | /api/partners                   | Add partner              | ✅   |
| GET    | /api/partners/:id               | Get partner              | ✅   |
| PUT    | /api/partners/:id               | Update partner           | ✅   |
| GET    | /api/tasks                      | List trips               | ✅   |
| POST   | /api/tasks                      | Log trip                 | ✅   |
| GET    | /api/tasks/:id                  | Get trip                 | ✅   |
| PATCH  | /api/tasks/:id/status           | Update trip status       | ✅   |
| POST   | /api/pricing/calculate          | Calculate fare           | ✅   |
| GET    | /api/pricing/config             | Get pricing config       | ✅   |
| GET    | /api/reports                    | List reports             | ✅   |
| POST   | /api/reports/generate           | Generate report          | ✅   |
| GET    | /api/areas                      | List zones               | ✅   |
| POST   | /api/areas                      | Add zone                 | ✅   |
| GET    | /api/help/topics                | Help topics              | ✅   |

---

## Roles

| Role    | Permissions                        |
|---------|------------------------------------|
| admin   | Full access                        |
| manager | Read + create + update             |
| viewer  | Read only                          |

---

## Default seed credentials

```
Email:    admin@fleethq.co.za
Password: Admin@1234
```

---

## Run tests

```bash
npm test
```
