# DMS Fullstack App

This repository contains a full-stack Driver Management System.

## Structure

- `frontend/` - React app built with Vite
- `backend/` - Express + Sequelize API server
- `database/` - SQL database schema and migration files
- `scripts/` - utility scripts

## Quick start

### Frontend
```bash
cdiff --git a/backend/src/controllers/pricingController.js b/backend/src/controllers/pricingController.js
@@
 const updateConfig = (req, res) => {
-  pricingConfig = { ...pricingConfig, ...req.body };
+  pricingConfig = { ...pricingConfig, ...req.body };
   res.json({ success: true, data: pricingConfig });
 };d frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Run both locally
```bash
npm install
npm run demo
```

## Notes

- Frontend env files are in `frontend/.env`
- Backend env file is in `backend/.env`
- Use `npm run start` from root to start the backend only
# driver-management-system-client
