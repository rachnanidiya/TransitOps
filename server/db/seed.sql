-- Clear existing data (in reverse order of foreign key dependencies)
DELETE FROM expenses;
DELETE FROM fuel_logs;
DELETE FROM maintenance_logs;
DELETE FROM trips;
DELETE FROM drivers;
DELETE FROM vehicles;
DELETE FROM users;
DELETE FROM roles;

-- Reset auto-increment counters
DELETE FROM SQLITE_SEQUENCE WHERE name IN ('users', 'roles', 'vehicles', 'drivers', 'trips', 'maintenance_logs', 'fuel_logs', 'expenses');

-- Insert roles
INSERT INTO roles (name) VALUES
('fleet_manager'),
('dispatcher'),
('safety_officer'),
('financial_analyst');

-- Insert users (one per role)
INSERT INTO users (email, password_hash, name, role) VALUES
('fleet.manager@transitops.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.eGF2Vq', 'Fleet Manager', 'fleet_manager'),
('dispatcher@transitops.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.eGF2Vq', 'Dispatcher', 'dispatcher'),
('safety.officer@transitops.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.eGF2Vq', 'Safety Officer', 'safety_officer'),
('financial.analyst@transitops.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.eGF2Vq', 'Financial Analyst', 'financial_analyst');

-- Insert vehicles
INSERT INTO vehicles (registration_number, name_model, type, max_load_capacity, odometer, acquisition_cost, status) VALUES
('TRK-001', 'Volvo FH16', 'Truck', 20000, 50000, 120000, 'Available'),
('TRK-002', 'Scania R450', 'Truck', 18000, 75000, 110000, 'Available'),
('VAN-001', 'Mercedes Sprinter', 'Van', 1500, 30000, 35000, 'Available'),
('VAN-002', 'Ford Transit', 'Van', 1200, 45000, 32000, 'Available'),
('BUS-001', 'Volvo B8R', 'Bus', 8000, 200000, 250000, 'Available'),
('BUS-002', 'Mercedes Tourismo', 'Bus', 7500, 180000, 230000, 'Available'),
('CAR-001', 'Toyota Corolla', 'Car', 500, 60000, 20000, 'Available'),
('CAR-002', 'Honda Civic', 'Car', 450, 55000, 18000, 'In Shop');

-- Insert drivers
INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) VALUES
('John Smith', 'DL-001', 'C', '2025-12-31', '555-0101', 95, 'Available'),
('Maria Garcia', 'DL-002', 'B', '2024-06-15', '555-0102', 98, 'Available'),
('Robert Johnson', 'DL-003', 'C', '2025-03-22', '555-0103', 92, 'Available'),
('David Wilson', 'DL-004', 'C', '2024-11-30', '555-0104', 88, 'Off Duty'),
('Sarah Davis', 'DL-005', 'B', '2023-08-20', '555-0105', 96, 'Suspended');

-- Insert trips
INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, actual_distance, fuel_consumed, revenue, status, dispatched_at, completed_at) VALUES
('New York', 'Boston', 1, 1, 5000, 215, 215, 35.5, 500, 'Completed', '2023-05-15 08:00:00', '2023-05-15 12:00:00'),
('Los Angeles', 'San Diego', 2, 2, 8000, 120, 120, 18.2, 300, 'Completed', '2023-05-14 07:30:00', '2023-05-14 10:30:00'),
('Chicago', 'Detroit', 3, 3, 3000, 280, NULL, NULL, 0, 'Dispatched', '2023-05-20 09:00:00', NULL),
('Miami', 'Orlando', 4, 1, 2000, 230, NULL, NULL, 0, 'Draft', NULL, NULL),
('Seattle', 'Portland', 5, 2, 4000, 175, NULL, NULL, 0, 'Draft', NULL, NULL),
('Houston', 'Dallas', 6, 3, 6000, 240, NULL, NULL, 0, 'Draft', NULL, NULL),
('Atlanta', 'Charlotte', 7, 1, 1500, 245, NULL, NULL, 0, 'Draft', NULL, NULL),
('Phoenix', 'Las Vegas', 8, 2, 3500, 270, NULL, NULL, 0, 'Draft', NULL, NULL);

-- Insert maintenance logs
INSERT INTO maintenance_logs (vehicle_id, type, description, cost, status, scheduled_date, completed_date) VALUES
(1, 'Oil Change', 'Regular oil and filter change', 75.00, 'Completed', '2023-05-01', '2023-05-01'),
(2, 'Tire Rotation', 'Rotate all tires and check pressure', 50.00, 'Completed', '2023-05-05', '2023-05-05'),
(3, 'Brake Inspection', 'Check brake pads and rotors', 120.00, 'Active', '2023-05-10', NULL),
(8, 'Engine Diagnostic', 'Check engine light diagnosis', 150.00, 'Completed', '2023-05-03', '2023-05-03');

-- Insert fuel logs
INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, date, odometer_reading) VALUES
(1, 1, 65.2, 120.00, '2023-05-15', 50215),
(2, 2, 28.5, 55.00, '2023-05-14', 75120),
(3, 3, 45.0, 85.00, '2023-05-20', NULL),
(1, NULL, 50.0, 92.00, '2023-05-10', 50100),
(2, NULL, 40.0, 78.00, '2023-05-12', 75080);

-- Insert expenses
INSERT INTO expenses (vehicle_id, trip_id, category, description, amount, date) VALUES
(1, 1, 'Fuel', 'Diesel fuel for trip', 120.00, '2023-05-15'),
(2, 2, 'Fuel', 'Gasoline for trip', 55.00, '2023-05-14'),
(1, NULL, 'Maintenance', 'Oil change service', 75.00, '2023-05-01'),
(3, NULL, 'Tolls', 'Highway tolls', 25.00, '2023-05-10'),
(2, NULL, 'Parking', 'Downtown parking', 15.00, '2023-05-08');