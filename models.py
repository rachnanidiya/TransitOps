from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()
# Initialize the database instance
db = SQLAlchemy()

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # e.g., Fleet Manager, Driver, Safety Officer, Financial Analyst
    
    # Relationship
    users = db.relationship('User', backref='role', lazy=True)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    # Foreign Key connecting to the Roles table
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    reg_number = db.Column(db.String(20), unique=True, nullable=False)
    capacity_kg = db.Column(db.Float, nullable=False)
    odometer = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='Available') # Available, On Trip, In Shop, Retired
    acquisition_cost = db.Column(db.Float, nullable=False) # Critical for the Vehicle ROI calculation
    
    # Relationships
    trips = db.relationship('Trip', backref='vehicle', lazy=True)
    maintenance_logs = db.relationship('MaintenanceLog', backref='vehicle', lazy=True)
    fuel_logs = db.relationship('FuelLog', backref='vehicle', lazy=True)
    expenses = db.relationship('Expense', backref='vehicle', lazy=True)

class Driver(db.Model):
    __tablename__ = 'drivers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_expiry = db.Column(db.Date, nullable=False)
    safety_score = db.Column(db.Float, default=100.0)
    status = db.Column(db.String(20), default='Available') # Available, On Trip, Off Duty, Suspended
    
    # Relationships
    trips = db.relationship('Trip', backref='driver', lazy=True)

class Trip(db.Model):
    __tablename__ = 'trips'
    
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    cargo_weight = db.Column(db.Float, nullable=False)
    revenue = db.Column(db.Float, nullable=False, default=0.0) # Needed for financial metrics
    status = db.Column(db.String(20), default='Draft') # Draft, Dispatched, Completed, Cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=False)
    
    # Relationship to general expenses tied directly to this trip (e.g., tolls)
    expenses = db.relationship('Expense', backref='trip', lazy=True)

class MaintenanceLog(db.Model):
    __tablename__ = 'maintenance_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    date_logged = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Open') # Open (vehicle in shop), Closed (vehicle available)
    
    # Foreign Key
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)

class FuelLog(db.Model):
    __tablename__ = 'fuel_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    liters_filled = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    date_logged = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Key
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    expense_type = db.Column(db.String(50), nullable=False) # e.g., Toll, Parking, Driver Meals
    amount = db.Column(db.Float, nullable=False)
    date_logged = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=True) # Nullable because some expenses aren't tied to a specific trip