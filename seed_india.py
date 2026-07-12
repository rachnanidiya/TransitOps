from server.app import create_app
from models import db, User, Vehicle, Driver, Trip, MaintenanceLog, Expense
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

app = create_app()

INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"
]

DRIVER_NAMES = [
    "Rajesh Kumar", "Suresh Singh", "Ramesh Patel", "Vikram Sharma",
    "Mohammed Ali", "Gurpreet Singh", "Amit Yadav", "Sunil Deshmukh",
    "Manoj Tiwari", "Anil Gupta", "Prakash Rao", "Dinesh Reddy"
]

def seed_database():
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.session.query(Expense).delete()
        db.session.query(MaintenanceLog).delete()
        db.session.query(Trip).delete()
        db.session.query(Driver).delete()
        db.session.query(Vehicle).delete()
        db.session.query(User).delete()
        db.session.commit()

        # 1. Add Admin User
        print("Adding Admin User...")
        admin = User(
            name='Admin',
            email='admin@transitops.com',
            password_hash=generate_password_hash('password123'),
            role='fleet_manager'
        )
        db.session.add(admin)

        # 2. Add Vehicles (Indian Commercial Vehicles)
        print("Adding Vehicles...")
        vehicles_data = [
            {"reg": "MH-04-AB-1234", "model": "Tata Prima 4028.S", "type": "Truck", "cap": 40000, "cost": 3200000},
            {"reg": "DL-1M-CD-5678", "model": "Ashok Leyland 3118", "type": "Truck", "cap": 31000, "cost": 2800000},
            {"reg": "KA-01-EF-9012", "model": "Mahindra Bolero Pik-Up", "type": "Van", "cap": 1700, "cost": 950000},
            {"reg": "TN-09-GH-3456", "model": "Tata Ace Gold", "type": "Van", "cap": 750, "cost": 500000},
            {"reg": "GJ-05-IJ-7890", "model": "Force Traveller 3350", "type": "Bus", "cap": 3500, "cost": 1500000},
            {"reg": "TS-07-KL-1234", "model": "Maruti Suzuki Eeco Cargo", "type": "Van", "cap": 500, "cost": 550000},
            {"reg": "UP-32-MN-5678", "model": "Eicher Pro 2049", "type": "Truck", "cap": 4900, "cost": 1100000},
            {"reg": "WB-02-OP-9012", "model": "Ashok Leyland Dost+", "type": "Van", "cap": 1500, "cost": 850000},
        ]
        
        vehicles = []
        for v in vehicles_data:
            vehicle = Vehicle(
                registration_number=v["reg"],
                name_model=v["model"],
                type=v["type"],
                max_load_capacity=v["cap"],
                acquisition_cost=v["cost"],
                odometer=random.randint(10000, 150000),
                status=random.choices(['Available', 'Available', 'On Trip', 'In Shop'], weights=[50, 20, 20, 10])[0]
            )
            db.session.add(vehicle)
            vehicles.append(vehicle)
        
        db.session.commit()

        # 3. Add Drivers
        print("Adding Drivers...")
        drivers = []
        for i, name in enumerate(DRIVER_NAMES):
            cat = random.choice(['HMV', 'LMV', 'Transport'])
            driver = Driver(
                name=name,
                license_number=f"DL-{random.randint(10,99)}-{random.randint(2010,2023)}-{random.randint(1000000,9999999)}",
                license_category=cat,
                license_expiry_date=(datetime.now() + timedelta(days=random.randint(100, 1500))).date(),
                contact_number=f"+91 {random.randint(9000000000, 9999999999)}",
                safety_score=random.randint(65, 100),
                status=random.choices(['Available', 'Available', 'On Trip', 'Off Duty'], weights=[50, 20, 20, 10])[0]
            )
            db.session.add(driver)
            drivers.append(driver)
        
        db.session.commit()

        # 4. Add Trips
        print("Adding Trips...")
        now = datetime.now()
        statuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled']
        
        for _ in range(30):
            source = random.choice(INDIAN_CITIES)
            dest = random.choice([c for c in INDIAN_CITIES if c != source])
            v = random.choice(vehicles)
            d = random.choice(drivers)
            
            distance = random.uniform(150, 1200)
            status = random.choices(statuses, weights=[10, 20, 60, 10])[0]
            
            trip = Trip(
                source=source,
                destination=dest,
                vehicle_id=v.id,
                driver_id=d.id,
                cargo_weight=random.uniform(v.max_load_capacity * 0.5, v.max_load_capacity),
                planned_distance=round(distance, 1),
                actual_distance=round(distance * random.uniform(0.95, 1.1), 1) if status == 'Completed' else None,
                revenue=round(distance * random.uniform(30, 80), 2), # Rs 30-80 per km
                status=status,
                created_at=now - timedelta(days=random.randint(1, 60))
            )
            if status in ['Dispatched', 'Completed']:
                trip.dispatched_at = trip.created_at + timedelta(hours=random.randint(1, 24))
            if status == 'Completed':
                trip.completed_at = trip.dispatched_at + timedelta(hours=distance/40) # avg 40kmph
                
            db.session.add(trip)
            
        db.session.commit()

        # 5. Add Expenses
        print("Adding Expenses...")
        expense_categories = ['Toll', 'Fuel', 'Driver Meals', 'Permits', 'Maintenance', 'Parking']
        trips = Trip.query.all()
        
        for _ in range(50):
            v = random.choice(vehicles)
            t = random.choice(trips) if random.random() > 0.3 else None
            cat = random.choice(expense_categories)
            
            # Realistic INR amounts
            amount = 0
            if cat == 'Toll': amount = random.randint(500, 3000)
            elif cat == 'Fuel': amount = random.randint(3000, 15000)
            elif cat == 'Driver Meals': amount = random.randint(200, 1000)
            elif cat == 'Permits': amount = random.randint(1000, 5000)
            elif cat == 'Maintenance': amount = random.randint(2000, 25000)
            elif cat == 'Parking': amount = random.randint(100, 500)
            
            expense = Expense(
                vehicle_id=v.id,
                trip_id=t.id if t else None,
                category=cat,
                amount=amount,
                date=(now - timedelta(days=random.randint(1, 60))).date()
            )
            db.session.add(expense)
            
        db.session.commit()

        # 6. Add Maintenance Logs
        print("Adding Maintenance Logs...")
        m_types = ['Oil Change', 'Tire Replacement', 'Engine Repair', 'General Service', 'Brake Service']
        
        for _ in range(15):
            v = random.choice(vehicles)
            t_type = random.choice(m_types)
            status = random.choice(['Active', 'Completed'])
            
            cost = 0
            if t_type == 'Oil Change': cost = random.randint(1500, 4000)
            elif t_type == 'Tire Replacement': cost = random.randint(12000, 40000)
            elif t_type == 'Engine Repair': cost = random.randint(25000, 80000)
            else: cost = random.randint(3000, 15000)
            
            log = MaintenanceLog(
                vehicle_id=v.id,
                type=t_type,
                description=f"Routine {t_type.lower()} for {v.name_model}",
                cost=cost if status == 'Completed' else 0,
                status=status,
                scheduled_date=(now + timedelta(days=random.randint(-30, 15))).date()
            )
            db.session.add(log)
            
        db.session.commit()
        print("Indian database seed completed successfully!")

if __name__ == '__main__':
    seed_database()
