-- =========================================
-- Smart Nearest Ambulance - Database Schema
-- MySQL 8.x
-- =========================================

CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
role ENUM('driver', 'operator', 'management') NOT NULL,
username VARCHAR(50) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ambulances (
id INT AUTO_INCREMENT PRIMARY KEY,
plate_number VARCHAR(20) NOT NULL UNIQUE,
driver_id INT NULL,
status ENUM('available', 'on_mission', 'maintenance', 'offline') NOT NULL DEFAULT 'offline',
last_seen_at DATETIME NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fk_ambulances_driver
FOREIGN KEY (driver_id) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE
);

CREATE TABLE location_history (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
ambulance_id INT NOT NULL,
latitude DECIMAL(10,7) NOT NULL,
longitude DECIMAL(10,7) NOT NULL,
recorded_at DATETIME NOT NULL,
CONSTRAINT fk_location_ambulance
FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
ON DELETE CASCADE
ON UPDATE CASCADE,
INDEX idx_location_ambulance_time (ambulance_id, recorded_at)
);

CREATE TABLE sos_alerts (
id INT AUTO_INCREMENT PRIMARY KEY,
ambulance_id INT NOT NULL,
latitude DECIMAL(10,7) NOT NULL,
longitude DECIMAL(10,7) NOT NULL,
triggered_at DATETIME NOT NULL,
resolved BOOLEAN NOT NULL DEFAULT FALSE,
resolved_at DATETIME NULL,
CONSTRAINT fk_sos_ambulance
FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
ON DELETE CASCADE
ON UPDATE CASCADE
);

CREATE TABLE trips (
id INT AUTO_INCREMENT PRIMARY KEY,
ambulance_id INT NOT NULL,
start_time DATETIME NOT NULL,
end_time DATETIME NULL,
start_location VARCHAR(255) NULL,
end_location VARCHAR(255) NULL,
CONSTRAINT fk_trips_ambulance
FOREIGN KEY (ambulance_id) REFERENCES ambulances(id)
ON DELETE CASCADE
ON UPDATE CASCADE
);
