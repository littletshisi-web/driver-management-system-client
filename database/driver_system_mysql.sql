-- MySQL-compatible DDL converted from driver_system_pg.sql
-- Use this file to import into phpMyAdmin or via mysql CLI

DROP TABLE IF EXISTS areas;
CREATE TABLE areas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  area_name VARCHAR(250) NOT NULL,
  city VARCHAR(200),
  province VARCHAR(250),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(25),
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY users_email_idx (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS drivers;
CREATE TABLE drivers (
  driver_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(20),
  license_number VARCHAR(50),
  status ENUM('available','busy','offline') NOT NULL DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS partners;
CREATE TABLE partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(250) NOT NULL,
  contact_person VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT,
  location VARCHAR(255),
  status ENUM('pending','assigned','completed') NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  INDEX tasks_driver_id_idx (driver_id),
  CONSTRAINT fk_tasks_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS earnings;
CREATE TABLE earnings (
  earning_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  task_id INT,
  amount DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0.00,
  deductions DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  earning_date DATE NOT NULL,
  payment_date DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX earnings_driver_id_idx (driver_id),
  INDEX earnings_task_id_idx (task_id),
  CONSTRAINT fk_earnings_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
  CONSTRAINT fk_earnings_task FOREIGN KEY (task_id) REFERENCES tasks(task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('task','earning','system','warning','announcement') NOT NULL DEFAULT 'system',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX notifications_user_id_idx (user_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  report_type ENUM('driver_performance','earnings','task_summary','incident','attendance','custom') NOT NULL,
  title VARCHAR(250) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX reports_user_id_idx (user_id),
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS vehicles;
CREATE TABLE vehicles (
  vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT,
  vehicle_type VARCHAR(50),
  plate_number VARCHAR(20),
  INDEX vehicles_driver_id_idx (driver_id),
  CONSTRAINT fk_vehicles_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX audit_logs_user_id_idx (user_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
