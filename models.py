from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # fleet_manager, dispatcher, safety_officer, financial_analyst
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    name_model = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # Truck, Van, Bus, Car
    max_load_capacity = db.Column(db.Float, nullable=False)
    odometer = db.Column(db.Float, default=0)
    acquisition_cost = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='Available')  # Available, On Trip, In Shop, Retired
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Driver(db.Model):
    __tablename__ = 'drivers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_category = db.Column(db.String(20), nullable=False)
    license_expiry_date = db.Column(db.Date, nullable=False)
    contact_number = db.Column(db.String(20))
    safety_score = db.Column(db.Float, default=100)
    status = db.Column(db.String(20), default='Available')  # Available, On Trip, Off Duty, Suspended
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Trip(db.Model):
    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=False)
    cargo_weight = db.Column(db.Float, nullable=False)
    planned_distance = db.Column(db.Float, nullable=False)
    actual_distance = db.Column(db.Float)
    fuel_consumed = db.Column(db.Float)
    revenue = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='Draft')  # Draft, Dispatched, Completed, Cancelled
    dispatched_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = db.relationship('Vehicle', foreign_keys=[vehicle_id])
    driver = db.relationship('Driver', foreign_keys=[driver_id])


class MaintenanceLog(db.Model):
    __tablename__ = 'maintenance_logs'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Oil Change, Tire Replacement, Engine Repair, General Service, etc.
    description = db.Column(db.Text)
    cost = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='Active')  # Active, Completed
    scheduled_date = db.Column(db.Date)
    completed_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    vehicle = db.relationship('Vehicle', foreign_keys=[vehicle_id])


class FuelLog(db.Model):
    __tablename__ = 'fuel_logs'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=True)
    liters = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    odometer_reading = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = db.relationship('Vehicle', foreign_keys=[vehicle_id])
    trip = db.relationship('Trip', foreign_keys=[trip_id])


class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=True)
    category = db.Column(db.String(50), nullable=False)  # Fuel, Maintenance, Tolls, Parking, Insurance, Other
    description = db.Column(db.Text)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = db.relationship('Vehicle', foreign_keys=[vehicle_id])
    trip = db.relationship('Trip', foreign_keys=[trip_id])