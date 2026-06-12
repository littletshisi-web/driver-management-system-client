-- Converted MySQL schema to PostgreSQL-compatible DDL
-- Source: /Users/tshisidavhana/Documents/driver_system.sql

DROP TABLE IF EXISTS areas;
CREATE TABLE areas (
  id serial PRIMARY KEY,
  area_name varchar(250) NOT NULL,
  city varchar(200),
  province varchar(250),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id serial PRIMARY KEY,
  full_name varchar(100) NOT NULL,
  email varchar(200) NOT NULL,
  phone varchar(25),
  password_hash varchar(255) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX users_email_idx ON users(email);

DROP TABLE IF EXISTS drivers;
CREATE TABLE drivers (
  driver_id serial PRIMARY KEY,
  name varchar(100),
  phone varchar(20),
  license_number varchar(50),
  status varchar(10) NOT NULL DEFAULT 'available' CHECK (status IN ('available','busy','offline')),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS partners;
CREATE TABLE partners (
  id serial PRIMARY KEY,
  company_name varchar(250) NOT NULL,
  contact_person varchar(200),
  email varchar(200),
  phone varchar(20),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  task_id serial PRIMARY KEY,
  driver_id integer REFERENCES drivers(driver_id),
  location varchar(255),
  status varchar(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','assigned','completed')),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp without time zone
);
CREATE INDEX tasks_driver_id_idx ON tasks(driver_id);

DROP TABLE IF EXISTS earnings;
CREATE TABLE earnings (
  earning_id serial PRIMARY KEY,
  driver_id integer NOT NULL REFERENCES drivers(driver_id),
  task_id integer REFERENCES tasks(task_id),
  amount numeric(10,2) NOT NULL,
  bonus numeric(10,2) DEFAULT 0.00,
  deductions numeric(10,2) DEFAULT 0.00,
  total_amount numeric(10,2) NOT NULL,
  payment_status varchar(10) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','cancelled')),
  earning_date date NOT NULL,
  payment_date timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX earnings_driver_id_idx ON earnings(driver_id);
CREATE INDEX earnings_task_id_idx ON earnings(task_id);

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  notification_id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(user_id),
  title varchar(255) NOT NULL,
  message text NOT NULL,
  notification_type varchar(20) NOT NULL DEFAULT 'system' CHECK (notification_type IN ('task','earning','system','warning','announcement')),
  is_read boolean NOT NULL DEFAULT FALSE,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);

DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
  report_id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(user_id),
  report_type varchar(30) NOT NULL CHECK (report_type IN ('driver_performance','earnings','task_summary','incident','attendance','custom')),
  title varchar(250) NOT NULL,
  description text,
  start_date date,
  end_date date,
  status varchar(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX reports_user_id_idx ON reports(user_id);

DROP TABLE IF EXISTS vehicles;
CREATE TABLE vehicles (
  vehicle_id serial PRIMARY KEY,
  driver_id integer REFERENCES drivers(driver_id),
  vehicle_type varchar(50),
  plate_number varchar(20)
);
CREATE INDEX vehicles_driver_id_idx ON vehicles(driver_id);

DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  log_id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(user_id),
  action varchar(100) NOT NULL,
  table_name varchar(100) NOT NULL,
  record_id integer,
  old_values json,
  new_values json,
  ip_address varchar(45),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
