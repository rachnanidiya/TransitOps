-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (for reference, though we're storing role as text in users for simplicity)
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT UNIQUE NOT NULL,
    name_model TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Truck', 'Van', 'Bus', 'Car')),
    max_load_capacity REAL NOT NULL,
    odometer REAL DEFAULT 0,
    acquisition_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_category TEXT NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number TEXT,
    safety_score REAL DEFAULT 100,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    vehicle_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    cargo_weight REAL NOT NULL,
    planned_distance REAL NOT NULL,
    actual_distance REAL,
    fuel_consumed REAL,
    revenue REAL DEFAULT 0,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
    dispatched_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Maintenance logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed')),
    scheduled_date DATE,
    completed_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- Fuel logs table
CREATE TABLE IF NOT EXISTS fuel_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    trip_id INTEGER,
    liters REAL NOT NULL,
    cost REAL NOT NULL,
    date DATE NOT NULL,
    odometer_reading REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    trip_id INTEGER,
    category TEXT NOT NULL CHECK (category IN ('Fuel', 'Maintenance', 'Tolls', 'Parking', 'Insurance', 'Other')),
    description TEXT,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_id);