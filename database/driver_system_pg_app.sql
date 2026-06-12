-- PostgreSQL schema matching the current app Sequelize models
-- Generated from backend/src/models/*.js

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS "AuditLogs";
CREATE TABLE "AuditLogs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid,
  "action" varchar(255) NOT NULL,
  "entity" varchar(255),
  "entityId" uuid,
  "changes" jsonb DEFAULT '{}'::jsonb,
  "ipAddress" varchar(255),
  "userAgent" varchar(255),
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "Areas";
CREATE TABLE "Areas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL UNIQUE,
  "city" varchar(255),
  "province" varchar(255),
  "lat" double precision,
  "lng" double precision,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "Partners";
CREATE TABLE "Partners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "tradingName" varchar(255),
  "registrationNo" varchar(255),
  "vatNumber" varchar(255),
  "type" varchar(50) NOT NULL DEFAULT 'general',
  "commissionRate" double precision DEFAULT 10,
  "paymentTerms" varchar(20) NOT NULL DEFAULT 'monthly',
  "zones" text[] DEFAULT ARRAY[]::text[],
  "contactName" varchar(255),
  "contactPhone" varchar(255),
  "contactEmail" varchar(255),
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "Users";
CREATE TABLE "Users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password" varchar(255) NOT NULL,
  "role" varchar(20) NOT NULL DEFAULT 'viewer',
  "isActive" boolean DEFAULT true,
  "lastLogin" timestamp without time zone,
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "Drivers";
CREATE TABLE "Drivers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" varchar(255) NOT NULL,
  "lastName" varchar(255) NOT NULL,
  "phone" varchar(255) NOT NULL UNIQUE,
  "email" varchar(255),
  "idNumber" varchar(255),
  "dateOfBirth" date,
  "zone" varchar(255),
  "partnerId" uuid REFERENCES "Partners"("id"),
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "rating" double precision DEFAULT 0,
  "totalTrips" integer DEFAULT 0,
  "shiftStart" varchar(255),
  "shiftEnd" varchar(255),
  "licenceNumber" varchar(255),
  "licenceExpiry" date,
  "vehicleReg" varchar(255),
  "vehicleRegExpiry" date,
  "insuranceExpiry" date,
  "pdpExpiry" date,
  "backgroundCleared" boolean DEFAULT false,
  "photoUrl" varchar(1024),
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Drivers_zone_idx" ON "Drivers"("zone");
CREATE INDEX IF NOT EXISTS "Drivers_status_idx" ON "Drivers"("status");
CREATE INDEX IF NOT EXISTS "Drivers_partnerId_idx" ON "Drivers"("partnerId");

DROP TABLE IF EXISTS "Tasks";
CREATE TABLE "Tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "taskCode" varchar(255) UNIQUE,
  "type" varchar(20) NOT NULL DEFAULT 'food',
  "driverId" uuid REFERENCES "Drivers"("id"),
  "partnerId" uuid REFERENCES "Partners"("id"),
  "pickupAddress" varchar(1024) NOT NULL,
  "pickupLat" double precision,
  "pickupLng" double precision,
  "dropoffAddress" varchar(1024) NOT NULL,
  "dropoffLat" double precision,
  "dropoffLng" double precision,
  "distanceKm" double precision,
  "baseFare" double precision DEFAULT 35,
  "perKmRate" double precision DEFAULT 12,
  "totalFare" double precision,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "pickupTime" timestamp without time zone,
  "deliveredAt" timestamp without time zone,
  "notes" text,
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Tasks_driverId_idx" ON "Tasks"("driverId");
CREATE INDEX IF NOT EXISTS "Tasks_partnerId_idx" ON "Tasks"("partnerId");
CREATE INDEX IF NOT EXISTS "Tasks_status_idx" ON "Tasks"("status");
CREATE INDEX IF NOT EXISTS "Tasks_taskCode_idx" ON "Tasks"("taskCode");

DROP TABLE IF EXISTS "Earnings";
CREATE TABLE "Earnings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "driverId" uuid NOT NULL REFERENCES "Drivers"("id"),
  "taskId" uuid REFERENCES "Tasks"("id"),
  "amount" double precision NOT NULL,
  "commission" double precision DEFAULT 0,
  "netAmount" double precision,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "paidAt" timestamp without time zone,
  "periodStart" date,
  "periodEnd" date,
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "Reports";
CREATE TABLE "Reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" varchar(20) NOT NULL,
  "generatedBy" uuid REFERENCES "Users"("id"),
  "filters" jsonb DEFAULT '{}'::jsonb,
  "fileUrl" varchar(1024),
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Reports_generatedBy_idx" ON "Reports"("generatedBy");
