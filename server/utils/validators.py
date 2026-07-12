import re
from datetime import date, datetime
from models import Vehicle, Driver, Trip


def validate_vehicle_data(data):
    """
    Validate vehicle data.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Registration number validation
    if not data.get('registration_number'):
        errors['registration_number'] = 'Registration number is required'
    elif len(data['registration_number']) > 50:
        errors['registration_number'] = 'Registration number must be less than 50 characters'

    # Model name validation
    if not data.get('name_model'):
        errors['name_model'] = 'Model name is required'
    elif len(data['name_model']) > 100:
        errors['name_model'] = 'Model name must be less than 100 characters'

    # Type validation
    valid_types = ['Truck', 'Van', 'Bus', 'Car']
    if not data.get('type'):
        errors['type'] = 'Vehicle type is required'
    elif data['type'] not in valid_types:
        errors['type'] = f'Vehicle type must be one of: {", ".join(valid_types)}'

    # Max load capacity validation
    try:
        max_load = float(data.get('max_load_capacity', 0))
        if max_load <= 0:
            errors['max_load_capacity'] = 'Maximum load capacity must be greater than 0'
    except (ValueError, TypeError):
        errors['max_load_capacity'] = 'Maximum load capacity must be a valid number'

    # Acquisition cost validation
    try:
        cost = float(data.get('acquisition_cost', 0))
        if cost < 0:
            errors['acquisition_cost'] = 'Acquisition cost cannot be negative'
    except (ValueError, TypeError):
        errors['acquisition_cost'] = 'Acquisition cost must be a valid number'

    return len(errors) == 0, errors


def validate_driver_data(data):
    """
    Validate driver data.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Name validation
    if not data.get('name'):
        errors['name'] = 'Driver name is required'
    elif len(data['name']) > 100:
        errors['name'] = 'Driver name must be less than 100 characters'

    # License number validation
    if not data.get('license_number'):
        errors['license_number'] = 'License number is required'
    elif len(data['license_number']) > 50:
        errors['license_number'] = 'License number must be less than 50 characters'

    # License category validation
    if not data.get('license_category'):
        errors['license_category'] = 'License category is required'
    elif len(data['license_category']) > 20:
        errors['license_category'] = 'License category must be less than 20 characters'

    # License expiry date validation
    if not data.get('license_expiry_date'):
        errors['license_expiry_date'] = 'License expiry date is required'
    else:
        try:
            expiry_date = datetime.strptime(data['license_expiry_date'], '%Y-%m-%d').date()
            if expiry_date < date.today():
                errors['license_expiry_date'] = 'License expiry date must be in the future'
        except ValueError:
            errors['license_expiry_date'] = 'Invalid date format. Use YYYY-MM-DD'

    # Contact number validation
    if data.get('contact_number') and len(data['contact_number']) > 20:
        errors['contact_number'] = 'Contact number must be less than 20 characters'

    # Safety score validation
    try:
        safety_score = float(data.get('safety_score', 100))
        if safety_score < 0 or safety_score > 100:
            errors['safety_score'] = 'Safety score must be between 0 and 100'
    except (ValueError, TypeError):
        errors['safety_score'] = 'Safety score must be a valid number'

    return len(errors) == 0, errors


def validate_trip_data(data):
    """
    Validate trip data.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Source validation
    if not data.get('source'):
        errors['source'] = 'Source is required'
    elif len(data['source']) > 100:
        errors['source'] = 'Source must be less than 100 characters'

    # Destination validation
    if not data.get('destination'):
        errors['destination'] = 'Destination is required'
    elif len(data['destination']) > 100:
        errors['destination'] = 'Destination must be less than 100 characters'

    # Cargo weight validation
    try:
        cargo_weight = float(data.get('cargo_weight', 0))
        if cargo_weight <= 0:
            errors['cargo_weight'] = 'Cargo weight must be greater than 0'
    except (ValueError, TypeError):
        errors['cargo_weight'] = 'Cargo weight must be a valid number'

    # Planned distance validation
    try:
        planned_distance = float(data.get('planned_distance', 0))
        if planned_distance <= 0:
            errors['planned_distance'] = 'Planned distance must be greater than 0'
    except (ValueError, TypeError):
        errors['planned_distance'] = 'Planned distance must be a valid number'

    # Revenue validation (optional)
    if data.get('revenue'):
        try:
            revenue = float(data['revenue'])
            if revenue < 0:
                errors['revenue'] = 'Revenue cannot be negative'
        except (ValueError, TypeError):
            errors['revenue'] = 'Revenue must be a valid number'

    return len(errors) == 0, errors


def validate_maintenance_log_data(data):
    """
    Validate maintenance log data.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Description validation
    if not data.get('description'):
        errors['description'] = 'Description is required'
    elif len(data['description']) > 255:
        errors['description'] = 'Description must be less than 255 characters'

    # Cost validation
    try:
        cost = float(data.get('cost', 0))
        if cost < 0:
            errors['cost'] = 'Cost cannot be negative'
    except (ValueError, TypeError):
        errors['cost'] = 'Cost must be a valid number'

    # Status validation
    valid_statuses = ['Active', 'Completed']
    status = data.get('status', 'Active')
    if status not in valid_statuses:
        errors['status'] = f'Status must be one of: {", ".join(valid_statuses)}'

    # Date validation
    if data.get('scheduled_date'):
        try:
            datetime.strptime(data['scheduled_date'], '%Y-%m-%d')
        except ValueError:
            errors['scheduled_date'] = 'Invalid date format. Use YYYY-MM-DD'

    if data.get('completed_date'):
        try:
            datetime.strptime(data['completed_date'], '%Y-%m-%d')
        except ValueError:
            errors['completed_date'] = 'Invalid date format. Use YYYY-MM-DD'

    return len(errors) == 0, errors


def validate_fuel_log_data(data):
    """
    Validate fuel log data.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Liters validation
    try:
        liters = float(data.get('liters', 0))
        if liters <= 0:
            errors['liters'] = 'Liters must be greater than 0'
    except (ValueError, TypeError):
        errors['liters'] = 'Liters must be a valid number'

    # Cost validation
    try:
        cost = float(data.get('cost', 0))
        if cost <= 0:
            errors['cost'] = 'Cost must be greater than 0'
    except (ValueError, TypeError):
        errors['cost'] = 'Cost must be a valid number'

    # Date validation
    if not data.get('date'):
        errors['date'] = 'Date is required'
    else:
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            errors['date'] = 'Invalid date format. Use YYYY-MM-DD'

    # Odometer reading validation (optional)
    if data.get('odometer_reading'):
        try:
            odometer = float(data['odometer_reading'])
            if odometer < 0:
                errors['odometer_reading'] = 'Odometer reading cannot be negative'
        except (ValueError, TypeError):
            errors['odometer_reading'] = 'Odometer reading must be a valid number'

    return len(errors) == 0, errors


def validate_expense_data(data):
    """
    Validate expense data.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Category validation
    valid_categories = ['Fuel', 'Maintenance', 'Tolls', 'Parking', 'Insurance', 'Other']
    if not data.get('category'):
        errors['category'] = 'Expense category is required'
    elif data['category'] not in valid_categories:
        errors['category'] = f'Expense category must be one of: {", ".join(valid_categories)}'

    # Amount validation
    try:
        amount = float(data.get('amount', 0))
        if amount <= 0:
            errors['amount'] = 'Amount must be greater than 0'
    except (ValueError, TypeError):
        errors['amount'] = 'Amount must be a valid number'

    # Date validation
    if not data.get('date'):
        errors['date'] = 'Date is required'
    else:
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            errors['date'] = 'Invalid date format. Use YYYY-MM-DD'

    # Description validation
    if data.get('description') and len(data['description']) > 255:
        errors['description'] = 'Description must be less than 255 characters'

    return len(errors) == 0, errors


def validate_pagination_args(page, per_page):
    """
    Validate pagination arguments.
    Returns tuple (is_valid, errors_dict, corrected_values)
    """
    errors = {}
    corrected_page = page
    corrected_per_page = per_page

    # Validate page
    try:
        page = int(page)
        if page < 1:
            errors['page'] = 'Page number must be greater than 0'
            corrected_page = 1
    except (ValueError, TypeError):
        errors['page'] = 'Page number must be a valid integer'
        corrected_page = 1

    # Validate per_page
    try:
        per_page = int(per_page)
        if per_page < 1:
            errors['per_page'] = 'Items per page must be greater than 0'
            corrected_per_page = 10
        elif per_page > 100:  # Cap maximum items per page
            errors['per_page'] = 'Items per page cannot exceed 100'
            corrected_per_page = 100
    except (ValueError, TypeError):
        errors['per_page'] = 'Items per page must be a valid integer'
        corrected_per_page = 10

    is_valid = len([e for e in errors.values() if e]) == 0
    return is_valid, errors, {'page': corrected_page, 'per_page': corrected_per_page}


# Business rule validation functions
def validate_trip_business_rules(vehicle_id, driver_id, cargo_weight):
    """
    Validate business rules for trip creation/dispatch.
    Returns tuple (is_valid, errors_dict)
    """
    errors = {}

    # Check if vehicle exists and is available
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        errors['vehicle_id'] = 'Vehicle not found'
    elif vehicle.status != 'Available':
        errors['vehicle_status'] = f'Vehicle is not available (current status: {vehicle.status})'

    # Check if driver exists and is available
    driver = Driver.query.get(driver_id)
    if not driver:
        errors['driver_id'] = 'Driver not found'
    elif driver.status != 'Available':
        errors['driver_status'] = f'Driver is not available (current status: {driver.status})'
    elif driver.license_expiry_date < date.today():
        errors['license_expired'] = 'Driver license has expired'

    # Check cargo weight against vehicle capacity
    if vehicle and cargo_weight is not None:
        try:
            weight = float(cargo_weight)
            if weight > vehicle.max_load_capacity:
                errors['cargo_weight'] = f'Cargo weight ({weight} kg) exceeds vehicle maximum load capacity ({vehicle.max_load_capacity} kg)'
        except (ValueError, TypeError):
            errors['cargo_weight'] = 'Cargo weight must be a valid number'

    return len(errors) == 0, errors