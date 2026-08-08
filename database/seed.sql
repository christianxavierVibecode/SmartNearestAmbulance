-- =========================================
-- Smart Nearest Ambulance - Seed Data
-- =========================================

-- Truncate existing data for clean seed
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE trips;
TRUNCATE TABLE sos_alerts;
TRUNCATE TABLE location_history;
TRUNCATE TABLE ambulances;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users (Password is 'password123' hashed with bcrypt)
INSERT INTO users (id, name, role, username, password_hash) VALUES
(1, 'Operator Central', 'operator', 'operator1', '$2b$10$JgI1cc6LRUYETMYimL7NJ.WTeaOFvYzU2dy1MSEhpZBvFy2xp4Yu6'),
(2, 'Manager RS', 'management', 'admin1', '$2b$10$JgI1cc6LRUYETMYimL7NJ.WTeaOFvYzU2dy1MSEhpZBvFy2xp4Yu6'),
(3, 'Budi Santoso', 'driver', 'driver1', '$2b$10$JgI1cc6LRUYETMYimL7NJ.WTeaOFvYzU2dy1MSEhpZBvFy2xp4Yu6'),
(4, 'Siti Rahma', 'driver', 'driver2', '$2b$10$JgI1cc6LRUYETMYimL7NJ.WTeaOFvYzU2dy1MSEhpZBvFy2xp4Yu6'),
(5, 'Agus Pratama', 'driver', 'driver3', '$2b$10$JgI1cc6LRUYETMYimL7NJ.WTeaOFvYzU2dy1MSEhpZBvFy2xp4Yu6');

-- Insert Ambulances linked to Drivers
INSERT INTO ambulances (id, plate_number, driver_id, status, last_seen_at) VALUES
(1, 'DH 1234 AA', 3, 'available', NOW()),
(2, 'DH 5678 BB', 4, 'available', NOW()),
(3, 'DH 9012 CC', 5, 'offline', NOW());
