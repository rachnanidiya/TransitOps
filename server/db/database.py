from models import db
from flask import current_app


def init_db(app):
    """Initialize the database with the Flask app."""
    with app.app_context():
        # Create all tables based on models
        db.create_all()

        # Seed initial data
        seed_data()


def get_db():
    """Get the SQLAlchemy database instance."""
    return db


def seed_data():
    """Seed the database with initial data."""
    from models import User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
    from werkzeug.security import generate_password_hash
    from datetime import date, datetime

    # Check if we already have data
    if User.query.first() is not None:
        return  # Database already seeded

    try:
        # Create sample users (role stored directly as text)
        users = [
            User(
                email='fleet.manager@transitops.com',
                password_hash=generate_password_hash('fleet123'),
                name='Fleet Manager',
                role='fleet_manager'
            ),
            User(
                email='dispatcher@transitops.com',
                password_hash=generate_password_hash('dispatch123'),
                name='Dispatcher',
                role='dispatcher'
            ),
            User(
                email='safety.officer@transitops.com',
                password_hash=generate_password_hash('safety123'),
                name='Safety Officer',
                role='safety_officer'
            ),
            User(
                email='financial.analyst@transitops.com',
                password_hash=generate_password_hash('finance123'),
                name='Financial Analyst',
                role='financial_analyst'
            )
        ]

        for user in users:
            db.session.add(user)

        # Create sample vehicles
        vehicles = [
            Vehicle(
                registration_number='TRK-001',
                name_model='Volvo FH16',
                type='Truck',
                max_load_capacity=20000,
                odometer=50215,
                acquisition_cost=120000,
                status='Available'
            ),
            Vehicle(
                registration_number='TRK-002',
                name_model='Scania R450',
                type='Truck',
                max_load_capacity=18000,
                odometer=75120,
                acquisition_cost=110000,
                status='Available'
            ),
            Vehicle(
                registration_number='VAN-001',
                name_model='Mercedes Sprinter',
                type='Van',
                max_load_capacity=1500,
                acquisition_cost=35000,
                status='Available'
            ),
            Vehicle(
                registration_number='VAN-002',
                name_model='Ford Transit',
                type='Van',
                max_load_capacity=1200,
                acquisition_cost=32000,
                status='Available'
            ),
            Vehicle(
                registration_number='BUS-001',
                name_model='Volvo B8R',
                type='Bus',
                max_load_capacity=8000,
                acquisition_cost=250000,
                status='Available'
            ),
            Vehicle(
                registration_number='BUS-002',
                name_model='Mercedes Tourismo',
                type='Bus',
                max_load_capacity=7500,
                acquisition_cost=230000,
                status='Available'
            ),
            Vehicle(
                registration_number='CAR-001',
                name_model='Toyota Corolla',
                type='Car',
                max_load_capacity=500,
                acquisition_cost=20000,
                status='Available'
            ),
            Vehicle(
                registration_number='CAR-002',
                name_model='Honda Civic',
                type='Car',
                max_load_capacity=450,
                acquisition_cost=18000,
                status='In Shop'
            )
        ]

        for vehicle in vehicles:
            db.session.add(vehicle)

        # Create sample drivers with future expiry dates
        drivers = [
            Driver(
                name='John Smith',
                license_number='DL-001',
                license_category='C',
                license_expiry_date=date(2027, 12, 31),
                contact_number='555-0101',
                safety_score=95,
                status='Available'
            ),
            Driver(
                name='Maria Garcia',
                license_number='DL-002',
                license_category='B',
                license_expiry_date=date(2027, 6, 15),
                contact_number='555-0102',
                safety_score=98,
                status='Available'
            ),
            Driver(
                name='Robert Johnson',
                license_number='DL-003',
                license_category='C',
                license_expiry_date=date(2027, 3, 22),
                contact_number='555-0103',
                safety_score=92,
                status='Available'
            ),
            Driver(
                name='David Wilson',
                license_number='DL-004',
                license_category='C',
                license_expiry_date=date(2027, 11, 30),
                contact_number='555-0104',
                safety_score=88,
                status='Off Duty'
            ),
            Driver(
                name='Sarah Davis',
                license_number='DL-005',
                license_category='B',
                license_expiry_date=date(2025, 8, 20),
                contact_number='555-0105',
                safety_score=96,
                status='Suspended'
            ),
            Driver(
                name='Alex Turner',
                license_number='DL-006',
                license_category='C',
                license_expiry_date=date(2028, 1, 15),
                contact_number='555-0106',
                safety_score=91,
                status='Available'
            )
        ]

        for driver in drivers:
            db.session.add(driver)

        db.session.commit()

        # Create sample trips (after vehicles and drivers are committed so IDs exist)
        trips = [
            Trip(
                source='New York',
                destination='Boston',
                vehicle_id=1,
                driver_id=1,
                cargo_weight=5000,
                planned_distance=215,
                actual_distance=215,
                fuel_consumed=35.5,
                revenue=500,
                status='Completed',
                dispatched_at=datetime(2024, 5, 15, 8, 0, 0),
                completed_at=datetime(2024, 5, 15, 12, 0, 0)
            ),
            Trip(
                source='Los Angeles',
                destination='San Diego',
                vehicle_id=2,
                driver_id=2,
                cargo_weight=8000,
                planned_distance=120,
                actual_distance=120,
                fuel_consumed=18.2,
                revenue=300,
                status='Completed',
                dispatched_at=datetime(2024, 5, 14, 7, 30, 0),
                completed_at=datetime(2024, 5, 14, 10, 30, 0)
            ),
            Trip(
                source='Chicago',
                destination='Detroit',
                vehicle_id=3,
                driver_id=3,
                cargo_weight=800,
                planned_distance=280,
                status='Draft'
            ),
            Trip(
                source='Miami',
                destination='Orlando',
                vehicle_id=4,
                driver_id=1,
                cargo_weight=600,
                planned_distance=230,
                revenue=350,
                status='Draft'
            ),
            Trip(
                source='Seattle',
                destination='Portland',
                vehicle_id=5,
                driver_id=2,
                cargo_weight=4000,
                planned_distance=175,
                revenue=275,
                status='Draft'
            ),
            Trip(
                source='Houston',
                destination='Dallas',
                vehicle_id=6,
                driver_id=3,
                cargo_weight=6000,
                planned_distance=240,
                revenue=400,
                status='Draft'
            ),
        ]

        for trip in trips:
            db.session.add(trip)

        # Create sample maintenance logs
        maintenance_logs = [
            MaintenanceLog(
                vehicle_id=1,
                type='Oil Change',
                description='Regular oil and filter change',
                cost=75.00,
                status='Completed',
                scheduled_date=date(2024, 5, 1),
                completed_date=date(2024, 5, 1)
            ),
            MaintenanceLog(
                vehicle_id=2,
                type='Tire Rotation',
                description='Rotate all tires and check pressure',
                cost=50.00,
                status='Completed',
                scheduled_date=date(2024, 5, 5),
                completed_date=date(2024, 5, 5)
            ),
            MaintenanceLog(
                vehicle_id=8,
                type='Engine Diagnostic',
                description='Check engine light diagnosis',
                cost=150.00,
                status='Active',
                scheduled_date=date(2024, 5, 10)
            ),
        ]

        for log in maintenance_logs:
            db.session.add(log)

        # Create sample fuel logs
        fuel_logs = [
            FuelLog(
                vehicle_id=1,
                trip_id=1,
                liters=65.2,
                cost=120.00,
                date=date(2024, 5, 15),
                odometer_reading=50215
            ),
            FuelLog(
                vehicle_id=2,
                trip_id=2,
                liters=28.5,
                cost=55.00,
                date=date(2024, 5, 14),
                odometer_reading=75120
            ),
            FuelLog(
                vehicle_id=1,
                trip_id=None,
                liters=50.0,
                cost=92.00,
                date=date(2024, 5, 10),
                odometer_reading=50100
            ),
            FuelLog(
                vehicle_id=2,
                trip_id=None,
                liters=40.0,
                cost=78.00,
                date=date(2024, 5, 12),
                odometer_reading=75080
            )
        ]

        for log in fuel_logs:
            db.session.add(log)

        # Create sample expenses
        expenses = [
            Expense(
                vehicle_id=1,
                trip_id=1,
                category='Fuel',
                description='Diesel fuel for trip',
                amount=120.00,
                date=date(2024, 5, 15)
            ),
            Expense(
                vehicle_id=2,
                trip_id=2,
                category='Fuel',
                description='Gasoline for trip',
                amount=55.00,
                date=date(2024, 5, 14)
            ),
            Expense(
                vehicle_id=1,
                trip_id=None,
                category='Maintenance',
                description='Oil change service',
                amount=75.00,
                date=date(2024, 5, 1)
            ),
            Expense(
                vehicle_id=3,
                trip_id=None,
                category='Tolls',
                description='Highway tolls',
                amount=25.00,
                date=date(2024, 5, 10)
            ),
            Expense(
                vehicle_id=2,
                trip_id=None,
                category='Parking',
                description='Downtown parking',
                amount=15.00,
                date=date(2024, 5, 8)
            )
        ]

        for expense in expenses:
            db.session.add(expense)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        raise e